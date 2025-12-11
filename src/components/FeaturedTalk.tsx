import { useEffect, useRef } from "react";
import { Talk } from "../types/talk";

type FeaturedTalkProps = {
  talk: Talk;
  onPlay?: (talk: Talk) => void;
  onInlinePlay?: (talk: Talk) => void;
  onInlineProgress?: (seconds: number) => void;
  inlineActive?: boolean;
  inlinePosition?: number;
  onViewTalk?: (talk: Talk) => void;
};

function FeaturedTalk({
  talk,
  onPlay,
  onInlinePlay,
  onInlineProgress,
  inlineActive,
  inlinePosition = 0,
  onViewTalk
}: FeaturedTalkProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const metaBits = [talk.teacher, talk.location, talk.date, talk.duration ?? talk.length]
    .filter(Boolean)
    .join(" · ");

  useEffect(() => {
    if (!inlineActive && audioRef.current) {
      audioRef.current.pause();
    }
  }, [inlineActive]);

  return (
    <article className="featured-talk">
      <div className="featured-talk__header">
        <div>
          <p className="section__eyebrow">Featured talk</p>
          <h2>{talk.title}</h2>
          {metaBits ? <p className="featured-talk__meta">{metaBits}</p> : null}
          {talk.caption ? <p className="featured-talk__caption">{talk.caption}</p> : null}
          {talk.summary ? <p className="featured-talk__summary">{talk.summary}</p> : null}
        </div>
        <div className="featured-talk__actions">
          {talk.audioUrl ? <span className="pill">Audio</span> : null}
          <span className="pill pill--subtle">Transcript</span>
          <button className="btn btn-primary" onClick={() => onViewTalk?.(talk)}>
            Go to talk page
          </button>
        </div>
      </div>

      <div className="featured-talk__card">
        <div className="featured-talk__card-header">
          <h3>Listen inline</h3>
          {talk.duration || talk.length ? (
            <span className="pill pill--subtle">{talk.duration ?? talk.length}</span>
          ) : null}
        </div>
        {talk.audioUrl ? (
          <>
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
            <div className="featured-talk__card-actions">
              <button className="btn btn-ghost" onClick={() => onPlay?.(talk)}>
                Pop out mini player
              </button>
            </div>
          </>
        ) : (
          <p className="talk-detail__note">Add an audio URL to enable playback.</p>
        )}
      </div>
    </article>
  );
}

export default FeaturedTalk;
