import { useEffect, useRef } from "react";

export type FullTalk = {
  title: string;
  teacher: string;
  duration: string;
  location: string;
  date: string;
  audioUrl?: string;
  summary?: string;
  collection?: string;
  track?: string;
  koanCase?: string;
  catalogId?: string;
  trainingQuarter?: string;
  contributedBy?: string;
  resourceId?: string;
  transcript: string[];
  caption?: string;
};

type TalkDetailProps = {
  talk: FullTalk;
  onPlay?: (talk: FullTalk) => void;
  onInlinePlay?: (talk: FullTalk) => void;
  onInlineProgress?: (seconds: number) => void;
  inlineActive?: boolean;
  inlinePosition?: number;
};

function TalkDetail({
  talk,
  onPlay,
  onInlinePlay,
  onInlineProgress,
  inlineActive,
  inlinePosition = 0
}: TalkDetailProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!inlineActive && audioRef.current) {
      audioRef.current.pause();
    }
  }, [inlineActive]);

  return (
    <article className="talk-detail">
      <div className="talk-detail__header">
        <div>
          <p className="section__eyebrow">Talk</p>
          <h2>{talk.title}</h2>
          <p className="talk-detail__meta">
            {talk.teacher} · {talk.location} · {talk.date} · {talk.duration}
          </p>
          {talk.caption ? <p className="talk-detail__caption">{talk.caption}</p> : null}
        </div>
        <div className="talk-detail__pills">
          <span className="pill">Audio</span>
          <span className="pill pill--subtle">Transcript</span>
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
                  Play inline or pop out. If you leave this page while playing inline, we&apos;ll
                  move it to the mini player so it keeps going.
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
          <span className="pill pill--subtle">{talk.duration}</span>
        </div>
        {talk.summary ? <p className="talk-detail__summary-text">{talk.summary}</p> : null}
        <div className="transcript__body">
          {talk.transcript.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      </div>
    </article>
  );
}

export default TalkDetail;
