import React from "react";
import { router } from "@forge/bridge";

const SlaRow = ({ title, metCount, breachedCount, metJql, breachedJql }) => {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "60px",
        marginTop: "16px",
      }}
    >
      <span
        style={{
          width: "300px",
          fontSize: "17px",
          fontWeight: "600",
          flexShrink: 0,
        }}
      >
        {title}
      </span>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "220px",
          cursor: "pointer",
        }}
        onClick={() =>
          router.open(`/issues/?jql=${encodeURIComponent(metJql)}`)
        }
      >
        <span
          style={{
            width: "120px",
            fontSize: "18px",
          }}
        >
          Met
        </span>

        <span
          style={{
            width: "40px",
            textAlign: "right",
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
          alignItems: "center",
          justifyContent: "space-between",
          width: "220px",
          cursor: "pointer",
        }}
        onClick={() =>
          router.open(`/issues/?jql=${encodeURIComponent(breachedJql)}`)
        }
      >
        <span
          style={{
            width: "120px",
            fontSize: "18px",
          }}
        >
          Breached
        </span>

        <span
          style={{
            width: "40px",
            textAlign: "right",
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
