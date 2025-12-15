import { MouseEvent } from "react";
import { TalkMetadata } from "../types/talk";

type TalkCardProps = {
  talk: TalkMetadata;
  onOpen?: (id: string) => void;
};

function TalkCard({ talk, onOpen }: TalkCardProps) {
  const handleOpen = (event: MouseEvent<HTMLAnchorElement>) => {
    if (!onOpen) return;
    event.preventDefault();
    onOpen(talk.id);
  };

  const speaker = talk.speaker || talk.teacher || "Unknown speaker";
  const durationLabel = talk.duration?.trim() || undefined;
  const summary = talk.summary?.trim();

  return (
    <article className="talk-card">
      <div className="talk-card__meta">
        <span className="pill">{speaker}</span>
        {durationLabel ? <span className="pill pill--subtle">{durationLabel}</span> : null}
      </div>
      <h3>{talk.title}</h3>
      <p className="talk-card__summary">
        {summary || "Transcript ready to read. Tap to open the full text."}
      </p>
      <div className="talk-card__tags">
        {talk.tags.map((tag) => (
          <span key={tag} className="tag">
            {tag}
          </span>
        ))}
      </div>
      <a className="link" href="#" onClick={handleOpen}>
        Open
      </a>
    </article>
  );
}

export default TalkCard;
