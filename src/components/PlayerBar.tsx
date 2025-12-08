import { useEffect, useRef } from "react";
import { FullTalk } from "./TalkDetail";

type PlayerBarProps = {
  talk: FullTalk | null;
  startAt?: number;
  onClose: () => void;
  onProgress?: (seconds: number) => void;
};

function PlayerBar({ talk, startAt = 0, onClose, onProgress }: PlayerBarProps) {
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
    const setStartAndPlay = () => {
      if (startPositionRef.current > 0) {
        audio.currentTime = startPositionRef.current;
        startPositionRef.current = 0;
      }
      audio
        .play()
        .catch(() => {
          /* ignore autoplay block */
        });
    };

    if (audio.readyState >= 1) {
      setStartAndPlay();
    } else {
      audio.addEventListener("loadedmetadata", setStartAndPlay, { once: true });
    }
  }, [talk?.audioUrl]);

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

  return (
    <div className="player-bar">
      <div className="player-bar__info">
        <p className="player-bar__title">{talk.title}</p>
        <p className="player-bar__meta">
          {talk.teacher} · {talk.duration}
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
