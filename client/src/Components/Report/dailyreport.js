import React, { useState } from "react";
import {
  TextField,
  Button,
  Typography,
} from "@mui/material";

function DailyReport() {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");


  return (
    <>
     <Typography
           variant="h5"
           style={{
             fontWeight: "bold",
             color: "black",
             marginBottom: 20,
            textAlign:"center"

           }}
         >
           Daily Report
         </Typography>
      <div style={{ padding: 20 }}>
        <div style={{ display: "flex", gap: "10px", marginBottom: 20 }}>
          <TextField
            label="From Date"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
          <TextField
            label="To Date"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
          <Button variant="contained">Filter</Button>
        </div>

       
      </div>
    </>
  );
}

export default DailyReport;
