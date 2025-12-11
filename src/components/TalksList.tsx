import { useEffect, useState } from "react";
import { fetchTalksIndex } from "../api/talks";
import { TalkMetadata } from "../types/talk";
import TalkCard from "./TalkCard";

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

  useEffect(() => {
    if (initialTalks) {
      setTalks(initialTalks);
      setIsLoading(false);
      setFetchError(error ?? null);
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

  return (
    <div className="cards-grid">
      {talks.map((talk) => (
        <TalkCard key={talk.id} talk={talk} onOpen={onSelect} />
      ))}
    </div>
  );
}

export default TalksList;
