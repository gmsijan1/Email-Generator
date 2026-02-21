import { Link } from "react-router-dom";

function HeroSection() {
  return (
    <section className="landing-hero">
      <div className="landing-hero__content">
        <span className="landing-hero__eyebrow">B2B Sales Email Generator</span>
        <h1 className="landing-hero__title">
          Generate high-converting B2B sales emails in seconds
        </h1>
        <p className="landing-hero__subtitle">
          For SaaS sales teams looking to book more demos with personalized,
          ready-to-send drafts.
        </p>
        <div className="landing-hero__actions">
          <Link
            className="landing-button landing-button--primary"
            to="/register"
          >
            Get Started
          </Link>
          <Link className="landing-button landing-button--ghost" to="/login">
            Log In
          </Link>
        </div>
        <div className="landing-hero__trust">
          Save hours each week • Keep drafts organized • Built for SaaS teams
        </div>
      </div>
      <div className="landing-hero__preview">
        <div className="landing-preview">
          <div className="landing-preview__header">Draft Preview</div>
          <div className="landing-preview__body">
            <p>Hi Alex,</p>
            <p>
              Noticed your team is scaling outbound. We help SaaS sales teams
              turn cold outreach into booked demos with personalized messaging.
            </p>
            <p>
              Want a 12-minute walkthrough to see how it could fit your
              workflow?
            </p>
            <p>— Jordan, RevOps</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
