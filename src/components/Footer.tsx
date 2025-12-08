type FooterProps = {
  onNavigate?: (route: "home" | "roadmap" | "talk" | "about") => void;
};

function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="footer">
      <div>
        <p className="brand__name">Dharma Library</p>
        <p className="footer__copy">dharmalibrary.link · Made for practitioners</p>
      </div>
      <div className="footer__links">
        <a
          href="/about"
          onClick={(e) => {
            if (onNavigate) {
              e.preventDefault();
              onNavigate("about");
            }
          }}
        >
          About
        </a>
        <a href="#roadmap">Roadmap</a>
        <a href="#talks">Talks</a>
        <a href="https://github.com/Scott123180/dharma-library" target="_blank" rel="noreferrer">
          GitHub
        </a>
      </div>
    </footer>
  );
}

export default Footer;
