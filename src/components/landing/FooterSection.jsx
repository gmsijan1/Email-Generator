import { Link } from "react-router-dom";

function FooterSection() {
  return (
    <footer className="landing-footer" id="footer">
      <div className="landing-footer__cta">
        <h2>Ready to generate your next demo?</h2>
        <p>Start creating personalized outbound emails in minutes.</p>
        <Link className="landing-button landing-button--primary" to="/register">
          Get Started
        </Link>
      </div>
      <div className="landing-footer__links">
        <div className="landing-footer__brand">Email Generator</div>
        <div className="landing-footer__nav">
          <a href="#features">Features</a>
          <a href="#workflow">Workflow</a>
          <a href="#testimonials">Testimonials</a>
        </div>
        <div className="landing-footer__legal">
          <a href="/privacy">Privacy</a>
          <a href="mailto:hello@emailgenerator.com">Contact</a>
          <a href="/about">About</a>
        </div>
      </div>
    </footer>
  );
}

export default FooterSection;
