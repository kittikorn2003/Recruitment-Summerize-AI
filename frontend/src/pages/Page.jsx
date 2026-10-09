import React from "react";
import "./Page.css";
import { Search } from "lucide-react";

import Filter from "../components/Filter";
import Content from "../components/Content";

function Page({
  results,
  hasSearched,
  searchParams,
  setSearchParams,
  searchResume,
}) {

  const handleSearch = () => {
    searchResume();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      searchResume();
    }
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

          {hasSearched && (
            <div className="results-header">
              <h2>Search Results</h2>

              <span>
                {results.length} candidates found
              </span>
            </div>
          )}

          <Content contentData={results} />

        </div>

      </section>

    </div>
  );
}

export default Page;