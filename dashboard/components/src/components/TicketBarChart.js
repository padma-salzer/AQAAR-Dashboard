import React from "react";
import { router } from "@forge/bridge";
import { card, sectionTitle } from "../utils/styles";
import { formatDate } from "../utils/dateUtils";

const TicketBarChart = ({
  chartData,
  maxCount,
  selectedProject,
}) => {
  return (
    <div style={{ ...card, marginBottom: "24px" }}>
      <h2 style={sectionTitle}>Tickets by Created Date</h2>

      {chartData.length === 0 && <p>No data available</p>}

      {chartData.length > 0 && (
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            gap: "20px",
            height: "220px",
            padding: "20px 16px 32px 16px",
            overflowX: "auto",
            overflowY: "hidden",
            scrollbarGutter: "stable",
          }}
        >
          {chartData.map((item) => {
            const barHeight =
              (Math.sqrt(item.count) / Math.sqrt(maxCount)) * 160;

            let jql = `created >= "${item.date}" AND created <= "${item.date} 23:59"`;

            if (selectedProject) {
              jql += ` AND project = "${selectedProject}"`;
            }

            return (
              <div
                key={item.date}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  minWidth: "60px",
                  flex: "0 0 auto",
                  cursor: "pointer",
                }}
                onClick={() =>
                  router.open(
                    `/issues/?jql=${encodeURIComponent(jql)}`
                  )
                }
              >
                <div
                  style={{
                    height: `${barHeight}px`,
                    minHeight: "6px",
                    width: "36px",
                    background: "#36B37E",
                    borderRadius: "4px 4px 0 0",
                    display: "flex",
                    alignItems: "flex-end",
                    justifyContent: "center",
                    color: "#fff",
                    fontSize: "12px",
                    fontWeight: "600",
                    paddingBottom: "4px",
                    boxSizing: "border-box",
                  }}
                >
                  {item.count}
                </div>

                <div
                  style={{
                    fontSize: "12px",
                    marginTop: "6px",
                    textAlign: "center",
                    whiteSpace: "nowrap",
                  }}
                >
                  {formatDate(item.date)}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TicketBarChart;