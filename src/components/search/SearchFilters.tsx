import { SearchFilters, hasActiveFilters, DEFAULT_FILTERS } from "../../types/search";

type Props = {
  filters: SearchFilters;
  onChange: (filters: SearchFilters) => void;
  speakers: string[];
  locations: string[];
  disabled?: boolean;
};

function SearchFiltersComponent({ filters, onChange, speakers, locations, disabled }: Props) {
  const update = (partial: Partial<SearchFilters>) =>
    onChange({ ...filters, ...partial });

  const active = hasActiveFilters(filters);
  const currentYear = new Date().getFullYear();

  return (
    <div className="search-filters">
      <div className="search-filters__row">
        <label className="search-filters__field">
          <span className="search-filters__label">Speaker</span>
          <select
            className="search-filters__select"
            value={filters.speaker}
            onChange={(e) => update({ speaker: e.target.value })}
            disabled={disabled}
          >
            <option value="">All speakers</option>
            {speakers.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </label>

        <label className="search-filters__field">
          <span className="search-filters__label">Location</span>
          <select
            className="search-filters__select"
            value={filters.location}
            onChange={(e) => update({ location: e.target.value })}
            disabled={disabled}
          >
            <option value="">All locations</option>
            {locations.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </label>

        <label className="search-filters__field search-filters__field--narrow">
          <span className="search-filters__label">Year from</span>
          <input
            type="number"
            className="search-filters__input"
            placeholder="e.g. 1990"
            value={filters.yearFrom}
            onChange={(e) => update({ yearFrom: e.target.value })}
            disabled={disabled}
            min={1970}
            max={currentYear}
          />
        </label>

        <label className="search-filters__field search-filters__field--narrow">
          <span className="search-filters__label">Year to</span>
          <input
            type="number"
            className="search-filters__input"
            placeholder={String(currentYear)}
            value={filters.yearTo}
            onChange={(e) => update({ yearTo: e.target.value })}
            disabled={disabled}
            min={1970}
            max={currentYear}
          />
        </label>

        {active && (
          <button
            type="button"
            className="search-filters__clear"
            onClick={() => onChange(DEFAULT_FILTERS)}
            disabled={disabled}
          >
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}

export default SearchFiltersComponent;
