import React from "react";
import { router } from "@forge/bridge";
import { card, sectionTitle } from "../utils/styles";
import { getStatusColor } from "../utils/colorUtils";

const StatusDonut = ({
  statusData,
  fromDate,
  toDate,
  selectedProject,
}) => {
    const total = statusData.reduce(
        (sum, item) => sum + item.count,
        0
    );

    const radius = 80;
    const circumference = 2 * Math.PI * radius;

    let totalJql = `created >= "${fromDate}" AND created <= "${toDate} 23:59"`;

    if (selectedProject) {
        totalJql += ` AND project = "${selectedProject}"`;
    }

    const totalJiraUrl = `/issues/?jql=${encodeURIComponent(totalJql)}`;
  return (
      <div style={{ ...card, flex: 1 }}>
          <h2 style={sectionTitle}>Status of Tickets Created</h2>

          {statusData.length === 0 && <p>No data available</p>}

          {statusData.length > 0 && (
              <div style={{ display: "flex", gap: "22px", alignItems: "center" }}>
                  {/* Donut */}
                  <svg width="200" height="200" viewBox="0 0 200 200">
                      <g transform="rotate(-90 100 100)">
                          {(() => {
                              let cumulative = 0;

                              return statusData.map((item, index) => {
                                  const percent = total ? item.count / total : 0;
                                  const dash = `${percent * circumference} ${circumference}`;
                                  const offset = -cumulative * circumference;

                                  cumulative += percent;

                                  return (
                                      <circle
                                          key={item.status}
                                          r={radius}
                                          cx="100"
                                          cy="100"
                                          fill="transparent"
                                          stroke={getStatusColor(item.status, item.category)}
                                          strokeWidth="28"
                                          strokeDasharray={dash}
                                          strokeDashoffset={offset}
                                          pointerEvents="stroke"
                                          style={{ cursor: "pointer", pointerEvents: "stroke" }}
                                          onClick={() => {
                                              let jql = `status = "${item.status}" AND created >= "${fromDate}" AND created <= "${toDate} 23:59"`;

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
                          onClick={() => router.open(totalJiraUrl)}
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
                          Total Tickets
                      </text>
                  </svg>

                  {/* Legend */}
                  <div>
                      {statusData.map((item, index) => {
                          const percent = ((item.count / total) * 100).toFixed(1);

                          let jql = `status = "${item.status}" AND created >= "${fromDate}" AND created <= "${toDate} 23:59"`;
                          if (selectedProject) {
                              jql += ` AND project = "${selectedProject}"`;
                          }

                          return (
                              <div
                                  key={item.label || item.status}
                                  onClick={() =>
                                      router.open(`/issues/?jql=${encodeURIComponent(jql)}`)
                                  }
                                  style={{
                                      display: "grid",
                                      gridTemplateColumns: "16px auto 40px 60px",
                                      alignItems: "center",
                                      marginBottom: "6px",
                                      cursor: "pointer",
                                      fontSize: "16px",
                                      columnGap: "6px",
                                  }}
                              >
                                  {/* color box */}
                                  <div
                                      style={{
                                          width: "12px",
                                          height: "12px",
                                          backgroundColor: getStatusColor(
                                              item.label || item.status,
                                              item.category,
                                          ),
                                      }}
                                  />

                                  {/* status */}
                                  <span>{item.label || item.status}</span>

                                  {/* count */}
                                  <strong style={{ textAlign: "center" }}>
                                      {item.count}
                                  </strong>

                                  {/* percentage */}
                                  <strong style={{ textAlign: "center" }}>
                                      ({percent}%)
                                  </strong>
                              </div>
                          );
                      })}
                  </div>
              </div>
          )}
      </div>
  );
};

export default StatusDonut;