import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
} from "@mui/material";
import { toast } from "react-toastify";
import './SalesReport.css'

const SalesReport = () => {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [billInfo, setBillInfo] = useState([]);
  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    const fetchBillDetails = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/bill/getSalesBillDetails"
        );
        const processed = response.data.billInfo.map((item) => {
          const dateObj = new Date(item.created_at);
          const year = dateObj.getFullYear();
          const month = String(dateObj.getMonth() + 1).padStart(2, "0");
          const day = String(dateObj.getDate()).padStart(2, "0");
          const formattedDate = `${year}-${month}-${day}`;
          return {
            ...item,
            formattedDate,
            customer_name: item.CustomerInfo?.customer_name || "",
          };
        });
        console.log(processed)
        setBillInfo(processed);
      } catch (error) {
        toast.error("Failed to fetch sales bill details");
        console.error(error);
      }
    };

    fetchBillDetails();
  }, []);


useEffect(() => {
    const currentDate = new Date().toISOString().split('T')[0]; // Get the current date in YYYY-MM-DD format
  
    if (fromDate && toDate) {
      // If both fromDate and toDate are provided, filter the data within the range
      const filtered = billInfo.filter(
        (bill) => bill.formattedDate >= fromDate && bill.formattedDate <= toDate
      );
      setFilteredData(filtered);
    } else {
      // If no dates are provided, filter to show only the current date's details
      const filtered = billInfo.filter(bill => bill.formattedDate === currentDate);
      setFilteredData(filtered);
    }
  }, [fromDate, toDate, billInfo]);
  
  

  return (
    <>
      <Typography
        variant="h5"
        style={{
          fontWeight: "bold",
          color: "black",
          marginBottom: 20,
          textAlign: "center",
        }}
      >
        Sales Report
      </Typography>

      
      <div style={{ padding: "20px" }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 2,
            marginBottom: 3,
          }}
        >
          <TextField
            type="date"
            label="From Date"
            InputLabelProps={{ shrink: true }}
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            size="small"
            // sx={{ minWidth: 200 }}
            sx={{ minWidth: 200, ml: "4rem" }}           
          />
          <TextField
            type="date"
            label="To Date"
            InputLabelProps={{ shrink: true }}
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            size="small"
            sx={{ minWidth: 200 }}
          />
        </Box>

       <div className="table-center"  > 

<TableContainer component={Paper} sx={{ mt: 5 }}>
  <Table>
    <TableHead sx={{ backgroundColor: "aliceblue" }}>
      <TableRow>
        <TableCell align="center" sx={{ fontWeight: "bold", width: "20%" }}>S.NO</TableCell>
        <TableCell align="center" sx={{ fontWeight: "bold", width: "20%" }}>Bill No</TableCell>
        <TableCell align="center" sx={{ fontWeight: "bold", width: "20%" }}>Date</TableCell>
        <TableCell align="center" sx={{ fontWeight: "bold", width: "20%" }}>Customer Name</TableCell>
        <TableCell align="center" sx={{ fontWeight: "bold", width: "20%" }}>Total Price</TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {filteredData.length > 0 ? (
        filteredData.map((item, index) => (
          <TableRow key={item.id}>
            <TableCell align="center" sx={{ width: "20%" }}>{index + 1}</TableCell>
            <TableCell align="center" sx={{ width: "20%" }}>{item.id}</TableCell>
            <TableCell align="center" sx={{ width: "20%" }}>{item.formattedDate}</TableCell>
            <TableCell align="center" sx={{ width: "20%" }}>{item.customer_name}</TableCell>
            <TableCell align="center" sx={{ width: "20%" }}>{item.total_price}</TableCell>
          </TableRow>
        ))
      ) : (
        <TableRow>
          <TableCell colSpan={5} align="center">
            No data found
          </TableCell>
        </TableRow>
      )}
    </TableBody>
  </Table>
</TableContainer>
<Box textAlign="center" mt={4}>
</Box>


        </div>
      </div>
    </>
  );
};


export default SalesReport;
