import TalkDetail from "../components/TalkDetail";
import { Talk } from "../types/talk";

type TalkPageProps = {
  talkId: string;
  onNavigate?: (route: "home" | "roadmap" | "talk" | "about") => void;
  onPlay?: (talk: Talk) => void;
  onInlinePlay?: (talk: Talk, position: number) => void;
  onInlinePause?: (talk: Talk, position: number) => void;
  onInlineProgress?: (seconds: number) => void;
};

function TalkPage({
  talkId,
  onNavigate,
  onPlay,
  onInlinePlay,
  onInlinePause,
  onInlineProgress
}: TalkPageProps) {
  return (
    <section className="talk-page">
      <div className="section__header">
        <div>
          <p className="section__eyebrow">Transcript & audio</p>
          <h1>Read the full transcript</h1>
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
        talkId={talkId}
        onPlay={onPlay}
        onInlinePlay={onInlinePlay}
        onInlinePause={onInlinePause}
        onInlineProgress={onInlineProgress}
        inlineActive
      />
    </section>
  );
}

export default TalkPage;
