import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import Navbar from "@/components/Navbar";
import SupportedCurrencies from "@/components/SupportedCurrencies";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#192231]">
      <Navbar />
      <HeroSection />
      <SupportedCurrencies />
      <Footer />
    </div>
  );
}
