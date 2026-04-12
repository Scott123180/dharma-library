import { EnrichedResult } from "../../types/search";
import { getRelevanceTier } from "../../utils/relevance";
import RelevanceIndicator from "./RelevanceIndicator";

const CHUNK_PREVIEW_LENGTH = 240;
const OVERVIEW_PREVIEW_LENGTH = 160;

type Props = {
  result: EnrichedResult;
  onOpen: (talkId: string) => void;
  supportsTextFragments: boolean;
};

function SearchResultCard({ result, onOpen, supportsTextFragments }: Props) {
  const { searchResult, metadata } = result;
  const { talk_id, chunk_text, similarity } = searchResult;

  const tier = getRelevanceTier(similarity);

  const title = metadata?.title ?? `Talk ${talk_id}`;
  const teacher = metadata?.speaker ?? metadata?.teacher ?? "Unknown teacher";
  const duration = metadata?.duration ?? null;
  const overview = metadata?.summary ?? null;
  const date = metadata?.date
    ? new Date(metadata.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    : null;

  const chunkPreview =
    chunk_text.length > CHUNK_PREVIEW_LENGTH
      ? chunk_text.slice(0, CHUNK_PREVIEW_LENGTH) + "…"
      : chunk_text;

  const overviewPreview =
    overview && overview.length > OVERVIEW_PREVIEW_LENGTH
      ? overview.slice(0, OVERVIEW_PREVIEW_LENGTH) + "…"
      : overview;

  const encodedFragment = encodeURIComponent(chunk_text.slice(0, 100));
  const jumpHref = `/talk/${talk_id}#:~:text=${encodedFragment}`;

  return (
    <article className="search-result-card">
      <header className="search-result-card__header">
        <RelevanceIndicator tier={tier} />
      </header>

      <p className="chunk-text">{chunkPreview}</p>

      <div className="search-result-card__meta">
        <span className="search-result-card__title">{title}</span>
        <span className="search-result-card__teacher">{teacher}</span>
        {duration && (
          <span className="search-result-card__duration">{duration}</span>
        )}
        {date && (
          <span className="search-result-card__date">{date}</span>
        )}
      </div>

      {overviewPreview && (
        <p className="search-result-card__overview">{overviewPreview}</p>
      )}

      <div className="search-result-card__actions">
        <button
          type="button"
          className="btn btn-primary search-result-card__open"
          onClick={() => onOpen(talk_id)}
          aria-label={`Open ${title}`}
        >
          Open
        </button>
        {supportsTextFragments && (
          <a
            href={jumpHref}
            className="jump-to-text"
            aria-label={`Jump to matching passage in ${title}`}
          >
            Jump to text
          </a>
        )}
      </div>
    </article>
  );
}

export default SearchResultCard;
