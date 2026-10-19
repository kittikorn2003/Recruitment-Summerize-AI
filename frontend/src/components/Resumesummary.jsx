import React from "react";
import "./ResumeSummary.css";

/**
 * Turns the plain-text summary from POST /api/resumes/:id/summarize
 * into sections. Headings are matched by name, so extra spaces, trailing
 * colons, "#" or "**" around a heading don't matter.
 */
const KNOWN_HEADINGS = [
  "Professional Overview",
  "Key Skills",
  "Work Experience",
  "Education",
  "Languages",
  "Projects",
  "Missing Information",
];

const cleanHeading = (line) =>
  line.replace(/^[#*\s]+|[*:\s]+$/g, "").toLowerCase();

const isNotProvided = (s) => /^not provided/i.test(s.trim());

export function parseSummary(text) {
  const lookup = new Map(KNOWN_HEADINGS.map((h) => [h.toLowerCase(), h]));
  const sections = [];
  let current = null;

  String(text || "")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .forEach((line) => {
      const heading = lookup.get(cleanHeading(line));
      if (heading) {
        current = { title: heading, items: [] };
        sections.push(current);
        return;
      }
      if (!current) {
        current = { title: "Professional Overview", items: [] };
        sections.push(current);
      }
      current.items.push(line.replace(/^[-•*]\s+/, ""));
    });

  return sections;
}

/* "2025 – BMI App: Full-stack…"  ->  { year: "2025", rest: "BMI App: Full-stack…" } */
const YEAR_RE = /^((?:19|20)\d{2}(?:\s*[–—-]\s*(?:(?:19|20)\d{2}|present|now))?)\s*[:–—-]\s*(.+)$/i;
const splitYear = (text) => {
  const m = text.match(YEAR_RE);
  return m ? { year: m[1], rest: m[2] } : { year: "", rest: text };
};

function TimelineList({ items, boldTitle }) {
  return (
    <ul className="rs-timeline">
      {items.map((item, i) => {
        const { year, rest } = splitYear(item);
        const colon = boldTitle ? rest.indexOf(": ") : -1;
        return (
          <li key={i}>
            <span className="rs-year">{year}</span>
            <span className="rs-text">
              {colon > 0 ? (
                <>
                  <strong>{rest.slice(0, colon)}</strong>
                  {rest.slice(colon)}
                </>
              ) : (
                rest
              )}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

function Chips({ items, neutral }) {
  return (
    <div className="rs-chips">
      {items.map((s, i) => (
        <span className={`rs-chip${neutral ? " rs-chip-neutral" : ""}`} key={`${s}-${i}`}>
          {s}
        </span>
      ))}
    </div>
  );
}

function Skeleton() {
  return (
    <div className="rs-skeleton" aria-hidden="true">
      <div className="rs-line rs-line-long" />
      <div className="rs-line rs-line-long" />
      <div className="rs-line rs-line-mid" />
      <div className="rs-skeleton-cols">
        <div>
          <div className="rs-line rs-line-short" />
          <div className="rs-line rs-line-long" />
          <div className="rs-line rs-line-mid" />
        </div>
        <div>
          <div className="rs-line rs-line-short" />
          <div className="rs-line rs-line-mid" />
          <div className="rs-line rs-line-long" />
        </div>
      </div>
    </div>
  );
}

function SummaryBody({ text }) {
  const sections = parseSummary(text);

  // The model sometimes answers in a shape we don't recognise: show it as-is.
  if (sections.length === 0) {
    return <p className="rs-paragraph">{text}</p>;
  }

  const byTitle = (t) => sections.find((s) => s.title === t);
  const hasContent = (s) => s && s.items.length > 0 && !s.items.every(isNotProvided);

  const overview = byTitle("Professional Overview");
  const skills = byTitle("Key Skills");
  const languages = byTitle("Languages");
  const education = byTitle("Education");
  const work = byTitle("Work Experience");
  const projects = byTitle("Projects");
  const missing = byTitle("Missing Information");

  // Sections the resume didn't have are collected into one quiet line
  // instead of showing "Not provided" under several headings.
  const absent = [
    ["Work experience", work],
    ["Education", education],
    ["Projects", projects],
    ["Skills", skills],
    ["Languages", languages],
  ]
    .filter(([, s]) => s && !hasContent(s))
    .map(([label]) => label);

  const missingNote =
    missing && hasContent(missing) ? missing.items.join(" ") : "";

  return (
    <>
      {hasContent(overview) && (
        <p className="rs-paragraph">{overview.items.join(" ")}</p>
      )}

      <div className="rs-cols">
        <div className="rs-col">
          {hasContent(work) && (
            <section>
              <h4 className="rs-h">Work experience</h4>
              <TimelineList items={work.items} />
            </section>
          )}
          {hasContent(projects) && (
            <section>
              <h4 className="rs-h">Projects</h4>
              <TimelineList items={projects.items} boldTitle />
            </section>
          )}
        </div>

        <div className="rs-col">
          {hasContent(skills) && (
            <section>
              <h4 className="rs-h">Key skills</h4>
              <Chips items={skills.items} />
            </section>
          )}
          {hasContent(education) && (
            <section>
              <h4 className="rs-h">Education</h4>
              <TimelineList items={education.items} />
            </section>
          )}
          {hasContent(languages) && (
            <section>
              <h4 className="rs-h">Languages</h4>
              <Chips items={languages.items} neutral />
            </section>
          )}
        </div>
      </div>

      {(absent.length > 0 || missingNote) && (
        <p className="rs-absent">
          {absent.length > 0 && <>Not in this resume: {absent.join(", ")}. </>}
          {missingNote}
        </p>
      )}
    </>
  );
}

/**
 * Props:
 *   id      - used for aria-controls (the button points to `summary-${id}`)
 *   status  - "loading" | "success" | "error"
 *   text    - summary text when status is "success"
 *   onRetry - called by the Try again button
 */
export default function ResumeSummary({ id, status, text, onRetry }) {
  return (
    <div
      className="rs-panel"
      id={`summary-${id}`}
      role="region"
      aria-label="Resume summary"
      aria-live="polite"
    >
      <div className="rs-head">
        <i className="ti ti-sparkles" aria-hidden="true" />
        <span className="rs-head-title">AI summary</span>
        <span className="rs-head-note">
          Generated from this resume. Check the original before deciding.
        </span>
      </div>

      {status === "loading" && <Skeleton />}

      {status === "error" && (
        <div className="rs-error">
          <p>We couldn’t summarize this resume. Check your connection and try again.</p>
          <button type="button" className="rs-retry" onClick={onRetry}>
            Try again
          </button>
        </div>
      )}

      {status === "success" && <SummaryBody text={text} />}
    </div>
  );
}