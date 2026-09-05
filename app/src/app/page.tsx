import { Hero } from "@/components/Hero";
import { HowItWorks } from "@/components/HowItWorks";
import { TheProblem } from "@/components/TheProblem";
import { CitationGraph } from "@/components/CitationGraph";
import { RiskBreakdown } from "@/components/RiskBreakdown";
import { Features } from "@/components/Features";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Hero />
      <HowItWorks />
      <TheProblem />
      <CitationGraph />
      <RiskBreakdown />
      <Features />
      <Footer />
    </>
  );
}
