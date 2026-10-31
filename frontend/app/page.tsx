"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import InteractivePlayground from "@/components/InteractivePlayground";
import BentoFeatures from "@/components/BentoFeatures";
import ModelComparison from "@/components/ModelComparison";
import CodeShowcase from "@/components/CodeShowcase";
import PricingSection from "@/components/PricingSection";
import Testimonials from "@/components/Testimonials";
import FaqSection from "@/components/FaqSection";
import CtaBanner from "@/components/CtaBanner";
import Footer from "@/components/Footer";
import ContactModal from "@/components/ContactModal";
import VideoModal from "@/components/VideoModal";
import CustomCursor from "@/components/CustomCursor";

export default function Home() {
  const [demoModalOpen, setDemoModalOpen] = useState(false);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | undefined>(undefined);

  const handleOpenDemo = (planName?: string) => {
    setSelectedPlan(planName);
    setDemoModalOpen(true);
  };

  return (
    <div className="relative min-h-screen bg-[#06070a] text-zinc-100 selection:bg-indigo-600 selection:text-white">
      {/* Subtle Custom Mouse Glow Cursor */}
      <CustomCursor />

      {/* Navigation */}
      <Navbar onOpenDemoModal={() => handleOpenDemo()} />

      {/* Main Page Sections */}
      <main>
        <Hero
          onOpenDemoModal={() => handleOpenDemo()}
          onOpenVideoModal={() => setVideoModalOpen(true)}
        />
        <InteractivePlayground />
        <BentoFeatures />
        <ModelComparison />
        <CodeShowcase />
        <PricingSection onSelectPlan={(plan) => handleOpenDemo(plan)} />
        <Testimonials />
        <FaqSection onOpenDemoModal={() => handleOpenDemo()} />
        <CtaBanner onOpenDemoModal={() => handleOpenDemo()} />
      </main>

      {/* Footer */}
      <Footer />

      {/* Interactive Modals */}
      <ContactModal
        isOpen={demoModalOpen}
        onClose={() => setDemoModalOpen(false)}
        initialPlan={selectedPlan}
      />
      <VideoModal
        isOpen={videoModalOpen}
        onClose={() => setVideoModalOpen(false)}
      />
    </div>
  );
}
