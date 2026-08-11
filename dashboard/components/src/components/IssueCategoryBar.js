import React from "react";
import { router } from "@forge/bridge";
import { card, sectionTitle } from "../utils/styles";

const IssueCategoryBar = ({
  issueCategoryData,
  fromDate,
  toDate,
  selectedProject,
}) => {
  const maxCount = Math.max(
    ...issueCategoryData.map((item) => item.count),
    1,
  );

  const getCategoryJql = (category) => {
    let jql = `cf[10778] = "${category}" AND created >= "${fromDate}" AND created <= "${toDate} 23:59"`;

    if (selectedProject) {
      jql += ` AND project = "${selectedProject}"`;
    }

    return jql;
  };

  return (
    <div
      id="issue-category-donut"
      style={{
        ...card,
        width: "100%",
        boxSizing: "border-box",
        marginBottom: "16px",
      }}
    >
      <h2
        style={{
          ...sectionTitle,
          margin: "0 0 16px 0",
        }}
      >
        Tickets by Issue Type
      </h2>

      {issueCategoryData.length === 0 && (
        <p>No tickets available</p>
      )}

      {issueCategoryData.length > 0 && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          {issueCategoryData.map((item) => {
            const barWidth = `${(item.count / maxCount) * 100}%`;

            const jql = getCategoryJql(item.category);

            return (
              <div
                key={item.category}
                onClick={() =>
                  router.open(
                    `/issues/?jql=${encodeURIComponent(jql)}`,
                  )
                }
                style={{
                  display: "grid",
                  gridTemplateColumns: "150px 1fr 40px",
                  alignItems: "center",
                  gap: "10px",
                  cursor: "pointer",
                  fontSize: "16px",
                }}
              >
                {/* Category */}
                <span
                  style={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                  title={item.category}
                >
                  {item.category}
                </span>

                {/* Bar */}
                <div
                  style={{
                    width: "100%",
                    height: "18px",
                    backgroundColor: "#F4F5F7",
                    borderRadius: "3px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: barWidth,
                      height: "100%",
                      backgroundColor: "#73FBFD",
                      borderRadius: "3px",
                    }}
                  />
                </div>

                {/* Count */}
                <strong
                  style={{
                    textAlign: "right",
                  }}
                >
                  {item.count}
                </strong>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default IssueCategoryBar;