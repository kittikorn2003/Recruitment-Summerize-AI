import React from "react";
import "./Page.css";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import Filter from "../components/Filter";
import Content from "../components/Content";

function Page({
  results, hasSearched, searchParams, setSearchParams, searchResume,
  page, total, pageSize, onPageChange,
}) {

  const handleSearch = () => {
    searchResume();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      searchResume();
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const visibleResults = hasSearched
    ? results.slice((page - 1) * pageSize, page * pageSize)
    : results;

  const goTo = (p) => {
    onPageChange(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="page-container">

      {/* =========================
          SEARCH SECTION
      ========================= */}
      <section className="candidate-search-section">

        <div className="candidate-search-header">
          <span className="search-eyebrow">
            Candidate Search
          </span>

          <h1>
            Find the right candidate
          </h1>

          <p>
            Search candidates by skills, role, experience, or describe
            who you are looking for.
          </p>
        </div>

        <div className="candidate-search-box">

          <div className="candidate-search-input-wrapper">

            <Search
              size={20}
              strokeWidth={2}
              className="candidate-search-icon"
            />

            <input
              type="text"
              placeholder="e.g. Node.js developer with Docker experience"
              value={searchParams.q}
              onChange={(e) =>
                setSearchParams((prev) => ({
                  ...prev,
                  q: e.target.value,
                }))
              }
              onKeyDown={handleKeyDown}
            />

          </div>

          <button
            className="candidate-search-button"
            onClick={handleSearch}
          >
            Search
          </button>

        </div>

      </section>


      {/* =========================
          RESULTS
      ========================= */}
      <section className="candidate-results-section">

        <Filter
          searchParams={searchParams}
          setSearchParams={setSearchParams}
          searchResume={searchResume}
        />

        <div className="candidate-results">
          <div className="results-header">
            <h2>{hasSearched ? "Search Results" : "Latest Candidates"}</h2>
            <span>
              {hasSearched ? `${total} candidates found` : `${total} candidates`}
            </span>
          </div>

          <Content contentData={visibleResults} />

          {totalPages > 1 && (
            <div className="pagination">
              <button className="pagination-btn" onClick={() => goTo(page - 1)} disabled={page === 1}>
                <ChevronLeft size={16} /> Previous
              </button>
              <span className="pagination-info">Page {page} of {totalPages}</span>
              <button className="pagination-btn" onClick={() => goTo(page + 1)} disabled={page === totalPages}>
                Next <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>

      </section>

    </div>
  );
}

export default Page;