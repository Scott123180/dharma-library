import { useEffect, useRef } from "react";
import { FullTalk } from "./TalkDetail";

type FeaturedTalkProps = {
  talk: FullTalk;
  onPlay?: (talk: FullTalk) => void;
  onInlinePlay?: (talk: FullTalk) => void;
  onInlineProgress?: (seconds: number) => void;
  inlineActive?: boolean;
  inlinePosition?: number;
  onViewTalk?: (talk: FullTalk) => void;
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
          <p className="featured-talk__meta">
            {talk.teacher} · {talk.location} · {talk.date} · {talk.duration}
          </p>
          {talk.caption ? <p className="featured-talk__caption">{talk.caption}</p> : null}
          {talk.summary ? <p className="featured-talk__summary">{talk.summary}</p> : null}
        </div>
        <div className="featured-talk__actions">
          <span className="pill">Audio</span>
          <span className="pill pill--subtle">Transcript</span>
          <button className="btn btn-primary" onClick={() => onViewTalk?.(talk)}>
            Go to talk page
          </button>
        </div>
      </div>

      <div className="featured-talk__card">
        <div className="featured-talk__card-header">
          <h3>Listen inline</h3>
          <span className="pill pill--subtle">{talk.duration}</span>
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
