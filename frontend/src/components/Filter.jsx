import React from "react";
import "./Filter.css";
import CheckboxGroup from "./CheckboxGroup";

const languageOptions = ["English", "Thai", "Chinese", "Arabic", "Japanes"];
const experienceOptions = ["<1 Year", "1-3 Years", "3-5 Years", ">5 Years"];

function Filter({ searchParams, setSearchParams, searchResume }) {

  // ฟังก์ชัน toggle เดียวใช้ร่วมกันทั้งสอง filter (ตามที่คุยไปก่อนหน้า)
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

  return (
    <div className="sidebar">
      <div className="filter-header">
        <span>Filters</span>
      </div>

      <div className="filter-divider" />

      <CheckboxGroup
        title="Experience"
        options={experienceOptions}
        selected={searchParams.experience}
        onToggle={(opt) => toggleFilter("experience", opt)}
      />

      <div className="filter-divider" />

      <CheckboxGroup
        title="Language"
        options={languageOptions}
        selected={searchParams.languages}
        onToggle={(opt) => toggleFilter("languages", opt)}
      />

      <div className="filter-divider" />

      <button className="apply-btn" onClick={searchResume}>
        Apply Filters
      </button>

      <button className="clear-btn" onClick={handleClearFilters}>
        Clear all filters
      </button>
    </div>
  );
}

export default Filter;