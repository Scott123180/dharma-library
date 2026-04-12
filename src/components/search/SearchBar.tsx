import { FormEvent, useState } from "react";

const MAX_LENGTH = 150;
const MIN_LENGTH = 3;

type Props = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
};

function SearchBar({ value, onChange, onSubmit, disabled = false }: Props) {
  const [showValidation, setShowValidation] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    // Empty query is allowed — it resets the search to idle
    if (trimmed.length > 0 && trimmed.length < MIN_LENGTH) {
      setShowValidation(true);
      return;
    }
    setShowValidation(false);
    onSubmit();
  };

  const handleChange = (newValue: string) => {
    onChange(newValue);
    if (showValidation && newValue.trim().length >= MIN_LENGTH) {
      setShowValidation(false);
    }
  };

  const remaining = MAX_LENGTH - value.length;

  return (
    <form className="search-bar" onSubmit={handleSubmit} role="search">
      <div className="search-bar__input-row">
        <input
          type="search"
          className="search-bar__input"
          aria-label="Search talks by theme, topic, or passage"
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          maxLength={MAX_LENGTH}
          disabled={disabled}
          autoFocus
        />
        <button
          type="submit"
          className="btn btn-primary search-bar__submit"
          disabled={disabled}
        >
          Search
        </button>
      </div>
      <div className="search-bar__meta">
        <span
          className="search-bar__char-count"
          aria-live="polite"
          aria-label={`${remaining} characters remaining`}
        >
          {remaining < 30 ? `${remaining} remaining` : ""}
        </span>
        {showValidation && (
          <span className="search-validation-error" role="alert">
            Please enter at least {MIN_LENGTH} characters.
          </span>
        )}
      </div>
    </form>
  );
}

export default SearchBar;
