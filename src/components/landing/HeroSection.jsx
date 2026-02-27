import { Link } from "react-router-dom";

function HeroSection() {
  return (
    <section className="landing-hero">
      <div className="landing-hero__content">
        <span className="landing-hero__eyebrow">Fanthom</span>
        <div className="landing-hero__text">
          <h1 className="landing-hero__title">
            Generate high-converting B2B sales emails in seconds
          </h1>
          <p className="landing-hero__subtitle">
            Best for B2B SaaS founders, sales teams, and growth leaders.
          </p>
          <p className="landing-hero__description">
            Used by teams selling software, platforms, and services to other
            businesses.
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
              <br />

              <p>
                Noticed you’re leading growth at NimbusCRM. Most SaaS teams your
                size lose over half of outbound replies before they ever reach
                pipeline.
              </p>
              <br />
              <p>
                Teams using our outbound framework consistently convert more
                replies into booked demos without increasing volume.
              </p>
              <p>
                Happy to share a 3-step teardown we use for SaaS teams running
                30–50 demos a month. Worth a quick look?{" "}
              </p>
              <br />

              <p>Jordan, RevOps</p>
              <p>OutboundWorks</p>
              <p>Book time here: https://cal.com/outboundworks/</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
