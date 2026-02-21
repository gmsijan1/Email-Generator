const testimonials = [
  {
    quote:
      "We cut our outbound prep time in half and booked more first calls in two weeks.",
    name: "Morgan Lee",
    title: "Sales Lead, B2B SaaS",
  },
  {
    quote:
      "The drafts are clean, human, and easy to personalize for each prospect.",
    name: "Casey Patel",
    title: "Account Executive",
  },
];

function TestimonialsSection() {
  return (
    <section className="landing-section" id="testimonials">
      <div className="landing-section__header">
        <h2>Sales teams see results fast</h2>
        <p>Lightweight proof to build confidence in your workflow.</p>
      </div>
      <div className="landing-grid landing-grid--two">
        {testimonials.map((testimonial) => (
          <div
            className="landing-card landing-card--quote"
            key={testimonial.name}
          >
            <p className="landing-quote">“{testimonial.quote}”</p>
            <div className="landing-quote__meta">
              <span>{testimonial.name}</span>
              <span>{testimonial.title}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default TestimonialsSection;
