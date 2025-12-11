import { useEffect, useState } from "react";
import { fetchTalk, fetchTalksIndex } from "./api/talks";
import FeaturedTalk from "./components/FeaturedTalk";
import FeatureCard from "./components/FeatureCard";
import Footer from "./components/Footer";
import Header from "./components/Header";
import PlayerBar from "./components/PlayerBar";
import TalkDetail from "./components/TalkDetail";
import TalksList from "./components/TalksList";
import AboutPage from "./pages/AboutPage";
import RoadmapPage from "./pages/RoadmapPage";
import { Talk, TalkMetadata } from "./types/talk";

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

  const [talksIndex, setTalksIndex] = useState<TalkMetadata[]>([]);
  const [indexLoading, setIndexLoading] = useState(true);
  const [indexError, setIndexError] = useState<string | null>(null);

  const [featuredTalkId, setFeaturedTalkId] = useState<string | null>(null);
  const [featuredTalk, setFeaturedTalk] = useState<Talk | null>(null);
  const [featuredLoading, setFeaturedLoading] = useState(false);
  const [featuredError, setFeaturedError] = useState<string | null>(null);

  const [selectedTalkId, setSelectedTalkId] = useState<string | null>(null);

  const [nowPlaying, setNowPlaying] = useState<{ talk: Talk; position: number } | null>(null);
  const [inlinePlaying, setInlinePlaying] = useState<{ talk: Talk; route: Route; position: number } | null>(null);

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
    if (inlinePlaying && inlinePlaying.route !== route && !nowPlaying) {
      setNowPlaying({ talk: inlinePlaying.talk, position: inlinePlaying.position });
      setInlinePlaying(null);
    }
  }, [route, inlinePlaying, nowPlaying]);

  useEffect(() => {
    let cancelled = false;
    const pickFeatured = (list: TalkMetadata[]) => {
      const withAudio = list.find((t) => t.audioUrl);
      return withAudio?.id ?? list[0]?.id ?? null;
    };

    const loadIndex = async () => {
      setIndexLoading(true);
      try {
        const data = await fetchTalksIndex();
        if (!cancelled) {
          setTalksIndex(data);
          setIndexError(null);
          setFeaturedTalkId((current) => current ?? pickFeatured(data));
          setSelectedTalkId((current) => current ?? data[0]?.id ?? null);
        }
      } catch (err) {
        if (!cancelled) {
          setIndexError(err instanceof Error ? err.message : "Unknown error");
        }
      } finally {
        if (!cancelled) {
          setIndexLoading(false);
        }
      }
    };

    loadIndex();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!featuredTalkId) {
      setFeaturedTalk(null);
      return;
    }

    let cancelled = false;
    const loadFeaturedTalk = async () => {
      setFeaturedLoading(true);
      try {
        const data = await fetchTalk(featuredTalkId);
        if (!cancelled) {
          setFeaturedTalk(data);
          setFeaturedError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setFeaturedError(err instanceof Error ? err.message : "Unknown error");
          setFeaturedTalk(null);
        }
      } finally {
        if (!cancelled) {
          setFeaturedLoading(false);
        }
      }
    };

    loadFeaturedTalk();
    return () => {
      cancelled = true;
    };
  }, [featuredTalkId]);

  const toggleTheme = () => setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  const navigate = (next: Route) => setRoute(next);

  const handlePlay = (talk: Talk) => {
    const startAt = inlinePlaying && inlinePlaying.talk.id === talk.id ? inlinePlaying.position : 0;
    setNowPlaying({ talk, position: startAt });
    setInlinePlaying(null);
  };

  const handleInlinePlay = (talk: Talk) => {
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

  const handleSelectTalk = (id: string) => {
    setSelectedTalkId(id);
    setNowPlaying(null);
    navigate("talk");
  };

  const activeInlineTalkId =
    inlinePlaying && inlinePlaying.route === route ? inlinePlaying.talk.id : null;

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
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    const firstId = talksIndex[0]?.id ?? null;
                    setSelectedTalkId((current) => current ?? firstId);
                    navigate("talk");
                  }}
                >
                  Start reading
                </button>
                <button className="btn btn-ghost" onClick={() => navigate("roadmap")}>
                  See what&apos;s coming
                </button>
              </div>
            </section>

            <section id="feature-talk" className="section">
              {featuredLoading ? (
                <p>Loading featured talk…</p>
              ) : featuredTalk ? (
                <FeaturedTalk
                  talk={featuredTalk}
                  onPlay={handlePlay}
                  onInlinePlay={handleInlinePlay}
                  onInlineProgress={handleInlineProgress}
                  inlineActive={activeInlineTalkId === featuredTalk.id}
                  inlinePosition={activeInlineTalkId === featuredTalk.id ? inlinePlaying?.position ?? 0 : 0}
                  onViewTalk={(talk) => handleSelectTalk(talk.id)}
                />
              ) : featuredError ? (
                <p className="error-text">Unable to load featured talk: {featuredError}</p>
              ) : (
                <p>No featured talk available yet.</p>
              )}
            </section>

            <section id="talks" className="section">
              <div className="section__header">
                <div>
                  <p className="section__eyebrow">Featured reads</p>
                  <h2>Talks ready for you today</h2>
                  <p className="section__subtitle">
                    Browse a few hand-picked samples while we finish ingesting the full archive. Each
                    page is formatted for calm, focused reading.
                  </p>
                </div>
              </div>
              <TalksList
                initialTalks={talksIndex}
                loading={indexLoading}
                error={indexError}
                onSelect={handleSelectTalk}
              />
            </section>

            <section className="section muted">
              <div className="section__header">
                <div>
                  <p className="section__eyebrow">Built for practice</p>
                  <h2>Thoughtful features on the way</h2>
                  <p className="section__subtitle">
                    We are focusing on simplicity first: readable transcripts, structured metadata,
                    and audio that keeps you close to the teacher&apos;s original voice.
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
                  We can ingest recordings, run careful transcripts, and keep your teachings
                  discoverable. Drop a note and we&apos;ll reach out as the library opens.
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
          <section className="talk-page">
            <div className="section__header">
              <div>
                <p className="section__eyebrow">Transcript library</p>
                <h1>Browse Dharma talks</h1>
                <p className="section__subtitle">Loaded from {indexLoading ? "…" : "the index"}.</p>
              </div>
              <div className="cta__actions">
                <button className="btn btn-ghost" onClick={() => navigate("home")}>
                  Back to home
                </button>
              </div>
            </div>
            <div className="talk-page__detail">
              {selectedTalkId ? (
                <TalkDetail
                  talkId={selectedTalkId}
                  onPlay={handlePlay}
                  onInlinePlay={handleInlinePlay}
                  onInlineProgress={handleInlineProgress}
                  inlineActive={activeInlineTalkId === selectedTalkId}
                  inlinePosition={activeInlineTalkId === selectedTalkId ? inlinePlaying?.position ?? 0 : 0}
                  onBack={() => {
                    setSelectedTalkId(null);
                    navigate("home");
                  }}
                />
              ) : (
                <p>Select a talk on the home page to read.</p>
              )}
            </div>
          </section>
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
