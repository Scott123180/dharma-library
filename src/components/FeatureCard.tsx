type FeatureCardProps = {
  title: string;
  description: string;
  status: string;
};

function FeatureCard({ title, description, status }: FeatureCardProps) {
  return (
    <article className="feature-card">
      <div className="feature-card__status">{status}</div>
      <h3>{title}</h3>
      <p>{description}</p>
    </article>
  );
}

export default FeatureCard;
