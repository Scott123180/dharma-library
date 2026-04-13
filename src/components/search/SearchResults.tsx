import { EnrichedResult, SearchStatus } from "../../types/search";
import SearchResultCard from "./SearchResultCard";

type Props = {
  status: SearchStatus;
  results: EnrichedResult[];
  onOpen: (talkId: string) => void;
  onRetry: () => void;
  supportsTextFragments: boolean;
};

function SearchResults({ status, results, onOpen, onRetry, supportsTextFragments }: Props) {
  if (status === "idle") {
    return (
      <div className="search-empty-state">
        <p>Enter a question or phrase to search the talks.</p>
      </div>
    );
  }

  if (status === "loading") {
    return (
      <div className="search-loading" aria-live="polite" aria-label="Searching…">
        <span className="search-loading__spinner" aria-hidden="true" />
        <p>Searching…</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="search-error" role="alert">
        <p>Something went wrong. Please try again.</p>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={onRetry}
        >
          Retry
        </button>
      </div>
    );
  }

  if (status === "success" && results.length === 0) {
    return (
      <div className="search-zero-results">
        <p>No results found. Try a different search term.</p>
      </div>
    );
  }

  return (
    <div className="search-results">
      {results.map((result, i) => (
        <SearchResultCard
          key={`${result.searchResult.talk_id}-${i}`}
          result={result}
          onOpen={onOpen}
          supportsTextFragments={supportsTextFragments}
        />
      ))}
    </div>
  );
}

export default SearchResults;
