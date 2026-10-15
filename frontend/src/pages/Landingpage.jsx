import React, { useState } from "react";
import { Search, SlidersHorizontal, ListChecks, UserPlus, ShieldCheck, ArrowRight } from "lucide-react";
import "./LandingPage.css";

/**
 * LandingPage
 * ------------------------------------------------------------------
 * The hero changes with who is looking at it:
 *   - guest (not signed in)        -> Sign in / Create account
 *   - signed in, not HR or admin   -> Request HR access
 *   - HR or admin                  -> working search box
 *
 * Props:
 *   user              - the user object from App (null when signed out)
 *   loading           - true while App is still fetching the user, so we
 *                       don't flash the guest view for a signed-in person
 *   onSignIn()        - open the sign-in modal
 *   onSignUp()        - open the sign-up modal
 *   onRequestAccess() - navigate("/role-request")
 *   onSearch(query)   - HR/admin submitted a query from the hero
 *   onGoToSearch()    - navigate("/search") with no query
 *
 * ASSUMPTION: the role lives at user.role and is "hr" or "admin".
 * If your field is named differently, change getAccess() below.
 * ------------------------------------------------------------------
 */

const EXAMPLE_QUERIES = ["React", "Accountant", "Python", "Project Manager"];

function getAccess(user) {
  if (!user) return "guest";
  const role = String(user.role ?? "").toLowerCase();
  return role === "hr" || role === "admin" ? "searcher" : "member";
}

/* A static preview of the real results page. Names and snippets are samples. */
function ResultsPreview() {
  return (
    <div className="rm-preview" role="img" aria-label="Sample search results with highlighted keywords">
      <div className="rm-preview-bar">
        <Search size={16} aria-hidden="true" />
        <span className="rm-preview-query">React Node.js</span>
        <span className="rm-chip">English</span>
        <span className="rm-chip">3+ years</span>
      </div>

      <div className="rm-preview-card">
        <div className="rm-preview-avatar" aria-hidden="true">SP</div>
        <div className="rm-preview-body">
          <div className="rm-preview-head">
            <strong>Somchai P.</strong>
            <span className="rm-preview-hits">2 of 2 keywords</span>
          </div>
          <span className="rm-preview-role">Frontend Developer</span>
          <p className="rm-preview-snippet">
            …built admin dashboards with <mark>React</mark> and a{" "}
            <mark>Node.js</mark> API for order tracking…
          </p>
        </div>
      </div>

      <div className="rm-preview-card rm-preview-card-second">
        <div className="rm-preview-avatar" aria-hidden="true">NK</div>
        <div className="rm-preview-body">
          <div className="rm-preview-head">
            <strong>Natthida K.</strong>
            <span className="rm-preview-hits rm-preview-hits-partial">1 of 2 keywords</span>
          </div>
          <span className="rm-preview-role">Backend Engineer</span>
          <p className="rm-preview-snippet">
            …maintained <mark>Node.js</mark> services handling payments and
            reporting…
          </p>
        </div>
      </div>
    </div>
  );
}

function SearchBox({ onSearch }) {
  const [query, setQuery] = useState("");

  const submit = (e) => {
    e.preventDefault();
    const q = query.trim();
    if (q) onSearch(q);
  };

  return (
    <>
      <form className="rm-search" onSubmit={submit} role="search">
        <Search size={18} className="rm-search-icon" aria-hidden="true" />
        <input
          type="text"
          className="rm-search-input"
          placeholder="Try “React developer” or “Accountant”"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search resumes by keyword"
        />
        <button type="submit" className="rm-cta-primary" disabled={!query.trim()}>
          Search
        </button>
      </form>
      <div className="rm-examples">
        <span className="rm-examples-label">Popular searches</span>
        {EXAMPLE_QUERIES.map((q) => (
          <button key={q} type="button" className="rm-example" onClick={() => onSearch(q)}>
            {q}
          </button>
        ))}
      </div>
    </>
  );
}

