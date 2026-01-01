const phases = [
  {
    title: "All talks ingested",
    status: "Done",
    description: "6,300 talks from Zen Mountain Monestary are transcribed and in the library database.",
    detail: "Source audio has been ingested and aligned with transcript text.",
    badge: "Complete"
  },
  {
    title: "Wave 1 cleaning",
    status: "In progress",
    description: "Cleaning the first subset to make a readable, stable release.",
    detail:
      "Focus: removing obvious transcription artifacts, smoothing phrasing, and fixing structural breaks.",
    badge: "Now"
  },
  {
    title: "Publish cleaned subset",
    status: "Up next",
    description: "Release the initial cleaned talks with audio links side-by-side.",
    detail:
      "Goal: publish the first cleaned tranche to the site with audio URLs so visitors can read or listen.",
    badge: "Next"
  },
  {
    title: "Wave 2: fine polish",
    status: "Planned",
    description: "Tighten proper names, foreign terms, and remaining rough edges.",
    detail:
      "QA pass to correct names, chants, and foreign language phrases; verify headings and attributions.",
    badge: "Soon"
  },
  {
    title: "Search experience",
    status: "Planned",
    description: "Add semantic search backed by a vector database.",
    detail:
      "Connect the search bar to a hosted vector index so practitioners can find passages by theme or teacher.",
    badge: "Soon"
  }
];

type RoadmapPageProps = {
  onNavigate?: (route: "home" | "roadmap" | "talk") => void;
};

function RoadmapPage({ onNavigate }: RoadmapPageProps) {
  return (
    <section className="roadmap-page">
      <div className="roadmap__hero">
        <p className="section__eyebrow">Roadmap</p>
        <h1>Where Dharma Library is headed</h1>
        <p className="section__subtitle">
          Think of this as a map of the trail. We&apos;ve transcribed everything, we&apos;re
          cleaning a first wave, and soon you&apos;ll see polished transcripts alongside their
          audio. After that: name-level polish and a search experience powered by a vector
          database.
        </p>
      </div>

      <div className="map-grid">
        <div className="map-grid__line" aria-hidden="true" />
        {phases.map((phase, idx) => (
          <article key={phase.title} className={`map-card ${idx % 2 === 0 ? "left" : "right"}`}>
            <div className="map-card__header">
              <span className={`map-card__badge map-card__badge--${phase.badge.toLowerCase()}`}>
                {phase.badge}
              </span>
              <p className="map-card__status">{phase.status}</p>
            </div>
            <h3>{phase.title}</h3>
            <p className="map-card__description">{phase.description}</p>
            <p className="map-card__detail">{phase.detail}</p>
            <div className="map-card__node" aria-hidden="true">
              <span className="map-card__dot" />
              <span className="map-card__connector" />
            </div>
          </article>
        ))}
      </div>

      <div className="roadmap__footer">
        <div>
          <p className="section__eyebrow">Stay in the loop</p>
          <h2>Want updates as new waves publish?</h2>
          <p className="section__subtitle">
            We&apos;ll announce when the first cleaned subset and audio links go live. After that,
            expect a polish wave and a search launch.
          </p>
        </div>
        <div className="cta__actions">
          <a className="btn btn-primary" href="mailto:me@scotthansen.io">
            Send me an email
          </a>
          <a
            className="btn btn-ghost"
            href="/"
            onClick={(e) => {
              if (onNavigate) {
                e.preventDefault();
                onNavigate("home");
              }
            }}
          >
            Back to home
          </a>
        </div>
      </div>
    </section>
  );
}

export default RoadmapPage;
