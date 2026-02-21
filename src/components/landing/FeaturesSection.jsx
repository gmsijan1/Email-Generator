const features = [
  {
    title: "Generate emails instantly",
    description:
      "Create polished drafts in seconds without starting from scratch.",
  },
  {
    title: "Personalize every outreach",
    description:
      "Inject prospect context, pain points, and goals automatically.",
  },
  {
    title: "Keep drafts organized",
    description: "Save, revisit, and edit drafts in a single dashboard.",
  },
  {
    title: "Stay on-brand",
    description: "Maintain your tone and CTA style across every email.",
  },
];

function FeaturesSection() {
  return (
    <section className="landing-section" id="features">
      <div className="landing-section__header">
        <h2>Why teams choose us</h2>
        <p>Everything you need to go from prospect to booked demo.</p>
      </div>
      <div className="landing-grid">
        {features.map((feature) => (
          <div className="landing-card" key={feature.title}>
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default FeaturesSection;
