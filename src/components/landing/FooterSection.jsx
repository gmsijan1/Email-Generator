import { Link } from "react-router-dom";

function FooterSection() {
  return (
    <>
      {/* Follow-up CTA Section */}
      <section className="landing-followup">
        <div className="landing-followup__content">
          <h2>Questions? Need Help Getting Started?</h2>
          <p>
            Reach out and I'll personally help you set up your first campaign.
          </p>
          <div className="landing-followup__actions">
            <a
              href="mailto:sijangmgr@gmail.com"
              className="landing-button landing-button--primary"
            >
              Contact Us
            </a>
            <Link
              className="landing-button landing-button--ghost"
              to="/register"
            >
              Try It Now
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer" id="footer">
        <div className="landing-footer__content">
          <div className="landing-footer__brand">
            <h3>Fanthom</h3>
            <p>
              Built for B2B SaaS teams who want to scale outbound with
              personalized emails.
            </p>
          </div>
          <div className="landing-footer__links">
            <div className="landing-footer__column">
              <h4>Product</h4>
              <a href="#features">Features</a>
              <a href="#workflow">How It Works</a>
              <Link to="/register">Get Started</Link>
            </div>
            <div className="landing-footer__column">
              <h4>Support</h4>
              <a href="mailto:sijangmgr@gmail.com">Contact Us</a>
              <a href="/docs">Documentation</a>
              <a href="/faq">FAQ</a>
            </div>
            <div className="landing-footer__column">
              <h4>Company</h4>
              <a href="/about">About</a>
              <a href="/privacy">Privacy Policy</a>
              <a href="/terms">Terms of Service</a>
            </div>
          </div>
        </div>
        <div className="landing-footer__bottom">
          <p>&copy; {new Date().getFullYear()} Fanthom. All rights reserved.</p>
        </div>
      </footer>
    </>
  );
}

export default FooterSection;
