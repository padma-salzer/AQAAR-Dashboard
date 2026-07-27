import React from "react";
import { router } from "@forge/bridge";
import { card, sectionTitle } from "../utils/styles";
import { getStatusColor } from "../utils/colorUtils";

const ActiveStatusDonut = ({ openStatusData, selectedProject }) => {
  const radius = 80;
  const circumference = 2 * Math.PI * radius;

  const total = openStatusData.reduce((sum, item) => sum + item.count, 0);

  const totalJql = selectedProject
    ? `statusCategory != Done AND status NOT IN ("Closed","Resolved","Canceled") AND project = "${selectedProject}"`
    : `statusCategory != Done AND status NOT IN ("Closed","Resolved","Canceled")`;

  return (
    <div
      style={{
        ...card,
        flex: 1,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        minHeight: "270px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginBottom: "16px",
        }}
      >
        <h2
          style={{
            ...sectionTitle,
            margin: 0,
            flexShrink: 0,
          }}
        >
          All Active Tickets by Status
        </h2>

        <span
          style={{
            color: "#6B778C",
            fontSize: "14px",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          (Tickets irrespective of date range)
        </span>
      </div>

      {openStatusData.length === 0 && <p>No active tickets available</p>}

      {openStatusData.length > 0 && (
        <div
          style={{
            display: "flex",
            width: "100%",
            alignItems: "center",
          }}
        >
          <div
            style={{
              flex: "0 0 50%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <svg width="230" height="230" viewBox="0 0 200 200">
              <g transform="rotate(-90 100 100)">
                {(() => {
                  let cumulative = 0;

                  return openStatusData.map((item) => {
                    const percent = total ? item.count / total : 0;
                    const dash = `${percent * circumference} ${circumference}`;
                    const offset = -cumulative * circumference;

                    cumulative += percent;

                    return (
                      <circle
                        key={item.label}
                        r={radius}
                        cx="100"
                        cy="100"
                        fill="transparent"
                        stroke={getStatusColor(item.label, item.category)}
                        strokeWidth="28"
                        strokeDasharray={dash}
                        strokeDashoffset={offset}
                        style={{
                          cursor: "pointer",
                          pointerEvents: "stroke",
                        }}
                        onClick={() => {
                          let jql = `status = "${item.label}"`;

                          if (selectedProject) {
                            jql += ` AND project = "${selectedProject}"`;
                          }

                          router.open(
                            `/issues/?jql=${encodeURIComponent(jql)}`,
                          );
                        }}
                      />
                    );
                  });
                })()}
              </g>

              <text
                x="100"
                y="95"
                textAnchor="middle"
                fontSize="26"
                fontWeight="600"
                style={{ cursor: "pointer" }}
                onClick={() =>
                  router.open(`/issues/?jql=${encodeURIComponent(totalJql)}`)
                }
              >
                {total}
              </text>

              <text
                x="100"
                y="120"
                textAnchor="middle"
                fontSize="14"
                fill="#6B778C"
              >
                Total Active Tickets
              </text>
            </svg>
          </div>

          <div
            style={{
              flex: "0 0 50%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            {openStatusData.map((item) => {
              const percent = total
                ? ((item.count / total) * 100).toFixed(1)
                : 0;

              let jql = `status = "${item.label}"`;

              if (selectedProject) {
                jql += ` AND project = "${selectedProject}"`;
              }

              return (
                <div
                  key={item.label}
                  onClick={() =>
                    router.open(`/issues/?jql=${encodeURIComponent(jql)}`)
                  }
                  style={{
                    display: "grid",
                    gridTemplateColumns: "16px minmax(0,1fr) 45px 70px",
                    alignItems: "center",
                    marginBottom: "6px",
                    cursor: "pointer",
                    fontSize: "16px",
                    columnGap: "6px",
                  }}
                >
                  <div
                    style={{
                      width: "12px",
                      height: "12px",
                      backgroundColor: getStatusColor(
                        item.label,
                        item.category,
                      ),
                    }}
                  />

                  <span
                    style={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {item.label}
                  </span>

                  <strong style={{ textAlign: "center" }}>{item.count}</strong>

                  <strong style={{ textAlign: "center" }}>({percent}%)</strong>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ActiveStatusDonut;
