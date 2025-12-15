import { useEffect, useState } from "react";
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

  const totalPages = Math.max(1, Math.ceil(talks.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const visibleTalks = talks.slice(startIndex, startIndex + PAGE_SIZE);
  const startLabel = startIndex + 1;
  const endLabel = Math.min(startIndex + PAGE_SIZE, talks.length);

  const goToPage = (next: number) => {
    const clamped = Math.min(Math.max(1, next), totalPages);
    setPage(clamped);
  };

  return (
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
            {talks.length.toLocaleString()} talks
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
