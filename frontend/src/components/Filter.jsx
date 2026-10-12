import React from "react";
import "./Filter.css";
import CheckboxGroup from "./CheckboxGroup";

const languageOptions = ["English", "Thai", "Chinese", "Arabic", "Japanese"];
const experienceOptions = ["<1 Year", "1-3 Years", "3-5 Years", ">5 Years"];

function Filter({ searchParams, setSearchParams, searchResume }) {
  const toggleFilter = (key, value) => {
    setSearchParams((prev) => {
      const isSelected = prev[key].includes(value);
      return {
        ...prev,
        [key]: isSelected
          ? prev[key].filter((item) => item !== value)
          : [...prev[key], value],
      };
    });
  };

  const handleClearFilters = () => {
    setSearchParams((prev) => ({
      ...prev,
      languages: [],
      experience: [],
    }));
  };

  const activeCount =
    searchParams.experience.length + searchParams.languages.length;

  return (
    <div className="sidebar">
      <div className="filter-header">
        <div className="filter-header-title">
          <span>Filters</span>
          {activeCount > 0 && (
            <span className="filter-badge">{activeCount}</span>
          )}
        </div>

        <button
          className="filter-clear-link"
          onClick={handleClearFilters}
          disabled={activeCount === 0}
        >
          Clear all
        </button>
      </div>

      <CheckboxGroup
        title="Experience"
        options={experienceOptions}
        selected={searchParams.experience}
        onToggle={(opt) => toggleFilter("experience", opt)}
      />

      <CheckboxGroup
        title="Language"
        options={languageOptions}
        selected={searchParams.languages}
        onToggle={(opt) => toggleFilter("languages", opt)}
      />

      <button className="apply-btn" onClick={searchResume}>
        Apply Filters
      </button>
    </div>
  );
}

export default Filter;