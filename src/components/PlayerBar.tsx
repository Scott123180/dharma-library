import { useEffect, useRef } from "react";
import { Talk } from "../types/talk";

type PlayerBarProps = {
  talk: Talk | null;
  startAt?: number;
  autoPlay?: boolean;
  onClose: () => void;
  onProgress?: (seconds: number) => void;
};

function PlayerBar({ talk, startAt = 0, autoPlay = true, onClose, onProgress }: PlayerBarProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const startPositionRef = useRef(0);
  const currentSourceRef = useRef<string | null>(null);

  useEffect(() => {
    if (!talk?.audioUrl || !audioRef.current) return;

    // Reset starting position when the source changes.
    if (currentSourceRef.current !== talk.audioUrl) {
      currentSourceRef.current = talk.audioUrl;
      startPositionRef.current = startAt;
      audioRef.current.load();
    }

    const audio = audioRef.current;
    const setStartAndMaybePlay = () => {
      if (startPositionRef.current > 0) {
        audio.currentTime = startPositionRef.current;
        startPositionRef.current = 0;
      }
      if (autoPlay) {
        audio
          .play()
          .catch(() => {
            /* ignore autoplay block */
          });
      }
    };

    if (audio.readyState >= 1) {
      setStartAndMaybePlay();
    } else {
      audio.addEventListener("loadedmetadata", setStartAndMaybePlay, { once: true });
    }
  }, [talk?.audioUrl, autoPlay]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      onProgress?.(audioRef.current.currentTime);
    }
  };

  const handleClose = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    onClose();
  };

  if (!talk || !talk.audioUrl) return null;

  const speaker = talk.speaker || talk.teacher || "Unknown speaker";

  return (
    <div className="player-bar">
      <div className="player-bar__info">
        <p className="player-bar__title">{talk.title}</p>
        <p className="player-bar__meta">
          {speaker}
          {talk.duration ? ` · ${talk.duration}` : null}
        </p>
      </div>
      <audio
        ref={audioRef}
        controls
        className="player-bar__audio"
        src={talk.audioUrl}
        onTimeUpdate={handleTimeUpdate}
      >
        Your browser does not support the audio element.
      </audio>
      <button className="player-bar__close" aria-label="Close player" onClick={handleClose}>
        ×
      </button>
    </div>
  );
}

export default PlayerBar;
