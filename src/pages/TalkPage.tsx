import TalkDetail, { FullTalk } from "../components/TalkDetail";

type TalkPageProps = {
  talk: FullTalk;
  onNavigate?: (route: "home" | "roadmap" | "talk" | "about") => void;
  onPlay?: (talk: FullTalk) => void;
  onInlinePlay?: (talk: FullTalk) => void;
  onInlineProgress?: (seconds: number) => void;
};

function TalkPage({ talk, onNavigate, onPlay, onInlinePlay, onInlineProgress }: TalkPageProps) {
  return (
    <section className="talk-page">
      <div className="section__header">
        <div>
          <p className="section__eyebrow">Transcript & audio</p>
          <h1>{talk.title}</h1>
          <p className="section__subtitle">
            Read the full transcript and listen alongside. Tap back to the library anytime.
          </p>
        </div>
        <div className="cta__actions">
          <button className="btn btn-ghost" onClick={() => onNavigate?.("home")}>
            Back to library
          </button>
        </div>
      </div>

      <TalkDetail
        talk={talk}
        onPlay={onPlay}
        onInlinePlay={onInlinePlay}
        onInlineProgress={onInlineProgress}
        inlineActive
      />
    </section>
  );
}

export default TalkPage;
