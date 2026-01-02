import { useEffect, useRef, useState } from "react";
import { fetchTalk } from "../api/talks";
import { Talk } from "../types/talk";

type TalkDetailProps = {
  talkId: string;
  onPlay?: (talk: Talk) => void;
  onInlinePlay?: (talk: Talk, position: number) => void;
  onInlinePause?: (talk: Talk, position: number) => void;
  onInlineProgress?: (seconds: number) => void;
  inlineActive?: boolean;
  inlinePosition?: number;
  onBack?: () => void;
};

function TalkDetail({
  talkId,
  onPlay,
  onInlinePlay,
  onInlinePause,
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

  // TODO: remove the reference to talk here - the index is generated from the
  //  talk card, and so having it here is not necessary.
  const speaker = talk.speaker || talk.teacher || "Unknown speaker";
  const durationLabel = talk.duration?.trim();
  const caption = talk.caption?.trim();
  const summary = talk.summary?.trim();
  const koanCollection = talk.koanCollection || talk.collection;
  const lineageStages = [
    { key: "audio_only", value: 1, label: "Audio only" },
    { key: "raw_transcript", value: 2, label: "Raw transcript" },
    { key: "structured_transcript", value: 3, label: "Structured transcript" },
    { key: "cleaned_transcript", value: 4, label: "Cleaned transcript" }
  ];
  const lineageValueMap: Record<string, number> = {
    audio_original: 1,
    transcript_raw: 2,
    transcript_structured: 3,
    transcript_cleaned: 4
  };
  const lineageValue = (talk.dataLineage || []).reduce((max, entry) => {
    return Math.max(max, lineageValueMap[entry] || 0);
  }, 0);
  const lineageSteps = lineageStages.map((stage) => ({
    key: stage.key,
    label: stage.label,
    complete: lineageValue >= stage.value
  }));
  const splitIntoSentences = (text: string) => {
    const matches = text.match(/[^.!?]+[.!?]+|[^.!?]+$/g);
    return (matches || [text])
      .map((sentence) => sentence.trim())
      .filter(Boolean);
  };

  const chunkSentences = (sentences: string[], size: number) => {
    const chunks: string[] = [];
    for (let i = 0; i < sentences.length; i += size) {
      chunks.push(sentences.slice(i, i + size).join(" "));
    }
    return chunks;
  };

  const transcriptParagraphs = (() => {
    const normalized = talk.transcript
      .replace(/\\n/g, "\n") // handle escaped newlines that arrived as literal backslash-n
      .replace(/\r\n/g, "\n");
    const paragraphs = normalized
      .split(/\n+/) // treat single or multiple newlines as paragraph separators
      .map((paragraph) => paragraph.trim())
      .filter(Boolean);

    if (!paragraphs.length) {
      return [];
    }

    if (paragraphs.length === 1 && paragraphs[0].length > 400) {
      const sentences = splitIntoSentences(paragraphs[0]);
      if (sentences.length > 1) {
        return chunkSentences(sentences, 2);
      }
    }

    return paragraphs;
  })();

  const metaBits = [speaker, talk.location?.trim(), talk.date?.trim(), durationLabel]
    .filter(Boolean)
    .join(" · ");

  return (
    <article className="talk-detail">
      <div className="talk-detail__header">
        <div>
          <p className="section__eyebrow">Talk</p>
          <h2>{talk.title}</h2>
          {metaBits ? <p className="talk-detail__meta">{metaBits}</p> : null}
          {caption ? <p className="talk-detail__caption">{caption}</p> : null}
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
            {koanCollection ? (
              <>
                <dt>Koan collection</dt>
                <dd>{koanCollection}</dd>
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
            {talk.trainingQuarter ? (
              <>
                <dt>Training quarter</dt>
                <dd>{talk.trainingQuarter}</dd>
              </>
            ) : null}
            {lineageValue ? (
              <>
                <dt>Data lineage</dt>
                <dd className="meta-grid__full">
                  <div className="lineage" role="list">
                    {lineageSteps.map((step, index) => (
                      <div
                        key={step.key}
                        className={`lineage__step${step.complete ? " is-complete" : ""}`}
                        role="listitem"
                      >
                        <div className="lineage__dot" aria-hidden="true" />
                        <div className="lineage__label">{step.label}</div>
                        {index < lineageSteps.length - 1 ? (
                          <div
                            className={`lineage__track${
                              step.complete && lineageSteps[index + 1]?.complete
                                ? " is-complete"
                                : ""
                            }`}
                            aria-hidden="true"
                          />
                        ) : null}
                      </div>
                    ))}
                  </div>
                </dd>
              </>
            ) : null}
            {talk.tags?.length ? (
              <>
                <dt>Tags</dt>
                <dd className="talk-detail__tags">
                  {talk.tags.map((tag) => (
                    <span key={tag} className="tag">
                      {tag}
                    </span>
                  ))}
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
                onPlay={() =>
                  onInlinePlay?.(talk, audioRef.current ? audioRef.current.currentTime : 0)
                }
                onPause={() =>
                  onInlinePause?.(talk, audioRef.current ? audioRef.current.currentTime : 0)
                }
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
        </div>
        {summary ? <p className="talk-detail__summary-text">{summary}</p> : null}
        <div className="transcript__body">
          {transcriptParagraphs.length ? (
            transcriptParagraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)
          ) : (
            <p className="talk-detail__note">Transcript not available yet.</p>
          )}
        </div>
      </div>
    </article>
  );
}

export default TalkDetail;
