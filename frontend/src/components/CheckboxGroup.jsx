import React from "react";

function CheckboxGroup({ title, options, selected, onToggle }) {
  return (
    <div className="filter-section">
      <div className="filter-section-title">{title}</div>

      <div className="item-box">
        {options.map((opt) => (
          <label key={opt} className="filter-label">
            <input
              className="checkbox"
              type="checkbox"
              checked={selected.includes(opt)}
              onChange={() => onToggle(opt)}
            />
            <span>{opt}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

export default CheckboxGroup;