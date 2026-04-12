import { RelevanceTier } from "../../types/search";
import { TIER_DOTS, TIER_LABELS } from "../../utils/relevance";

type Props = {
  tier: RelevanceTier;
};

function RelevanceIndicator({ tier }: Props) {
  const filled = TIER_DOTS[tier];
  const label = TIER_LABELS[tier];

  return (
    <span
      className="relevance-indicator"
      aria-label={label}
      title={label}
    >
      {Array.from({ length: 4 }, (_, i) => (
        <span
          key={i}
          className={`relevance-dot${i < filled ? " relevance-dot--filled" : ""}`}
        />
      ))}
      <span className="relevance-label">{label}</span>
    </span>
  );
}

export default RelevanceIndicator;
