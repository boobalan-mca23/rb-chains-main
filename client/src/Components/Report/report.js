
import React, { useState ,useEffect} from "react";
import CustomerReport from "./custreport";
import StockReport from "./stockreport";
import SalesReport from "./SalesReport";
import { useNavigate ,useLocation} from "react-router-dom";
import CustReport from "./custreport";
import ReceiptReport from "./receiptreport"
import DailyReport from "./dailyreport"


function Report() {
  const today = new Date().toISOString().split('T')[0];
  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);
  const [selectedReport, setSelectedReport] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    // Get query params from URL when page loads or reloads
    const params = new URLSearchParams(location.search);
    const url = params.get("type");
   

    if (url) {
      setSelectedReport(url)
      
      
    }

    // Fetch Bill and Customer data
 
  }, [location.search]);

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <button
          // onClick={() => setSelectedReport("customer")}
          onClick={() => {
            setSelectedReport("customer");
          }}
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
        >
          {" "}
          Sales Report{" "}
        </button>
        <button
          onClick={() => setSelectedReport("receipt")}
          disabled={selectedReport === "receipt"}
          style={{
            padding: "10px",
            backgroundColor: selectedReport === "receipt" ? "darkblue" : "blue",
            color: "white",
            border: "none",
            cursor: selectedReport === "receipt" ? "not-allowed" : "pointer",
            opacity: selectedReport === "receipt" ? 0.5 : 1,
          }}
        >
          
           Receipt Report
        </button>
        <button
        onClick={() => setSelectedReport("DailyReport")}
          disabled={selectedReport === "DailyReport"}
          style={{
            padding: "10px",
            backgroundColor: selectedReport === "DailyReport" ? "darkblue" : "blue",
            color: "white",
            border: "none",
            cursor: selectedReport === "DailyReport" ? "not-allowed" : "pointer",
            opacity: selectedReport === "DailyReport" ? 0.5 : 1,
          }}>
           Daily Lot Report
        </button>
      </div>

      <div>
        {selectedReport === "customer" && <CustomerReport />}
        {selectedReport === "stock" && <StockReport />}
        {selectedReport === "sales" && <SalesReport />}
        {selectedReport === "receipt" && <ReceiptReport/>}
        {selectedReport === "DailyReport" && <DailyReport/>}
      </div>
    </div>
  );
}

export default Report;