function HeroActions({ access, loading, handlers }) {
  if (loading) return <div className="rm-hero-actions-placeholder" aria-hidden="true" />;

  if (access === "searcher") {
    return <SearchBox onSearch={handlers.onSearch} />;
  }

  if (access === "member") {
    return (
      <>
        <div className="rm-hero-actions">
          <button className="rm-cta-primary" onClick={handlers.onRequestAccess}>
            Request HR access <ArrowRight size={18} />
          </button>
        </div>
        <p className="rm-access-note">
          Your account can’t search resumes yet. An admin reviews each HR
          request and approves it.
        </p>
      </>
    );
  }

  return (
    <>
      <div className="rm-hero-actions">
        <button className="rm-cta-primary" onClick={handlers.onSignUp}>
          Create account
        </button>
        <button className="rm-cta-outline" onClick={handlers.onSignIn}>
          Sign in
        </button>
      </div>
      <p className="rm-access-note">
        Resume search is available to approved HR accounts. Sign up, then
        request HR access.
      </p>
    </>
  );
}

function HeroSection({ access, loading, handlers }) {
  return (
    <section className="rm-hero">
      <div className="rm-hero-text">
        <span className="rm-tag">For hiring teams</span>
        <h1 className="rm-h1">Find the right candidate in seconds</h1>
        <p className="rm-hero-sub">
          Search every resume by the skills, titles, and tools you need.
          Filter by language and experience, and see exactly where each
          keyword appears.
        </p>
        <HeroActions access={access} loading={loading} handlers={handlers} />
      </div>

      <div className="rm-hero-visual">
        <ResultsPreview />
      </div>
    </section>
  );
}

const steps = [
  {
    number: "1",
    icon: UserPlus,
    title: "Create an account",
    description: "Sign up and sign in. Every new account starts as a regular user.",
  },
  {
    number: "2",
    icon: ShieldCheck,
    title: "Request HR access",
    description:
      "Send a request from your account. An admin reviews it and approves HR accounts.",
  },
  {
    number: "3",
    icon: Search,
    title: "Search by keyword",
    description:
      "Type skills, job titles, or tools such as “Node.js” or “Project Manager”. Every resume is searched.",
  },
  {
    number: "4",
    icon: ListChecks,
    title: "Filter and check",
    description:
      "Narrow by language and experience. Your keywords are highlighted in each resume, so you can confirm a match fast.",
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
      <div className="rm-process-header">
        <h2 className="rm-h2">From sign-up to shortlist</h2>
      </div>
      <div className="rm-feature-grid">
        {steps.map((step) => (
          <FeatureCard key={step.number} step={step} />
        ))}
      </div>
    </section>
  );
}

function ClosingCta({ access, loading, handlers }) {
  if (loading) return null;

  const config = {
    guest: {
      title: "Ready to start hiring?",
      sub: "Create an account, then request HR access.",
      label: "Create account",
      action: handlers.onSignUp,
    },
    member: {
      title: "Need to search resumes?",
      sub: "Send an HR access request for an admin to review.",
      label: "Request HR access",
      action: handlers.onRequestAccess,
    },
    searcher: {
      title: "Ready to find your next hire?",
      sub: "Search your resume database by keyword.",
      label: "Start searching",
      action: handlers.onGoToSearch,
    },
  }[access];

  return (
    <section className="rm-closing">
      <h2 className="rm-h2 rm-closing-title">{config.title}</h2>
      <p className="rm-closing-sub">{config.sub}</p>
      <button className="rm-cta-primary rm-cta-on-dark" onClick={config.action}>
        {config.label} <ArrowRight size={18} />
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

export default function LandingPage({
  user = null,
  loading = false,
  onSignIn = () => {},
  onSignUp = () => {},
  onRequestAccess = () => {},
  onSearch = () => {},
  onGoToSearch = () => {},
}) {
  const access = getAccess(user);
  const handlers = { onSignIn, onSignUp, onRequestAccess, onSearch, onGoToSearch };

  return (
    <div className="rm-landing">
      <HeroSection access={access} loading={loading} handlers={handlers} />
      <ProcessFlow />
      <ClosingCta access={access} loading={loading} handlers={handlers} />
      <Footer />
    </div>
  );
}