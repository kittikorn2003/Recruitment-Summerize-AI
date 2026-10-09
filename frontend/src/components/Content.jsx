import React, { useState } from "react";
import "./Content.css";
import profile_img from "../assets/LOGO.png";

function Content({ contentData }) {
  const maxScore = contentData && contentData.length > 0
    ? Math.max(...contentData.map(item => parseFloat(item.hybrid_score || 0)))
    : 1;

  return (
    <div className="box">
      {contentData.map((item, index) => {
        
        const currentScore = parseFloat(item.hybrid_score || 0);
        const barWidth = maxScore > 0 ? (currentScore / maxScore) * 100 : 0;

        return (
          <article className="content-card" key={item.id}>
            <section className="card-body">
              <div className="card-info">
                <img
                  className="img_profile"
                  src={`http://localhost:3000${item.profile_image}`}
                  alt="profile"
                />
                <div className="info">
                  <div className="name-row">
                    <h3 className="info-name"> {item.full_name} </h3>
                  </div>
                  <p className="info-exp">Developer</p>

                  <div className="skill-group">
                    {item.skills &&
                      [...item.skills]
                        .sort((a, b) => a.length - b.length)
                        .slice(0, 3)
                        .map((skillName, skillIndex) => (
                          <span className="skill-list" key={skillIndex}>
                            {skillName}
                          </span>
                        ))}
                  </div>
                  <div className="detail">
                    <p className="info-education">
                      <i className="ti ti-school"></i>ITDI, BUU
                    </p>
                    <p className="info-address">
                      <i className="ti ti-map-pin"></i>Chonburi
                    </p>
                    <p className="info-language">
                      <i className="ti ti-language"></i>
                      {item.spoken_languages?.join(", ") || "-"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="card-action">
                <div className="score-box">
                  <div className="match-bar-container">
                    <div 
                      className="match-bar-fill" 
                      style={{ width: `${barWidth}%` }}
                    ></div>
                  </div>
                  <span className="match-score">Match Score</span>
                </div>
                <button
                  className="view-resume"
                  onClick={() => {
                    const pdfUrl = `http://localhost:3000/uploads/resumes/${item.file_name}`;
                    window.open(pdfUrl);
                  }}
                >
                  View Resume
                </button>

              </div>
            </section>

            <hr className="underline" />

            <div className="card-footer">
              <p className="bio">{item.career_summary}</p>
              <time className="time-ago" dateTime="2026-5-20">
                <i className="ti ti-clock-hour-4"></i>5 Days ago
              </time>
            </div>
          </article>
        );
      })}
    </div>
  );
}

export default Content;