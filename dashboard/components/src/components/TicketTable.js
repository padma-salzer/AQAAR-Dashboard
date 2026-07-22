import React from "react";
import { router } from "@forge/bridge";
import { card, sectionTitle, thStyle, tdStyle } from "../utils/styles";

const TicketTable = ({
  issues,
  nextPageToken,
  fetchOpenTickets,
}) => {
  return (
    <div
      style={{
        ...card,
        display: "flex",
        flexDirection: "column",
        marginBottom: "24px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: "6px",
        }}
      >
        <h2 style={sectionTitle}>Open & In Progress Tickets</h2>

        <span
          style={{
            color: "#6B778C",
            fontSize: "14px",
            paddingLeft: "4px",
          }}
        >
          (Tickets irrespective of date range)
        </span>
      </div>

      {issues.length === 0 && (
        <div
          style={{
            marginTop: "12px",
            fontSize: "14px",
          }}
        >
          No tickets available
        </div>
      )}

      {issues.length > 0 && (
        <>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              border: "1px solid #DFE1E6",
            }}
          >
            <thead>
              <tr style={{ background: "#F4F5F7" }}>
                <th style={thStyle}>Key</th>
                <th style={thStyle}>Summary</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Assignee</th>
                <th style={{ ...thStyle, borderRight: "none" }}>
                  Created
                </th>
              </tr>
            </thead>

            <tbody>
              {issues.map((issue) => (
                <tr
                  key={issue.id}
                  style={{
                    borderBottom: "1px solid #DFE1E6",
                  }}
                >
                  <td style={tdStyle}>
                    <span
                      style={{
                        color: "#0052CC",
                        cursor: "pointer",
                        fontWeight: "500",
                      }}
                      onClick={() =>
                        router.open(`/browse/${issue.key}`)
                      }
                    >
                      {issue.key}
                    </span>
                  </td>

                  <td style={tdStyle}>
                    {issue.fields.summary}
                  </td>

                  <td style={tdStyle}>
                    {issue.fields.status.name}
                  </td>

                  <td style={tdStyle}>
                    {issue.fields.assignee?.displayName ||
                      "Unassigned"}
                  </td>

                  <td
                    style={{
                      ...tdStyle,
                      borderRight: "none",
                    }}
                  >
                    {new Date(
                      issue.fields.created
                    ).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ display: "inline-block" }}>
            {nextPageToken && (
              <button
                onClick={() =>
                  fetchOpenTickets(nextPageToken)
                }
                style={{
                  marginTop: "12px",
                  padding: "8px 16px",
                  background: "#0052CC",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "500",
                }}
              >
                Load More
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default TicketTable;