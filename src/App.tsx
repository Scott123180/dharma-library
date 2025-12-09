import { useEffect, useState } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import FeatureCard from "./components/FeatureCard";
import TalkCard, { Talk } from "./components/TalkCard";
import TalkDetail, { FullTalk } from "./components/TalkDetail";
import RoadmapPage from "./pages/RoadmapPage";
import TalkPage from "./pages/TalkPage";
import AboutPage from "./pages/AboutPage";
import PlayerBar from "./components/PlayerBar";

const talks: Talk[] = [
  {
    title: "Breath as a Home Base",
    teacher: "Ven. Ananda",
    length: "18 min",
    summary:
      "A concise walk-through of returning to the breath to steady attention and soften reactivity during daily life.",
    tags: ["mindfulness", "beginner", "foundational"]
  },
  {
    title: "Working with the Fires",
    teacher: "Ajahn Sumedho",
    length: "42 min",
    summary:
      "On anger, craving, and restlessness as natural weather patterns of the heart, and how to meet them with patience.",
    tags: ["emotions", "sila", "practice"]
  },
  {
    title: "Stillness in Motion",
    teacher: "Roshi Mira",
    length: "27 min",
    summary:
      "Zen-flavored guidance on carrying the cushion into commuting, caretaking, and conflict without losing clarity.",
    tags: ["zen", "daily-life", "clarity"]
  }
];

const features = [
  {
    title: "Clean transcripts",
    description:
      "Talks are transcribed by machine and cleaned by an llm so you can read fluid, trustworthy teachings.",
    status: "Live now"
  },
  {
    title: "Audio alongside text",
    description:
      "Future releases will pair each transcript with its original audio so you can listen while you read.",
    status: "Coming soon"
  },
  {
    title: "Search that understands",
    description:
      "An upcoming search-as-a-service layer will let you hunt by theme, teacher, or question and land on the right passage.",
    status: "In discovery"
  }
];

const featuredTalk: FullTalk = {
  title: "Neither The Wind Nor The Flag",
  teacher: "John Daido Loori",
  duration: "1:28:44 (approx)",
  location: "Zen Mountain Monastery",
  date: "1981-11-20 14:30",
  audioUrl: "https://media-archive.zmmapple.com/pages/download.php?direct=1&ref=30594&ext=mp3",
  collection: "Gateless Gate",
  track: "29",
  koanCase: "29",
  catalogId: "66",
  trainingQuarter: "1981 Fall",
  contributedBy: "Archivist",
  resourceId: "30594",
  caption: "Koan: Not the wind, not the flag—mind is moving.",
  summary:
    "Daido Roshi uses the koan of the wind and flag to point back to the mind that names, chases, and resists what it senses. Instead of trying to still experience, the talk invites resting in awareness itself—seeing movement without being moved by it.",
  transcript: [
    "A monk once pointed to a flag rippling in the wind and asked, “Is it the wind that moves, or the flag that moves?” The teacher replied, “Neither the wind nor the flag. It is mind that moves.”",
    "In this talk Daido Roshi unpacks how we chase movement in our experience. When we sit, we see the mind hurry to label every sensation—wind, flag, self—missing the direct taste of change itself.",
    "Practice invites us to meet each flicker of sensation as it is, without trying to nail it down. Zazen isn’t about stopping the wind or stilling the flag; it’s learning to rest in the awareness that holds them both."
  ]
};

const getInitialTheme = (): "light" | "dark" => {
  if (typeof window === "undefined") {
    return "dark";
  }
  const stored = window.localStorage.getItem("theme");
  if (stored === "light" || stored === "dark") {
    return stored;
  }
  const prefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;
  return prefersLight ? "light" : "dark";
};

type Route = "home" | "roadmap" | "talk" | "about";

const getInitialRoute = (): Route => {
  if (typeof window === "undefined") {
    return "home";
  }
  if (window.location.pathname === "/roadmap") return "roadmap";
  if (window.location.pathname === "/talk") return "talk";
  if (window.location.pathname === "/about") return "about";
  return "home";
};

