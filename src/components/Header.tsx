import React from "react";
import LogoMark from "./LogoMark";
import ThemeToggle from "./ThemeToggle";

type HeaderProps = {
  theme: "light" | "dark";
  onToggleTheme: () => void;
  route: "home" | "roadmap" | "talk" | "about";
  onNavigate: (route: "home" | "roadmap" | "talk" | "about") => void;
};

function Header({ theme, onToggleTheme, route, onNavigate }: HeaderProps) {
  const handleNav = (
    evt: React.MouseEvent<HTMLAnchorElement>,
    target: "home" | "roadmap" | "talk" | "about"
  ) => {
    evt.preventDefault();
    onNavigate(target);
  };

  return (
    <header className="header">
      <button className="header__brand brand-button" onClick={() => onNavigate("home")}>
        <LogoMark />
        <div>
          <p className="brand__name">Dharma Library</p>
          <p className="brand__tagline">Read & listen to Dharma talks</p>
        </div>
      </button>
      <div className="header__actions">
        <nav className="header__nav">
          <a
            href="/"
            className={route === "home" ? "is-active" : ""}
            onClick={(e) => handleNav(e, "home")}
          >
            Home
          </a>
          <a
            href="/roadmap"
            className={route === "roadmap" ? "is-active" : ""}
            onClick={(e) => handleNav(e, "roadmap")}
          >
            Roadmap
          </a>
          <a
            href="/about"
            className={route === "about" ? "is-active" : ""}
            onClick={(e) => handleNav(e, "about")}
          >
            About
          </a>
        </nav>
        <ThemeToggle theme={theme} onToggleTheme={onToggleTheme} />
      </div>
    </header>
  );
}

export default Header;
