export type Talk = {
  title: string;
  teacher: string;
  length: string;
  summary: string;
  tags: string[];
};

type TalkCardProps = {
  talk: Talk;
  onOpen?: () => void;
};

function TalkCard({ talk, onOpen }: TalkCardProps) {
  const handleOpen = (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    if (!onOpen) return;
    event.preventDefault();
    onOpen();
  };

  return (
    <article className="talk-card">
      <div className="talk-card__meta">
        <span className="pill">{talk.teacher}</span>
        <span className="pill pill--subtle">{talk.length}</span>
      </div>
      <h3>{talk.title}</h3>
      <p className="talk-card__summary">{talk.summary}</p>
      <div className="talk-card__tags">
        {talk.tags.map((tag) => (
          <span key={tag} className="tag">
            {tag}
          </span>
        ))}
      </div>
      <a className="link" href="#" onClick={handleOpen}>
        Open transcript (sample)
      </a>
    </article>
  );
}

export default TalkCard;