function App() {
  const [theme, setTheme] = useState<"light" | "dark">(() => getInitialTheme());
  const [route, setRoute] = useState<Route>(() => getInitialRoute());
  const [nowPlaying, setNowPlaying] = useState<{ talk: FullTalk; position: number } | null>(null);
  const [inlinePlaying, setInlinePlaying] = useState<{ talk: FullTalk; route: Route; position: number } | null>(null);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    window.localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    const handlePop = () => setRoute(getInitialRoute());
    window.addEventListener("popstate", handlePop);
    return () => window.removeEventListener("popstate", handlePop);
  }, []);

  useEffect(() => {
    const path =
      route === "roadmap" ? "/roadmap" : route === "talk" ? "/talk" : route === "about" ? "/about" : "/";
    if (window.location.pathname !== path) {
      window.history.pushState({}, "", path);
    }
  }, [route]);

  useEffect(() => {
    if (
      inlinePlaying &&
      inlinePlaying.route !== route &&
      !nowPlaying
    ) {
      setNowPlaying({ talk: inlinePlaying.talk, position: inlinePlaying.position });
      setInlinePlaying(null);
    }
  }, [route, inlinePlaying, nowPlaying]);

  const toggleTheme = () => setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  const navigate = (next: Route) => setRoute(next);
  const handlePlay = (talk: FullTalk) => {
    const startAt =
      inlinePlaying && inlinePlaying.talk.title === talk.title ? inlinePlaying.position : 0;
    setNowPlaying({ talk, position: startAt });
    setInlinePlaying(null);
  };
  const handleInlinePlay = (talk: FullTalk) => {
    setInlinePlaying({ talk, route, position: 0 });
  };
  const handleInlineProgress = (seconds: number) => {
    if (inlinePlaying) {
      setInlinePlaying({ ...inlinePlaying, position: seconds });
    }
  };

  const handleGlobalProgress = (seconds: number) => {
    if (nowPlaying) {
      setNowPlaying({ ...nowPlaying, position: seconds });
    }
  };

  return (
    <div className="page">
      <Header theme={theme} onToggleTheme={toggleTheme} route={route} onNavigate={navigate} />
      <main className="content">
        {route === "home" ? (
          <>
            <section className="hero">
              <div className="hero__eyebrow">dharmalibrary.link</div>
              <h1 className="hero__title">
                A calm library for Dharma talks—read now, listen soon.
              </h1>
              <p className="hero__lead">
                Dharma Library hosts a growing catalogue of teachings. Every talk is
                transcribed, cleaned, and ready to read. Audio pairings and a smart
                search experience are on the way.
              </p>
              <div className="hero__actions">
                <button className="btn btn-primary" onClick={() => navigate("talk")}>
                  Start reading
                </button>
                <button className="btn btn-ghost" onClick={() => navigate("roadmap")}>
                  See what&apos;s coming
                </button>
              </div>
            </section>

            <section id="feature-talk" className="section">
              <TalkDetail
                talk={featuredTalk}
                onPlay={handlePlay}
                onInlinePlay={handleInlinePlay}
                onInlineProgress={handleInlineProgress}
                onViewTalk={() => navigate("talk")}
                inlineActive={
                  inlinePlaying?.talk.title === featuredTalk.title && inlinePlaying.route === route
                }
                inlinePosition={
                  inlinePlaying?.talk.title === featuredTalk.title ? inlinePlaying.position : 0
                }
              />
            </section>

            <section id="talks" className="section">
              <div className="section__header">
                <div>
                  <p className="section__eyebrow">Featured reads</p>
                  <h2>Talks ready for you today</h2>
                  <p className="section__subtitle">
                    Browse a few hand-picked samples while we finish ingesting the
                    full archive. Each page is formatted for calm, focused reading.
                  </p>
                </div>
                <button className="btn btn-ghost" onClick={() => navigate("talk")}>
                  View full library (soon)
                </button>
              </div>
              <div className="cards-grid">
                {talks.map((talk) => (
                  <TalkCard
                    key={talk.title}
                    talk={talk}
                    onOpen={() => {
                      setNowPlaying(null);
                      navigate("talk");
                    }}
                  />
                ))}
              </div>
            </section>

            <section className="section muted">
              <div className="section__header">
                <div>
                  <p className="section__eyebrow">Built for practice</p>
                  <h2>Thoughtful features on the way</h2>
                  <p className="section__subtitle">
                    We are focusing on simplicity first: readable transcripts,
                    structured metadata, and audio that keeps you close to the
                    teacher&apos;s original voice.
                  </p>
                </div>
              </div>
              <div className="cards-grid features">
                {features.map((feature) => (
                  <FeatureCard key={feature.title} {...feature} />
                ))}
              </div>
            </section>

            <section className="section cta">
              <div>
                <p className="section__eyebrow">For teachers & sanghas</p>
                <h2>Want your talks included?</h2>
                <p className="section__subtitle">
                  We can ingest recordings, run careful transcripts, and keep your
                  teachings discoverable. Drop a note and we&apos;ll reach out as
                  the library opens.
                </p>
              </div>
              <div className="cta__actions">
                <a className="btn btn-primary" href="mailto:hello@dharmalibrary.link">
                  Send me an email
                </a>
                <button className="btn btn-ghost" onClick={() => navigate("roadmap")}>
                  Roadmap updates
                </button>
              </div>
            </section>
          </>
        ) : route === "roadmap" ? (
          <RoadmapPage onNavigate={navigate} />
        ) : route === "talk" ? (
          <TalkPage
            talk={featuredTalk}
            onNavigate={navigate}
            onPlay={handlePlay}
            onInlinePlay={handleInlinePlay}
            onInlineProgress={handleInlineProgress}
          />
        ) : (
          <AboutPage />
        )}
      </main>
      <Footer onNavigate={navigate} />
      <PlayerBar
        talk={nowPlaying?.talk ?? null}
        startAt={nowPlaying?.position ?? 0}
        onClose={() => setNowPlaying(null)}
        onProgress={handleGlobalProgress}
      />
    </div>
  );
}

export default App;
