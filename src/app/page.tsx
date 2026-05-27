import { Nav } from "@/components/landing/Nav";
import { Hero } from "@/components/landing/Hero";
import { BeforeAfter } from "@/components/landing/BeforeAfter";
import { Features } from "@/components/landing/Features";
import { ThemePicker } from "@/components/landing/ThemePicker";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Compare } from "@/components/landing/Compare";
import { Cta } from "@/components/landing/Cta";
import { Footer } from "@/components/landing/Footer";

export default function HomePage() {
  return (
    <>
      <Nav />
      <main className="flex-1">
        <Hero />
        <BeforeAfter />
        <HowItWorks />
        <Features />
        <ThemePicker />
        <Compare />
        <Cta />
      </main>
      <Footer />
    </>
  );
}
