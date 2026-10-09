import React, { useState } from "react";
import { Sparkles, SlidersHorizontal, Target, ArrowRight } from "lucide-react";
import "./LandingPage.css";

/**
 * LandingPage
 * ------------------------------------------------------------------
 * Everything (Navbar, Hero, ProcessFlow, ClosingCta, Footer) lives in
 * this one file as sub-components; styles live in LandingPage.css.
 * No motion/animation — the signal arcs and dot are static.
 *
 * TO INTEGRATE INTO YOUR PROJECT (react-router-dom):
 *   1. (Optional) split each function below into its own file under
 *      components/landing/ (Navbar.jsx, HeroSection.jsx, ProcessFlow.jsx,
 *      FeatureCard.jsx, ClosingCta.jsx, Footer.jsx) if you want smaller files.
 *   2. Replace the `onGetStarted` prop with `useNavigate()` from
 *      react-router-dom, e.g. onClick={() => navigate("/search")}.
 *   3. Swap "ResuMatch" for your real product name (search this file).
 * ------------------------------------------------------------------
 */



function SignalIllustration() {
  const arcPath = "M 120 240 C 200 140, 320 140, 400 100";

  return (
    <svg
      className="rm-hero-illustration"
      viewBox="0 0 480 480"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Illustration of a resume signal reaching candidate profiles"
    >
      <circle cx="240" cy="240" r="210" fill="var(--rm-blush)" />

      {/* resume card */}
      <g transform="translate(70,190)">
        <rect x="0" y="0" width="90" height="110" rx="10" fill="#fff" stroke="var(--rm-ink)" strokeWidth="2" />
        <circle cx="45" cy="28" r="14" fill="var(--rm-blush)" stroke="var(--rm-ink)" strokeWidth="2" />
        <rect x="15" y="52" width="60" height="6" rx="3" fill="var(--rm-slate)" />
        <rect x="15" y="66" width="60" height="6" rx="3" fill="var(--rm-slate)" opacity="0.6" />
        <rect x="15" y="80" width="40" height="6" rx="3" fill="var(--rm-slate)" opacity="0.6" />
      </g>

      {/* dashed signal arcs */}
      <path d="M 120 240 C 190 160, 300 160, 380 130" fill="none" stroke="var(--rm-pink)" strokeWidth="2" strokeDasharray="6 8" opacity="0.55" />
      <path d={arcPath} fill="none" stroke="var(--rm-pink)" strokeWidth="2.5" strokeDasharray="6 8" />
      <path d="M 120 240 C 190 320, 300 320, 380 350" fill="none" stroke="var(--rm-pink)" strokeWidth="2" strokeDasharray="6 8" opacity="0.55" />

      {/* static pulse marker on the highlighted arc */}
      <circle cx="260" cy="152" r="6" fill="var(--rm-pink)" />

      {/* candidate dots */}
      <circle cx="400" cy="100" r="16" fill="var(--rm-ink)" />
      <circle cx="380" cy="130" r="10" fill="#fff" stroke="var(--rm-ink)" strokeWidth="2" />
      <circle cx="380" cy="350" r="12" fill="#fff" stroke="var(--rm-ink)" strokeWidth="2" />
      <circle cx="410" cy="330" r="8" fill="var(--rm-ink)" opacity="0.7" />
    </svg>
  );
}

function HeroSection({ onGetStarted }) {
  return (
    <section className="rm-hero">
      <div className="rm-hero-text">
        <span className="rm-eyebrow">For hiring teams</span>
        <h1 className="rm-h1">
          Find the right candidate
          <br />
          in seconds
        </h1>
        <p className="rm-hero-sub">
          A hybrid resume search that blends keyword matching with AI
          understanding, then narrows results by language, experience,
          and skills instantly.
        </p>
        <div className="rm-hero-actions">
          <button className="rm-cta-primary" onClick={onGetStarted}>
            Start searching <ArrowRight size={18} />
          </button>
          <a href="#process" className="rm-cta-secondary">
            See how it works
          </a>
        </div>
      </div>

      <div className="rm-hero-visual">
        <SignalIllustration />
      </div>
    </section>
  );
}

const steps = [
  {
    number: "01",
    icon: Sparkles,
    title: "Describe who you need",
    description:
      "Search with keywords or describe the role in a sentence. The system understands meaning, not just exact word matches.",
  },
  {
    number: "02",
    icon: SlidersHorizontal,
    title: "Narrow it down",
    description:
      "Filter by spoken language and experience level. Results update instantly without starting a new search.",
  },
  {
    number: "03",
    icon: Target,
    title: "See the best match first",
    description:
      "Results are ranked by match score, combining keyword relevance and semantic meaning, so you don't read every resume.",
  },
];

function FeatureCard({ step }) {
  const Icon = step.icon;
  return (
    <div className="rm-feature-card">
      <div className="rm-feature-top">
        <span className="rm-feature-number">{step.number}</span>
        <span className="rm-feature-icon">
          <Icon size={20} strokeWidth={2} />
        </span>
      </div>
      <h3 className="rm-feature-title">{step.title}</h3>
      <p className="rm-feature-desc">{step.description}</p>
    </div>
  );
}

function ProcessFlow() {
  return (
    <section className="rm-process" id="process">
      <div className="rm-process-path" aria-hidden="true" />
      <div className="rm-process-header">
        <span className="rm-eyebrow">How it works</span>
        <h2 className="rm-h2">Three steps, no guesswork</h2>
      </div>
      <div className="rm-feature-grid">
        {steps.map((step) => (
          <FeatureCard key={step.number} step={step} />
        ))}
      </div>
    </section>
  );
}

function ClosingCta({ onGetStarted }) {
  return (
    <section className="rm-closing">
      <h2 className="rm-h2 rm-closing-title">Ready to find the right candidate?</h2>
      <p className="rm-closing-sub">Start searching right away — no setup required.</p>
      <button className="rm-cta-primary rm-cta-on-dark" onClick={onGetStarted}>
        Start searching <ArrowRight size={18} />
      </button>
    </section>
  );
}

function Footer() {
  return (
    <footer className="rm-footer">
      <span>© {new Date().getFullYear()} ResuMatch</span>
      <div className="rm-footer-links">
        <a href="#">Privacy</a>
        <a href="#">Terms</a>
        <a href="#">Contact</a>
      </div>
    </footer>
  );
}

export default function LandingPage({ onGetStarted = () => {} }) {
  return (
    <div className="rm-landing">
      <HeroSection onGetStarted={onGetStarted} />
      <ProcessFlow />
      <ClosingCta onGetStarted={onGetStarted} />
      <Footer />
    </div>
  );
}