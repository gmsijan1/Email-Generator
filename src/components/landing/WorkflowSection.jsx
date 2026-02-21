const steps = [
  {
    title: "Enter prospect info",
    description: "Add company, context, pain points, and your goal.",
  },
  {
    title: "Generate drafts",
    description: "Receive two high-quality variants tailored to your tone.",
  },
  {
    title: "Save in your grid",
    description: "Review drafts alongside every active prospect.",
  },
  {
    title: "Edit, copy, send",
    description: "Make quick tweaks and send with confidence.",
  },
];

function WorkflowSection() {
  return (
    <section className="landing-section landing-section--alt" id="workflow">
      <div className="landing-section__header">
        <h2>How it works</h2>
        <p>Follow a simple flow that matches your sales process.</p>
      </div>
      <div className="landing-steps">
        {steps.map((step, index) => (
          <div className="landing-step" key={step.title}>
            <div className="landing-step__number">{index + 1}</div>
            <div>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default WorkflowSection;
