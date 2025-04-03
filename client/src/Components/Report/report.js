
import React, { useState } from "react";
import DailyReport from "./dailyreport";
import CustomerReport from "./custreport";

function Report() {
  const [selectedReport, setSelectedReport] = useState(null);

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <button
          onClick={() => setSelectedReport("daily")}
          disabled={selectedReport === "daily"}
          style={{
            padding: "10px",
            backgroundColor: selectedReport === "daily" ? "darkblue" : "blue",
            color: "white",
            border: "none",
            cursor: selectedReport === "daily" ? "not-allowed" : "pointer",
            opacity: selectedReport === "daily" ? 0.5 : 1,
          }}
        >
          Daily Report
        </button>

        <button
          onClick={() => setSelectedReport("customer")}
          disabled={selectedReport === "customer"}
          style={{
            padding: "10px",
            backgroundColor:
              selectedReport === "customer" ? "darkblue" : "blue",
            color: "white",
            border: "none",
            cursor: selectedReport === "customer" ? "not-allowed" : "pointer",
            opacity: selectedReport === "customer" ? 0.5 : 1,
          }}
        >
          Customer Report
        </button>
      </div>

      <div>
        {selectedReport === "daily" && <DailyReport />}
        {selectedReport === "customer" && <CustomerReport />}
      </div>
    </div>
  );
}

export default Report;
