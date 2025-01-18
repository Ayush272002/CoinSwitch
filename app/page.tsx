import HeroSection from "@/components/HeroSection";
import Navbar from "@/components/Navbar";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#192231]">
      <Navbar />
      <HeroSection />
    </div>
  );
}
