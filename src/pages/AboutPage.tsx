function AboutPage() {
  return (
    <section className="about-page">
      <div className="about-hero">
        <div>
          <p className="section__eyebrow">About</p>
          <h1>What is Dharma Library?</h1>
          <p className="section__subtitle">
            A calm place to read and listen to Dharma talks. We ingest recordings, generate and
            clean transcripts, and publish them so practitioners can stay close to the teacher&apos;s
            original voice.
          </p>
        </div>
        <div className="about-illustration" aria-hidden="true">
          <img src="/buddha.svg" alt="" />
        </div>
      </div>

      <div className="about-grid">
        <article className="about-card">
          <h3>Why it exists</h3>
          <p>
            Dharma talks are scattered across recordings and print. Dharma Library collects them
            into a single, searchable home so sanghas can share teachings without friction.
          </p>
        </article>
        <article className="about-card">
          <h3>How it works</h3>
          <p>
            Talks are transcribed, then cleaned in waves: first for readability, later for
            proper names and foreign terms. Audio links sit next to the text so you can read or
            listen.
          </p>
        </article>
        <article className="about-card">
          <h3>What&apos;s next</h3>
          <p>
            After publishing the first cleaned subset, we&apos;ll polish names and add a vector
            search so you can ask by theme, teacher, or phrase and land on the right passage.
          </p>
        </article>
      </div>
    </section>
  );
}

export default AboutPage;
