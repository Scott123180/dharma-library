import Header from "./components/Header";
import Footer from "./components/Footer";
import FeatureCard from "./components/FeatureCard";
import TalkCard, { Talk } from "./components/TalkCard";
import TalkDetail, { FullTalk } from "./components/TalkDetail";

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
      "Talks are transcribed by machine and refined by an editor so you can read fluid, trustworthy teachings.",
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
  transcript: [
    "A monk once pointed to a flag rippling in the wind and asked, “Is it the wind that moves, or the flag that moves?” The teacher replied, “Neither the wind nor the flag. It is mind that moves.”",
    "In this talk Daido Roshi unpacks how we chase movement in our experience. When we sit, we see the mind hurry to label every sensation—wind, flag, self—missing the direct taste of change itself.",
    "Practice invites us to meet each flicker of sensation as it is, without trying to nail it down. Zazen isn’t about stopping the wind or stilling the flag; it’s learning to rest in the awareness that holds them both."
  ]
};

function App() {
  return (
    <div className="page">
      <Header />
      <main className="content">
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
            <a className="btn btn-primary" href="#talks">
              Start reading
            </a>
            <a className="btn btn-ghost" href="#roadmap">
              See what&apos;s coming
            </a>
          </div>
        </section>

        <section id="feature-talk" className="section">
          <TalkDetail talk={featuredTalk} />
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
            <a className="link" href="#">
              View full library (soon)
            </a>
          </div>
          <div className="cards-grid">
            {talks.map((talk) => (
              <TalkCard key={talk.title} talk={talk} />
            ))}
          </div>
        </section>

        <section id="roadmap" className="section muted">
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
              Email the team
            </a>
            <a className="btn btn-ghost" href="#">
              Roadmap updates
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default App;
