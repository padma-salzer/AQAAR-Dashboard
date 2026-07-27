import React from "react";
import { sectionTitle } from "../utils/styles";

const FilterSection = ({
  fromDate,
  setFromDate,
  toDate,
  setToDate,
  dropdownRef,
  showStatusDropdown,
  setShowStatusDropdown,
  projectStatusFilter,
  handleProjectStatusChange,
  projects,
  selectedProject,
  setSelectedProject,
  onApply,
  onExportPDF,
  error,
}) => {
  return (
    <div
      style={{
        marginBottom: "24px",
        padding: "12px 0",
      }}
    >
      <h2 style={sectionTitle}>Filters</h2>

      <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
        <input
          type="date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          style={{
            padding: "8px",
            borderRadius: "6px",
            border: "1px solid #ccc",
            fontSize: "16px",
            fontFamily: "inherit",
          }}
        />

        <input
          type="date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          style={{
            padding: "8px",
            borderRadius: "6px",
            border: "1px solid #ccc",
            fontSize: "16px",
            fontFamily: "inherit",
          }}
        />

        <div ref={dropdownRef} style={{ position: "relative" }}>
          <button
            onClick={() => setShowStatusDropdown((prev) => !prev)}
            style={{
              padding: "8px 12px",
              border: "1px solid #ccc",
              borderRadius: "6px",
              background: "#fff",
              cursor: "pointer",
              minWidth: "160px",
              textAlign: "left",
              fontSize: "16px",
            }}
          >
            Project Status
            {projectStatusFilter.length > 0 && (
              <span
                style={{
                  marginLeft: "9px",
                  background: "#0052CC",
                  color: "#fff",
                  borderRadius: "12px",
                  padding: "2px 6px",
                  fontSize: "12px",
                }}
              >
                +{projectStatusFilter.length}
              </span>
            )}
          </button>

          {showStatusDropdown && (
            <div
              style={{
                position: "absolute",
                top: "40px",
                left: 0,
                background: "#fff",
                border: "1px solid #ccc",
                borderRadius: "6px",
                padding: "8px",
                zIndex: 10,
                width: "180px",
              }}
            >
              {["Others"].map((status) => (
                <label
                  key={status}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "4px 0",
                    cursor: "pointer",
                    fontSize: "16px",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={projectStatusFilter.includes(status)}
                    onChange={() => handleProjectStatusChange(status)}
                  />
                  {status}
                </label>
              ))}
            </div>
          )}
        </div>

        <select
          value={selectedProject}
          onChange={(e) => setSelectedProject(e.target.value)}
          style={{
            padding: "8px",
            borderRadius: "6px",
            border: "1px solid #ccc",
            fontSize: "16px",
          }}
        >
          {projects.length === 0 ? (
            <option value="">No projects available</option>
          ) : (
            projects.map((project) => (
              <option key={project.id} value={project.key}>
                {project.name}
              </option>
            ))
          )}
        </select>

        <button
          onClick={onApply}
          style={{
            padding: "8px 18px",
            backgroundColor: "#0052CC",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "500",
            fontSize: "16px",
          }}
        >
          Apply
        </button>
      </div>

      {error && (
        <div style={{ color: "red", marginTop: "8px" }}>
          {error}
        </div>
      )}
    </div>
  );
};

export default FilterSection;