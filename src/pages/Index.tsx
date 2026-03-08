import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HeroSection from "@/components/landing/HeroSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import RolesSection from "@/components/landing/RolesSection";
import TeamSection from "@/components/landing/TeamSection";
import CTASection from "@/components/landing/CTASection";

const Index = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <HeroSection />
    <FeaturesSection />
    <HowItWorksSection />
    <RolesSection />
    <TeamSection />
    <CTASection />
    <Footer />
  </div>
);

export default Index;
