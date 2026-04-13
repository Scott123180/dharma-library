import { useEffect, useMemo, useRef, useState } from "react";
import { searchTalks } from "../api/search";
import { SearchBar, SearchFilters, SearchResults } from "../components/search";
import {
  DEFAULT_FILTERS,
  EnrichedResult,
  hasActiveFilters,
  SearchFilters as SearchFiltersType,
  SearchStatus,
} from "../types/search";
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
  return new URLSearchParams(window.location.search).get("q") ?? "";
}

function getInitialFilters(): SearchFiltersType {
  if (typeof window === "undefined") return DEFAULT_FILTERS;
  const p = new URLSearchParams(window.location.search);
  return {
    speaker: p.get("speaker") ?? "",
    location: p.get("location") ?? "",
    yearFrom: p.get("yearFrom") ?? "",
    yearTo: p.get("yearTo") ?? "",
  };
}

function buildFilter(filters: SearchFiltersType): Record<string, unknown> | undefined {
  const conditions: Record<string, unknown>[] = [];

  if (filters.speaker) {
    conditions.push({ speaker: { $eq: filters.speaker } });
  }

  if (filters.location) {
    conditions.push({ location: { $eq: filters.location } });
  }

  const yearFrom = filters.yearFrom ? parseInt(filters.yearFrom) : null;
  const yearTo = filters.yearTo ? parseInt(filters.yearTo) : null;

  if (yearFrom !== null && yearTo !== null) {
    conditions.push({ year: { $gte: yearFrom, $lte: yearTo } });
  } else if (yearFrom !== null) {
    conditions.push({ year: { $gte: yearFrom } });
  } else if (yearTo !== null) {
    conditions.push({ year: { $lte: yearTo } });
  }

  if (conditions.length === 0) return undefined;
  if (conditions.length === 1) return conditions[0];
  return { $and: conditions };
}

function syncUrl(q: string, filters: SearchFiltersType) {
  const params = new URLSearchParams();
  if (q.trim()) params.set("q", q.trim());
  if (filters.speaker) params.set("speaker", filters.speaker);
  if (filters.location) params.set("location", filters.location);
  if (filters.yearFrom) params.set("yearFrom", filters.yearFrom);
  if (filters.yearTo) params.set("yearTo", filters.yearTo);

  const search = params.toString();
  const url = search ? `/search-talks?${search}` : "/search-talks";
  // replaceState: filter/query params reflect state on this page, not a new
  // navigation — keeps the back button pointing to wherever the user came from.
  if (window.location.pathname + window.location.search !== url) {
    window.history.replaceState({}, "", url);
  }
}

type PendingSearch = { q: string; filters: SearchFiltersType };

function SearchTalksPage({ talksIndex, indexLoading, onSelectTalk }: Props) {
  const [query, setQuery] = useState(getInitialQuery);
  const [filters, setFilters] = useState<SearchFiltersType>(getInitialFilters);
  const [status, setStatus] = useState<SearchStatus>("idle");
  const [results, setResults] = useState<EnrichedResult[]>([]);
  const pendingAutoSearch = useRef<PendingSearch | null>(null);

  const speakers = useMemo(() => {
    const set = new Set<string>();
    for (const talk of talksIndex) {
      const s = talk.speaker ?? talk.teacher;
      if (s && s !== "Other") set.add(s);
    }
    return Array.from(set).sort();
  }, [talksIndex]);

  // Location values come from the talk_metadata.json ingest — not in the talks index.
  const locations = ["Zen Center of New York City", "Zen Mountain Monastery"];

  const runSearch = async (q: string, activeFilters: SearchFiltersType, skipCache = false) => {
    const trimmed = q.trim();
    if (!trimmed) {
      setStatus("idle");
      setResults([]);
      syncUrl("", activeFilters);
      return;
    }

    const filter = buildFilter(activeFilters);
    syncUrl(trimmed, activeFilters);

    if (!skipCache) {
      const cached = getCachedResults(trimmed, filter);
      if (cached) {
        setResults(cached);
        setStatus("success");
        return;
      }
    }

    setStatus("loading");

    try {
      const raw = await searchTalks(trimmed, 10, filter);
      const map = buildMetadataMap(talksIndex);
      const enriched = enrichResults(raw, map);
      cacheResults(trimmed, enriched, filter);
      setResults(enriched);
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  // Auto-search from URL params on mount — defer until catalog is ready
  useEffect(() => {
    const initial = getInitialQuery();
    if (!initial) return;

    const initialFilters = getInitialFilters();
    if (indexLoading) {
      pendingAutoSearch.current = { q: initial, filters: initialFilters };
    } else {
      runSearch(initial, initialFilters);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!indexLoading && pendingAutoSearch.current) {
      const { q, filters: f } = pendingAutoSearch.current;
      pendingAutoSearch.current = null;
      runSearch(q, f);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [indexLoading]);

  const handleSubmit = () => {
    runSearch(query, filters);
  };

  const handleRetry = () => {
    runSearch(query, filters, true);
  };

  const isLoading = status === "loading";
  const filtersActive = hasActiveFilters(filters);

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
      <SearchFilters
        filters={filters}
        onChange={setFilters}
        speakers={speakers}
        locations={locations}
        disabled={isLoading}
      />
      {filtersActive && status === "success" && (
        <p className="search-filters__active-note">
          Filters applied — results are scoped to your selection.
        </p>
      )}
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
