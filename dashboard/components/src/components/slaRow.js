import React from "react";
import { router } from "@forge/bridge";

const SlaRow = ({
  title,
  metCount,
  breachedCount,
  metJql,
  breachedJql,
}) => {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "340px 170px 190px",
        alignItems: "center",
        marginTop: "16px",
        columnGap: "20px",
      }}
    >
      <span
        style={{
          fontSize: "17px",
          fontWeight: "600",
        }}
      >
        {title}
      </span>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          cursor: "pointer",
        }}
        onClick={() =>
          router.open(`/issues/?jql=${encodeURIComponent(metJql)}`)
        }
      >
        <span>Met</span>

        <span
          style={{
            color: "#36B37E",
            fontWeight: "700",
            fontSize: "20px",
          }}
        >
          {metCount}
        </span>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          cursor: "pointer",
        }}
        onClick={() =>
          router.open(`/issues/?jql=${encodeURIComponent(breachedJql)}`)
        }
      >
        <span>Breached</span>

        <span
          style={{
            color: "#FF5630",
            fontWeight: "700",
            fontSize: "20px",
          }}
        >
          {breachedCount}
        </span>
      </div>
    </div>
  );
};

export default SlaRow;