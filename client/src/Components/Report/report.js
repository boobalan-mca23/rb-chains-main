
import React, { useState } from "react";
import CustomerReport from "./custreport";
import StockReport from "./stockreport";
import SalesReport from "./SalesReport";


function Report() {
  const [selectedReport, setSelectedReport] = useState(null);

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
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

        <button
          onClick={() => setSelectedReport("stock")}
          disabled={selectedReport === "stock"}
          style={{
            padding: "10px",
            backgroundColor: selectedReport === "stock" ? "darkblue" : "blue",
            color: "white",
            border: "none",
            cursor: selectedReport === "stock" ? "not-allowed" : "pointer",
            opacity: selectedReport === "stock" ? 0.5 : 1,
          }}
        >
          Stock Report
        </button>

        <button 
         onClick={() => setSelectedReport("sales")}
         disabled={selectedReport === "sales"}
          style={{
            padding: "10px",
            backgroundColor: selectedReport === "sales" ? "darkblue" : "blue",
            color: "white",
            border: "none",
            cursor: selectedReport === "sales" ? "not-allowed" : "pointer",
            opacity: selectedReport === "sales" ? 0.5 : 1,
          }}
        > Sales Report </button> 

      </div>

      <div>

        {selectedReport === "customer" && <CustomerReport />}
        {selectedReport === "stock" && <StockReport />}
        {selectedReport ==="sales" && <SalesReport/> }
      </div>
    </div>
  );
}

export default Report;
