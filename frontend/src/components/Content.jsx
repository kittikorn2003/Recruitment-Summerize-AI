import React, { useState } from "react";
import axios from "axios";
import ResumeSummary from "./Resumesummary";
import "./Content.css";

const timeAgo = (dateStr) => {
  if (!dateStr) return "";

  const mins = Math.floor(
    (Date.now() - new Date(dateStr).getTime()) / 60000
  );

  if (mins < 60) return `${Math.max(mins, 1)} min ago`;

  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hr ago`;

  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
};

function Content({ contentData }) {
  // summaries[id] = { status: "loading" | "success" | "error", text }
  const [summaries, setSummaries] = useState({});
  // which cards currently show their summary panel
  const [openIds, setOpenIds] = useState({});

  const fetchSummary = async (id) => {
    setSummaries((prev) => ({ ...prev, [id]: { status: "loading", text: "" } }));
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `http://localhost:3000/api/resumes/${id}/summarize`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const d = response.data?.data;
      const text = typeof d === "string" ? d : d?.summary ?? "";
      setSummaries((prev) => ({ ...prev, [id]: { status: "success", text } }));
    } catch (err) {
      console.error("Summarize error", err);
      setSummaries((prev) => ({ ...prev, [id]: { status: "error", text: "" } }));
    }
  };

  const toggleSummary = (id) => {
    if (openIds[id]) {
      setOpenIds((prev) => ({ ...prev, [id]: false }));
      return;
    }
    setOpenIds((prev) => ({ ...prev, [id]: true }));
    // Only call the API the first time (or after an error). Later opens
    // reuse the saved text, so the user isn't charged for another AI call.
    const existing = summaries[id];
    if (!existing || existing.status === "error") fetchSummary(id);
  };

  if (!contentData || contentData.length === 0) {
    return (
      <div className="empty-candidates">
        <h3>No candidates found</h3>
        <p>Try searching with different keywords.</p>
      </div>
    );
  }

  return (
    <div className="box">
      {contentData.map((item) => {
        const institutions = [
          ...new Set(
            (Array.isArray(item.education) ? item.education : [])
              .map((edu) => edu.institution?.trim())
              .filter(Boolean)
          ),
        ];

        const skills = Array.isArray(item.skills)
          ? item.skills.slice(0, 3)
          : [];

        const summary = summaries[item.id];
        const isOpen = !!openIds[item.id];
        const isLoading = summary?.status === "loading";

        return (
          <article className="content-card" key={item.id}>
            <div className="card-main">
              <img
                className="img_profile"
                src={
                  item.profile_image
                    ? `http://localhost:3000${item.profile_image}`
                    : "/default-avatar.png"
                }
                alt={`${item.full_name || "Candidate"} profile`}
                loading="lazy"
              />

              <div className="info">
                <h3 className="info-name">
                  {item.full_name || "Unnamed Candidate"}
                </h3>

                <p className="info-exp">Candidate</p>

                <div className="skill-group">
                  {skills.map((skill, index) => (
                    <span className="skill-list" key={`${skill}-${index}`}>
                      {skill}
                    </span>
                  ))}
                </div>

                <div className="detail">
                  {institutions.length > 0 && (
                    <p
                      className="info-education"
                      title={institutions.join(", ")}
                    >
                      <i className="ti ti-school" />
                      <span>{institutions.join(", ")}</span>
                    </p>
                  )}

                  {item.spoken_languages?.length > 0 && (
                    <p className="info-language">
                      <i className="ti ti-language" />
                      <span>{item.spoken_languages.join(", ")}</span>
                    </p>
                  )}
                </div>
              </div>

              <div className="card-action">
                <button
                  type="button"
                  className="view-resume"
                  onClick={() => {
                    const pdfUrl =
                      `http://localhost:3000/uploads/resumes/` +
                      encodeURIComponent(item.file_name);

                    window.open(pdfUrl, "_blank", "noopener,noreferrer");
                  }}
                >
                  View Resume
                </button>

                <button
                  type="button"
                  className="summarize-btn"
                  onClick={() => toggleSummary(item.id)}
                  disabled={isLoading}
                  aria-expanded={isOpen}
                  aria-controls={`summary-${item.id}`}
                >
                  <i
                    className={`ti ${isOpen && !isLoading ? "ti-chevron-up" : "ti-sparkles"}`}
                    aria-hidden="true"
                  />
                  {isLoading
                    ? "Summarizing…"
                    : isOpen
                    ? "Hide"
                    : "Summarize"}
                </button>
              </div>
            </div>

            {item.career_summary && (
              <div className="card-footer">
                <p className="bio">{item.career_summary}</p>

                <time
                  className="time-ago"
                  dateTime={item.created_at}
                  title={
                    item.created_at
                      ? new Date(item.created_at).toLocaleString()
                      : ""
                  }
                >
                  <i className="ti ti-clock-hour-4" />
                  {timeAgo(item.created_at)}
                </time>
              </div>
            )}

            {!item.career_summary && (
              <div className="card-footer">
                <p className="bio bio-empty">
                  No career summary provided.
                </p>

                <time
                  className="time-ago"
                  dateTime={item.created_at}
                >
                  <i className="ti ti-clock-hour-4" />
                  {timeAgo(item.created_at)}
                </time>
              </div>
            )}

            {isOpen && summary && (
              <ResumeSummary
                id={item.id}
                status={summary.status}
                text={summary.text}
                onRetry={() => fetchSummary(item.id)}
              />
            )}
          </article>
        );
      })}
    </div>
  );
}

export default Content;