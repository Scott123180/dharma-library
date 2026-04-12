import { useEffect, useRef, useState } from "react";
import { searchTalks } from "../api/search";
import { SearchBar, SearchResults } from "../components/search";
import { EnrichedResult, SearchStatus } from "../types/search";
import { TalkMetadata } from "../types/talk";
import { buildMetadataMap } from "../utils/metadataMap";
import { enrichResults } from "../utils/enrichResults";
import { getCachedResults, cacheResults } from "../utils/searchCache";
import { supportsTextFragments } from "../utils/textFragments";

type Props = {
  talksIndex: TalkMetadata[];
  indexLoading: boolean;
  onSelectTalk: (id: string) => void;
};

function getInitialQuery(): string {
  if (typeof window === "undefined") return "";
  const params = new URLSearchParams(window.location.search);
  return params.get("q") ?? "";
}

function SearchTalksPage({ talksIndex, indexLoading, onSelectTalk }: Props) {
  const [query, setQuery] = useState(getInitialQuery);
  const [status, setStatus] = useState<SearchStatus>("idle");
  const [results, setResults] = useState<EnrichedResult[]>([]);
  const pendingAutoSearch = useRef<string | null>(null);

  // Sync URL with query after successful search
  const syncUrl = (q: string) => {
    const url = q.trim()
      ? `/search-talks?q=${encodeURIComponent(q.trim())}`
      : "/search-talks";
    if (window.location.pathname + window.location.search !== url) {
      window.history.pushState({}, "", url);
    }
  };

  const runSearch = async (q: string, skipCache = false) => {
    const trimmed = q.trim();
    if (!trimmed) {
      setStatus("idle");
      setResults([]);
      syncUrl("");
      return;
    }

    if (!skipCache) {
      const cached = getCachedResults(trimmed);
      if (cached) {
        setResults(cached);
        setStatus("success");
        syncUrl(trimmed);
        return;
      }
    }

    setStatus("loading");
    syncUrl(trimmed);

    try {
      const raw = await searchTalks(trimmed);
      const map = buildMetadataMap(talksIndex);
      const enriched = enrichResults(raw, map);
      cacheResults(trimmed, enriched);
      setResults(enriched);
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  // Auto-search from URL ?q= on mount — defer until catalog is ready
  useEffect(() => {
    const initial = getInitialQuery();
    if (!initial) return;

    if (indexLoading) {
      pendingAutoSearch.current = initial;
    } else {
      runSearch(initial);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!indexLoading && pendingAutoSearch.current) {
      const q = pendingAutoSearch.current;
      pendingAutoSearch.current = null;
      runSearch(q);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [indexLoading]);

  const handleSubmit = () => {
    runSearch(query);
  };

  const handleRetry = () => {
    runSearch(query, true);
  };

  const isLoading = status === "loading";

  return (
    <section className="search-talks-page">
      <div className="search-talks-page__header">
        <h1>Search Talks</h1>
        <p className="search-talks-page__subtitle">
          Find teachings by theme, topic, or passage.
        </p>
      </div>
      <SearchBar
        value={query}
        onChange={setQuery}
        onSubmit={handleSubmit}
        disabled={isLoading}
      />
      <SearchResults
        status={status}
        results={results}
        onOpen={onSelectTalk}
        onRetry={handleRetry}
        supportsTextFragments={supportsTextFragments()}
      />
    </section>
  );
}

export default SearchTalksPage;
