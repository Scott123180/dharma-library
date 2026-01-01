import { useEffect, useRef } from "react";
import { Talk } from "../types/talk";

type FeaturedTalkProps = {
  talk: Talk;
  onPlay?: (talk: Talk) => void;
  onInlinePlay?: (talk: Talk, position: number) => void;
  onInlinePause?: (talk: Talk, position: number) => void;
  onInlineProgress?: (seconds: number) => void;
  inlineActive?: boolean;
  inlinePosition?: number;
  onViewTalk?: (talk: Talk) => void;
};

function FeaturedTalk({
  talk,
  onPlay,
  onInlinePlay,
  onInlinePause,
  onInlineProgress,
  inlineActive,
  inlinePosition = 0,
  onViewTalk
}: FeaturedTalkProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const speaker = talk.speaker || talk.teacher || "Unknown speaker";
  const durationLabel = talk.duration?.trim();
  const metaBits = [speaker, talk.location?.trim(), talk.date?.trim(), durationLabel].filter(Boolean).join(" · ");
  const caption = talk.caption?.trim();
  const summary = talk.summary?.trim();

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
          {caption ? <p className="featured-talk__caption">{caption}</p> : null}
          {summary ? <p className="featured-talk__summary">{summary}</p> : null}
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
          <h3>Listen now</h3>
          {durationLabel ? <span className="pill pill--subtle">{durationLabel}</span> : null}
        </div>
        {talk.audioUrl ? (
          <>
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
