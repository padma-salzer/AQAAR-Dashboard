import React from "react";
import { router } from "@forge/bridge";
import { card, sectionTitle } from "../utils/styles";
import SlaRow from "./SlaRow";

const SlaSection = ({
  hasSLAConfigured,
  hasPriorityResolutionData,
  hasPriorityResponseData,
  hasSeverityResolutionData,
  hasSeverityResponseData,
  // hasResponseData,
  // hasResolutionData,
  slaData,
  fromDate,
  toDate,
  selectedProject,
}) => {
  const priorityResponseMetJql = `
created >= "${fromDate}"
AND created <= "${toDate} 23:59"
AND status NOT IN ("Canceled")
AND cf[10884] = "Met"
${selectedProject ? `AND project = "${selectedProject}"` : ""}
`;

  const priorityResponseBreachedJql = `
created >= "${fromDate}"
AND created <= "${toDate} 23:59"
AND status NOT IN ("Canceled")
AND cf[10884] = "Breached"
${selectedProject ? `AND project = "${selectedProject}"` : ""}
`;

  const priorityResolutionMetJql = `
created >= "${fromDate}"
AND created <= "${toDate} 23:59"
AND status NOT IN ("Canceled")
AND cf[10885] = "Met"
${selectedProject ? `AND project = "${selectedProject}"` : ""}
`;

  const priorityResolutionBreachedJql = `
created >= "${fromDate}"
AND created <= "${toDate} 23:59"
AND status NOT IN ("Canceled")
AND cf[10885] = "Breached"
${selectedProject ? `AND project = "${selectedProject}"` : ""}
`;

  const severityResponseMetJql = `
created >= "${fromDate}"
AND created <= "${toDate} 23:59"
AND status NOT IN ("Canceled")
AND cf[10882] = "Met"
${selectedProject ? `AND project = "${selectedProject}"` : ""}
`;

  const severityResponseBreachedJql = `
created >= "${fromDate}"
AND created <= "${toDate} 23:59"
AND status NOT IN ("Canceled")
AND cf[10882] = "Breached"
${selectedProject ? `AND project = "${selectedProject}"` : ""}
`;

  const severityResolutionMetJql = `
created >= "${fromDate}"
AND created <= "${toDate} 23:59"
AND status NOT IN ("Canceled")
AND cf[10883] = "Met"
${selectedProject ? `AND project = "${selectedProject}"` : ""}
`;

  const severityResolutionBreachedJql = `
created >= "${fromDate}"
AND created <= "${toDate} 23:59"
AND status NOT IN ("Canceled")
AND cf[10883] = "Breached"
${selectedProject ? `AND project = "${selectedProject}"` : ""}
`;

  return (
    <div
      style={{
        ...card,
        marginBottom: "16px",
        paddingTop: "18px",
        paddingLeft: "18px",
        paddingRight: "18px",
      }}
    >
      <h2 style={sectionTitle}>SLA Performance</h2>

      {!hasSLAConfigured ? (
        <div style={{ textAlign: "center", marginTop: "16px" }}>
          No SLA Tracked
        </div>
      ) : (
        <>
          {/* Time to First Response */}
          {/* <div
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
              Priority - Time to First Response
            </span>

            {hasPriorityResponseData ? (
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
AND cf[10884] = "Met"`;

                    if (selectedProject) {
                      jql += ` AND project = "${selectedProject}"`;
                    }

                    router.open(
                      `/issues/?jql=${encodeURIComponent(jql)}`
                    );
                  }}
                >
                  <span style={{ width: "240px", fontSize: "16px" }}>
                    Met
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
AND cf[10884] = "Breached"`;

                    if (selectedProject) {
                      jql += ` AND project = "${selectedProject}"`;
                    }

                    router.open(
                      `/issues/?jql=${encodeURIComponent(jql)}`
                    );
                  }}
                >
                  <span style={{ width: "240px", fontSize: "16px" }}>
                    Breached
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
          </div> */}
          {/* <SlaRow
            title="Priority - Time to First Response"
            metCount={slaData[2]?.count || 0}
            breachedCount={slaData[3]?.count || 0}
            metJql={priorityResponseMetJql}
            breachedJql={priorityResponseBreachedJql}
          /> */}

          {/* Time to Resolution */}
          {/* <div
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
              Priority - Time to Resolution
            </span>

            {hasPriorityResolutionData ? (
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
AND cf[10885] = "Met"`;

                    if (selectedProject) {
                      jql += ` AND project = "${selectedProject}"`;
                    }

                    router.open(
                      `/issues/?jql=${encodeURIComponent(jql)}`
                    );
                  }}
                >
                  <span style={{ width: "240px", fontSize: "16px" }}>
                    Met
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
AND cf[10885] = "Breached"`;

                    if (selectedProject) {
                      jql += ` AND project = "${selectedProject}"`;
                    }

                    router.open(
                      `/issues/?jql=${encodeURIComponent(jql)}`
                    );
                  }}
                >
                  <span style={{ width: "240px", fontSize: "16px" }}>
                    Breached
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
          </div> */}
          {/* <SlaRow
            title="Priority - Time to Resolution"
            metCount={slaData[0]?.count || 0}
            breachedCount={slaData[1]?.count || 0}
            metJql={priorityResolutionMetJql}
            breachedJql={priorityResolutionBreachedJql}
          /> */}

          {/* Severity Time to First Response */}
          {/* <div
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
              Severity - Time to First Response
            </span>

            {hasSeverityResponseData ? (
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
AND cf[10882] = "Met"`;

                    if (selectedProject) {
                      jql += ` AND project = "${selectedProject}"`;
                    }

                    router.open(
                      `/issues/?jql=${encodeURIComponent(jql)}`
                    );
                  }}
                >
                  <span style={{ width: "240px", fontSize: "16px" }}>
                    Met
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
                    {slaData[6]?.count || 0}
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
AND cf[10882] = "Breached"`;

                    if (selectedProject) {
                      jql += ` AND project = "${selectedProject}"`;
                    }

                    router.open(
                      `/issues/?jql=${encodeURIComponent(jql)}`
                    );
                  }}
                >
                  <span style={{ width: "240px", fontSize: "16px" }}>
                    Breached
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
                    {slaData[7]?.count || 0}
                  </span>
                </div>
              </>
            ) : (
              <span style={{ color: "#6B778C", fontSize: "16px" }}>
                No tickets available
              </span>
            )}
          </div> */}
          <SlaRow
            title="Severity - Time to First Response"
            metCount={slaData[6]?.count || 0}
            breachedCount={slaData[7]?.count || 0}
            metJql={severityResponseMetJql}
            breachedJql={severityResponseBreachedJql}
          />
          {/* Severity Time to Resolution */}
          {/* <div
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
              Severity - Time to Resolution
            </span>

            {hasSeverityResolutionData ? (
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
AND cf[10883] = "Met"`;

                    if (selectedProject) {
                      jql += ` AND project = "${selectedProject}"`;
                    }

                    router.open(
                      `/issues/?jql=${encodeURIComponent(jql)}`
                    );
                  }}
                >
                  <span style={{ width: "240px", fontSize: "16px" }}>
                    Met
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
                    {slaData[4]?.count || 0}
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
AND cf[10883] = "Breached"`;

                    if (selectedProject) {
                      jql += ` AND project = "${selectedProject}"`;
                    }

                    router.open(
                      `/issues/?jql=${encodeURIComponent(jql)}`
                    );
                  }}
                >
                  <span style={{ width: "240px", fontSize: "16px" }}>
                    Breached
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
                    {slaData[5]?.count || 0}
                  </span>
                </div>
              </>
            ) : (
              <span style={{ color: "#6B778C", fontSize: "16px" }}>
                No tickets available
              </span>
            )}
          </div> */}
          <SlaRow
            title="Severity - Time to Resolution"
            metCount={slaData[0]?.count || 0}
            breachedCount={slaData[1]?.count || 0}
            metJql={severityResolutionMetJql}
            breachedJql={severityResolutionBreachedJql}
          />
        </>
      )}
    </div>
  );
};

export default SlaSection;
