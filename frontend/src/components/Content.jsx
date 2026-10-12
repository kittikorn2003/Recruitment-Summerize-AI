import React from "react";
import "./Content.css";

const timeAgo = (dateStr) => {
  if (!dateStr) return "";
  const mins = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
  if (mins < 60) return `${Math.max(mins, 1)} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
};

function Content({ contentData }) {
  if (!contentData || contentData.length === 0) {
    return <div className="box">No candidates found.</div>;
  }

  return (
    <div className="box">
      {contentData.map((item) => (
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
            <time className="time-ago" dateTime={item.created_at}>
              <i className="ti ti-clock-hour-4"></i>
              {timeAgo(item.created_at)}
            </time>
          </div>
        </article>
      ))}
    </div>
  );
}

export default Content;