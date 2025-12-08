type ThemeToggleProps = {
  theme: "light" | "dark";
  onToggleTheme: () => void;
};

function ThemeToggle({ theme, onToggleTheme }: ThemeToggleProps) {
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={onToggleTheme}
      aria-label="Toggle light and dark mode"
    >
      <span className="theme-toggle__icon" aria-hidden="true">
        {isDark ? (
          <svg viewBox="0 0 24 24" role="presentation">
            <path d="M12 3a1 1 0 0 1 1 1v1.25a1 1 0 1 1-2 0V4a1 1 0 0 1 1-1Zm0 13a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm7-4a1 1 0 0 1-1-1V9.75a1 1 0 1 1 2 0V11a1 1 0 0 1-1 1Zm-13 0a1 1 0 0 1-1-1V9.75a1 1 0 1 1 2 0V11a1 1 0 0 1-1 1Zm9.657 6.657a1 1 0 0 1-1.414-1.414l.884-.884a1 1 0 1 1 1.414 1.414l-.884.884Zm-8.486 0-.884-.884a1 1 0 1 1 1.414-1.414l.884.884a1 1 0 0 1-1.414 1.414ZM5.343 6.343a1 1 0 0 1 1.414-1.414l.884.884A1 1 0 0 1 6.227 7.1l-.884-.757Zm12.02.758-.884-.884a1 1 0 0 1 1.414-1.414l.884.884A1 1 0 0 1 17.364 7.1ZM12 18.75a1 1 0 0 1 1 1V21a1 1 0 1 1-2 0v-1.25a1 1 0 0 1 1-1Z" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" role="presentation">
            <path d="M16.44 3.1a1 1 0 0 1 .62 1.206 8.002 8.002 0 0 1-9.686 5.33A8 8 0 0 1 16.5 19.24a1 1 0 0 1-1.173 1.617 10 10 0 1 1 .202-17.754c.34-.16.744-.07.911.03Z" />
          </svg>
        )}
      </span>
      <span className="theme-toggle__label">{isDark ? "Dark" : "Light"} mode</span>
    </button>
  );
}

export default ThemeToggle;
