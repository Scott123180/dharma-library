import { useEffect, useRef, useState } from "react";
import { fetchTalk } from "../api/talks";
import { Talk } from "../types/talk";

type TalkDetailProps = {
  talkId: string;
  onPlay?: (talk: Talk) => void;
  onInlinePlay?: (talk: Talk) => void;
  onInlineProgress?: (seconds: number) => void;
  inlineActive?: boolean;
  inlinePosition?: number;
  onBack?: () => void;
};

function TalkDetail({
  talkId,
  onPlay,
  onInlinePlay,
  onInlineProgress,
  inlineActive,
  inlinePosition = 0,
  onBack
}: TalkDetailProps) {
  const [talk, setTalk] = useState<Talk | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const data = await fetchTalk(talkId);
        if (!cancelled) {
          setTalk(data);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unknown error");
          setTalk(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };
    load();

    return () => {
      cancelled = true;
    };
  }, [talkId]);

  useEffect(() => {
    if (!inlineActive && audioRef.current) {
      audioRef.current.pause();
    }
  }, [inlineActive]);

  if (loading) {
    return <p>Loading talk…</p>;
  }

  if (error) {
    return <p className="error-text">Failed to load talk: {error}</p>;
  }

  if (!talk) {
    return null;
  }

  const transcriptParagraphs = talk.transcript
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  const metaBits = [talk.teacher, talk.location, talk.date, talk.duration ?? talk.length]
    .filter(Boolean)
    .join(" · ");

  return (
    <article className="talk-detail">
      <div className="talk-detail__header">
        <div>
          <p className="section__eyebrow">Talk</p>
          <h2>{talk.title}</h2>
          {metaBits ? <p className="talk-detail__meta">{metaBits}</p> : null}
          {talk.caption ? <p className="talk-detail__caption">{talk.caption}</p> : null}
        </div>
        <div className="talk-detail__pills">
          {talk.audioUrl ? <span className="pill">Audio</span> : null}
          <span className="pill pill--subtle">Transcript</span>
          {onBack ? (
            <button className="btn btn-ghost" onClick={onBack}>
              Back to list
            </button>
          ) : null}
        </div>
      </div>

      <div className="talk-detail__grid">
        <div className="talk-detail__card">
          <h3>Details</h3>
          <dl className="meta-grid">
            {talk.collection ? (
              <>
                <dt>Collection</dt>
                <dd>{talk.collection}</dd>
              </>
            ) : null}
            {talk.track ? (
              <>
                <dt>Track</dt>
                <dd>{talk.track}</dd>
              </>
            ) : null}
            {talk.koanCase ? (
              <>
                <dt>Koan case</dt>
                <dd>{talk.koanCase}</dd>
              </>
            ) : null}
            {talk.catalogId ? (
              <>
                <dt>Catalog ID</dt>
                <dd>{talk.catalogId}</dd>
              </>
            ) : null}
            {talk.resourceId ? (
              <>
                <dt>Resource ID</dt>
                <dd>{talk.resourceId}</dd>
              </>
            ) : null}
            {talk.trainingQuarter ? (
              <>
                <dt>Training quarter</dt>
                <dd>{talk.trainingQuarter}</dd>
              </>
            ) : null}
            {talk.contributedBy ? (
              <>
                <dt>Contributed by</dt>
                <dd>{talk.contributedBy}</dd>
              </>
            ) : null}
            {talk.retreat ? (
              <>
                <dt>Retreat</dt>
                <dd>{talk.retreat}</dd>
              </>
            ) : null}
            {talk.tags?.length ? (
              <>
                <dt>Tags</dt>
                <dd>
                  <div className="talk-detail__tags">
                    {talk.tags.map((tag) => (
                      <span key={tag} className="tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                </dd>
              </>
            ) : null}
          </dl>
        </div>

        <div className="talk-detail__card">
          <h3>Audio</h3>
          {talk.audioUrl ? (
            <div className="audio-player__container">
              <audio
                ref={audioRef}
                controls
                className="audio-player"
                src={talk.audioUrl}
                onPlay={() => onInlinePlay?.(talk)}
                onLoadedMetadata={() => {
                  if (inlinePosition > 0 && audioRef.current) {
                    audioRef.current.currentTime = inlinePosition;
                  }
                }}
                onTimeUpdate={() => {
                  if (audioRef.current) {
                    onInlineProgress?.(audioRef.current.currentTime);
                  }
                }}
              >
                Your browser does not support the audio element.
              </audio>
              <div className="audio-player__actions">
                <button className="btn btn-primary" onClick={() => onPlay?.(talk)}>
                  Pop out mini player
                </button>
                <p className="talk-detail__note">
                  Play inline or pop out. If you leave this page while playing inline, we&apos;ll move
                  it to the mini player so it keeps going.
                </p>
              </div>
            </div>
          ) : (
            <p className="talk-detail__note">Add an audio URL to enable playback.</p>
          )}
        </div>
      </div>

      <div className="talk-detail__card transcript">
        <div className="transcript__header">
          <h3>Transcript</h3>
          {talk.duration || talk.length ? (
            <span className="pill pill--subtle">{talk.duration ?? talk.length}</span>
          ) : null}
        </div>
        {talk.summary ? <p className="talk-detail__summary-text">{talk.summary}</p> : null}
        <div className="transcript__body">
          {transcriptParagraphs.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      </div>
    </article>
  );
}

export default TalkDetail;
