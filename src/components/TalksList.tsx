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
  const [yearFilter, setYearFilter] = useState("all");
  const [monthFilter, setMonthFilter] = useState("all");
  const [stageFilter, setStageFilter] = useState("all");

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
  }, [searchTerm, teacherFilter, yearFilter, monthFilter, stageFilter]);

  useEffect(() => {
    // Clear month when the year changes so we don't keep stale months.
    setMonthFilter("all");
  }, [yearFilter]);

  useEffect(() => {
    // Reset to the first page when a new set of talks arrives.
    setPage(1);
  }, [talks.length]);

  const resolvedLoading = loading ?? isLoading;
  const resolvedError = error ?? fetchError;

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

  const getDateParts = (value?: string) => {
    if (!value) return null;
    const datePart = value.trim().split(" ")[0];
    const [yearStr, monthStr] = datePart.split("-");
    const year = Number(yearStr);
    const month = Number(monthStr);
    if (!Number.isInteger(year) || !Number.isInteger(month)) return null;
    if (month < 1 || month > 12) return null;
    return { year, month };
  };

  const yearOptions = useMemo(() => {
    const set = new Set<number>();
    talks.forEach((talk) => {
      const parts = getDateParts(talk.date);
      if (parts) {
        set.add(parts.year);
      }
    });
    return Array.from(set).sort((a, b) => b - a);
  }, [talks]);

  const monthLabels = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
  ];

  const stageOptions = [
    { value: "0", label: "Unknown or unprocessed" },
    { value: "1", label: "Audio only" },
    { value: "2", label: "Raw transcript" },
    { value: "3", label: "Structured transcript" },
    { value: "4", label: "Cleaned transcript" }
  ];

  const monthOptions = useMemo(() => {
    if (yearFilter === "all") return [];
    const yearNumber = Number(yearFilter);
    const set = new Set<number>();
    talks.forEach((talk) => {
      const parts = getDateParts(talk.date);
      if (parts && parts.year === yearNumber) {
        set.add(parts.month);
      }
    });
    return Array.from(set).sort((a, b) => a - b);
  }, [talks, yearFilter]);

  const filteredTalks = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return talks.filter((talk) => {
      const matchesTeacher = teacherFilter === "all" || teacherLabel(talk) === teacherFilter;
      const title = (talk.title || "").toLowerCase();
      const matchesSearch = term === "" || title.includes(term);
      const parts = getDateParts(talk.date);
      const matchesYear =
        yearFilter === "all" || (parts && String(parts.year) === yearFilter);
      const matchesMonth =
        monthFilter === "all" || (parts && parts.month === Number(monthFilter));
      const stageValue = talk.ts ?? 0;
      const matchesStage = stageFilter === "all" || String(stageValue) === stageFilter;
      return matchesTeacher && matchesSearch && matchesYear && matchesMonth && matchesStage;
    });
  }, [talks, searchTerm, teacherFilter, yearFilter, monthFilter, stageFilter]);

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
        <label className="filter">
          <span className="filter__label">Year</span>
          <select
            className="input"
            value={yearFilter}
            onChange={(event) => setYearFilter(event.target.value)}
          >
            <option value="all">Any year</option>
            {yearOptions.map((year) => (
              <option key={year} value={String(year)}>
                {year}
              </option>
            ))}
          </select>
        </label>
        <label className="filter">
          <span className="filter__label">Month</span>
          <select
            className="input"
            value={monthFilter}
            onChange={(event) => setMonthFilter(event.target.value)}
            disabled={yearFilter === "all"}
          >
            <option value="all">
              {yearFilter === "all" ? "Select a year first" : "Any month"}
            </option>
            {monthOptions.map((month) => (
              <option key={month} value={String(month)}>
                {monthLabels[month - 1]}
              </option>
            ))}
          </select>
        </label>
        <label className="filter">
          <span className="filter__label">Transcript stage</span>
          <select
            className="input"
            value={stageFilter}
            onChange={(event) => setStageFilter(event.target.value)}
          >
            <option value="all">Any stage</option>
            {stageOptions.map((stage) => (
              <option key={stage.value} value={stage.value}>
                {stage.label}
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
  );
}

export default TalksList;
