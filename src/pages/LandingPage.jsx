import HeroSection from "../components/landing/HeroSection";
import FeaturesSection from "../components/landing/FeaturesSection";
import WorkflowSection from "../components/landing/WorkflowSection";
import TestimonialsSection from "../components/landing/TestimonialsSection";
import FooterSection from "../components/landing/FooterSection";
import "./LandingPage.css";

function LandingPage() {
  return (
    <div className="landing">
      <HeroSection />
      <FeaturesSection />
      <WorkflowSection />
      <TestimonialsSection />
      <FooterSection />
    </div>
  );
}

export default LandingPage;
