import LogoMark from "./LogoMark";

function Header() {
  return (
    <header className="header">
      <div className="header__brand">
        <LogoMark />
        <div>
          <p className="brand__name">Dharma Library</p>
          <p className="brand__tagline">Read & listen to Dharma talks</p>
        </div>
      </div>
      <nav className="header__nav">
        <a href="#talks">Talks</a>
        <a href="#roadmap">Roadmap</a>
        <a href="mailto:hello@dharmalibrary.link">Contact</a>
      </nav>
    </header>
  );
}

export default Header;
