import React from "react";
import { router } from "@forge/bridge";
import { card, sectionTitle } from "../utils/styles";

const SlaSection = ({
  hasSLAConfigured,
  hasResponseData,
  hasResolutionData,
  slaData,
  fromDate,
  toDate,
  selectedProject,
}) => {
  return (
    <div style={{ ...card, marginBottom: "24px" }}>
      <h2 style={sectionTitle}>SLA Performance</h2>

      {!hasSLAConfigured ? (
        <div style={{ textAlign: "center", marginTop: "16px" }}>
          No SLA Tracked
        </div>
      ) : (
        <>
          {/* Time to First Response */}
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: "60px",
              marginTop: "16px",
            }}
          >
            <span
              style={{
                fontSize: "17px",
                fontWeight: "600",
                width: "220px",
              }}
            >
              Time to First Response
            </span>

            {hasResponseData ? (
              <>
                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    width: "320px",
                    justifyContent: "space-between",
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    let jql = `created >= "${fromDate}" AND created <= "${toDate} 23:59"
AND status NOT IN ("Canceled")
AND cf[10646] = "Met"`;

                    if (selectedProject) {
                      jql += ` AND project = "${selectedProject}"`;
                    }

                    router.open(
                      `/issues/?jql=${encodeURIComponent(jql)}`
                    );
                  }}
                >
                  <span style={{ width: "240px", fontSize: "16px" }}>
                    Tickets Responded within SLA
                  </span>

                  <span
                    style={{
                      width: "60px",
                      textAlign: "right",
                      fontWeight: "700",
                      fontSize: "20px",
                      color: "#36B37E",
                    }}
                  >
                    {slaData[2]?.count || 0}
                  </span>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    width: "320px",
                    justifyContent: "space-between",
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    let jql = `created >= "${fromDate}" AND created <= "${toDate} 23:59"
AND status NOT IN ("Canceled")
AND cf[10646] = "Breached"`;

                    if (selectedProject) {
                      jql += ` AND project = "${selectedProject}"`;
                    }

                    router.open(
                      `/issues/?jql=${encodeURIComponent(jql)}`
                    );
                  }}
                >
                  <span style={{ width: "240px", fontSize: "16px" }}>
                    Tickets Responded outside SLA
                  </span>

                  <span
                    style={{
                      width: "60px",
                      textAlign: "right",
                      fontWeight: "700",
                      fontSize: "20px",
                      color: "#FF5630",
                    }}
                  >
                    {slaData[3]?.count || 0}
                  </span>
                </div>
              </>
            ) : (
              <span style={{ color: "#6B778C", fontSize: "16px" }}>
                No tickets available
              </span>
            )}
          </div>

          {/* Time to Resolution */}
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: "60px",
              marginTop: "16px",
            }}
          >
            <span
              style={{
                fontSize: "17px",
                fontWeight: "600",
                width: "220px",
              }}
            >
              Time to Resolution
            </span>

            {hasResolutionData ? (
              <>
                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    width: "320px",
                    justifyContent: "space-between",
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    let jql = `created >= "${fromDate}"
AND created <= "${toDate} 23:59"
AND status NOT IN ("Canceled")
AND statusCategory = Done
AND cf[10273] = "Met"`;

                    if (selectedProject) {
                      jql += ` AND project = "${selectedProject}"`;
                    }

                    router.open(
                      `/issues/?jql=${encodeURIComponent(jql)}`
                    );
                  }}
                >
                  <span style={{ width: "240px", fontSize: "16px" }}>
                    Tickets Closed within SLA
                  </span>

                  <span
                    style={{
                      width: "60px",
                      textAlign: "right",
                      fontWeight: "700",
                      fontSize: "20px",
                      color: "#36B37E",
                    }}
                  >
                    {slaData[0]?.count || 0}
                  </span>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    width: "320px",
                    justifyContent: "space-between",
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    let jql = `created >= "${fromDate}"
AND created <= "${toDate} 23:59"
AND status NOT IN ("Canceled")
AND statusCategory = Done
AND cf[10273] = "Breached"`;

                    if (selectedProject) {
                      jql += ` AND project = "${selectedProject}"`;
                    }

                    router.open(
                      `/issues/?jql=${encodeURIComponent(jql)}`
                    );
                  }}
                >
                  <span style={{ width: "240px", fontSize: "16px" }}>
                    Tickets Closed outside SLA
                  </span>

                  <span
                    style={{
                      width: "60px",
                      textAlign: "right",
                      fontWeight: "700",
                      fontSize: "20px",
                      color: "#FF5630",
                    }}
                  >
                    {slaData[1]?.count || 0}
                  </span>
                </div>
              </>
            ) : (
              <span style={{ color: "#6B778C", fontSize: "16px" }}>
                No tickets available
              </span>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default SlaSection;