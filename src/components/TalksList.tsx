import { useEffect, useMemo, useState } from "react";
import { fetchTalksIndex } from "../api/talks";
import { TalkMetadata } from "../types/talk";
import TalkCard from "./TalkCard";

const PAGE_SIZE = 24;

type TalksListProps = {
  onSelect?: (id: string) => void;
  initialTalks?: TalkMetadata[];
  loading?: boolean;
  error?: string | null;
};

function TalksList({ onSelect, initialTalks, loading, error }: TalksListProps) {
  const [talks, setTalks] = useState<TalkMetadata[]>(initialTalks ?? []);
  const [isLoading, setIsLoading] = useState<boolean>(loading ?? !initialTalks);
  const [fetchError, setFetchError] = useState<string | null>(error ?? null);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [teacherFilter, setTeacherFilter] = useState("all");

  useEffect(() => {
    if (initialTalks) {
      setTalks(initialTalks);
      setIsLoading(false);
      setFetchError(error ?? null);
      setPage(1);
      return;
    }

    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      try {
        const data = await fetchTalksIndex();
        if (!cancelled) {
          setTalks(data);
          setFetchError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setFetchError(err instanceof Error ? err.message : "Unknown error");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };
    load();

    return () => {
      cancelled = true;
    };
  }, [initialTalks, error]);

  useEffect(() => {
    // Reset to the first page when filter inputs change.
    setPage(1);
  }, [searchTerm, teacherFilter]);

  useEffect(() => {
    // Reset to the first page when a new set of talks arrives.
    setPage(1);
  }, [talks.length]);

  const resolvedLoading = loading ?? isLoading;
  const resolvedError = error ?? fetchError;

  if (resolvedLoading) {
    return <p>Loading talks…</p>;
  }

  if (resolvedError) {
    return <p className="error-text">Failed to load talks: {resolvedError}</p>;
  }

  if (talks.length === 0) {
    return <p>No talks available yet.</p>;
  }

  const teacherLabel = (talk: TalkMetadata) =>
    talk.speaker?.trim() || talk.teacher?.trim() || "Unknown speaker";

  const teacherOptions = useMemo(() => {
    const set = new Set<string>();
    talks.forEach((talk) => {
      const label = teacherLabel(talk);
      set.add(label);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [talks]);

  const filteredTalks = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return talks.filter((talk) => {
      const matchesTeacher = teacherFilter === "all" || teacherLabel(talk) === teacherFilter;
      const matchesSearch = term === "" || talk.title.toLowerCase().includes(term);
      return matchesTeacher && matchesSearch;
    });
  }, [talks, searchTerm, teacherFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredTalks.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const visibleTalks = filteredTalks.slice(startIndex, startIndex + PAGE_SIZE);
  const startLabel = startIndex + 1;
  const endLabel = Math.min(startIndex + PAGE_SIZE, filteredTalks.length);

  const goToPage = (next: number) => {
    const clamped = Math.min(Math.max(1, next), totalPages);
    setPage(clamped);
  };

  return (
    <>
      <div className="filters">
        <label className="filter">
          <span className="filter__label">Search title</span>
          <input
            type="text"
            className="input"
            placeholder="e.g. Heart Sutra"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </label>
        <label className="filter">
          <span className="filter__label">Teacher</span>
          <select
            className="input"
            value={teacherFilter}
            onChange={(event) => setTeacherFilter(event.target.value)}
          >
            <option value="all">Any teacher</option>
            {teacherOptions.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </label>
      </div>

      {filteredTalks.length === 0 ? (
        <p>No talks match your filters yet.</p>
      ) : (
        <>
          <div className="cards-grid">
            {visibleTalks.map((talk) => (
              <TalkCard key={talk.id} talk={talk} onOpen={onSelect} />
            ))}
          </div>
          {totalPages > 1 ? (
            <div className="pagination">
              <div className="pagination__info">
                Showing {startLabel.toLocaleString()}–{endLabel.toLocaleString()} of{" "}
                {filteredTalks.length.toLocaleString()} talks
              </div>
              <div className="pagination__controls">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
                <span className="pagination__page">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </div>
            </div>
          ) : null}
        </>
      )}
    </>
        <div className="pagination">
          <div className="pagination__info">
            Showing {startLabel.toLocaleString()}–{endLabel.toLocaleString()} of{" "}
            {filteredTalks.length.toLocaleString()} talks
          </div>
          <div className="pagination__controls">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <span className="pagination__page">
              Page {currentPage} of {totalPages}
            </span>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}

export default TalksList;
