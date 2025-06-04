import React, { useState, useEffect,useRef} from "react";
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
  Button
} from "@mui/material";
import { toast } from "react-toastify";
import './SalesReport.css'
import jsPDF from "jspdf";
import html2canvas from "html2canvas";


const SalesReport = () => {

  const today = new Date().toISOString().split('T')[0];
  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);
  const [billInfo, setBillInfo] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const printRef=useRef()




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
        setBillInfo(processed);
      } catch (error) {
        toast.error("Failed to fetch sales bill details");
        console.error(error);
      }
    };

    fetchBillDetails();
  }, []);

  useEffect(() => {
    if (fromDate && toDate) {
      const filtered = billInfo.filter(
        (bill) => bill.formattedDate >= fromDate && bill.formattedDate <= toDate
      );
      setFilteredData(filtered);
    }
  }, [fromDate, toDate, billInfo]);
   const handlePrintPDF = async () => {
    const input = printRef.current;

    const canvas = await html2canvas(input, {
      scale: 2,
      useCORS: true,
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = 210; // A4 width in mm
    const pdfHeight = 297; // A4 height in mm

    const imgProps = pdf.getImageProperties(imgData);
    const imgWidth = pdfWidth;
    const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pdfHeight;

    while (heightLeft > 0) {
      position = position - pdfHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;
    }

    pdf.save("Sales-Report.pdf");
  };

  //   useEffect(() => {
  //     const fetchBillDetails = async () => {
  //       try {
  //         const response = await axios.get(
  //           "http://localhost:5000/api/bill/getSalesBillDetails"
  //         );
  //         const processed = response.data.billInfo.map((item) => {
  //           const dateObj = new Date(item.created_at);
  //           const year = dateObj.getFullYear();
  //           const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  //           const day = String(dateObj.getDate()).padStart(2, "0");
  //           const formattedDate = `${year}-${month}-${day}`;
  //           return {
  //             ...item,
  //             formattedDate,
  //             customer_name: item.CustomerInfo?.customer_name || "",
  //           };
  //         });
  //         console.log(processed)
  //         setBillInfo(processed);
  //       } catch (error) {
  //         toast.error("Failed to fetch sales bill details");
  //         console.error(error);
  //       }
  //     };

  //     fetchBillDetails();
  //   }, []);




  // useEffect(() => {

  //     const currentDate = new Date().toISOString().split('T')[0]; // Get the current date in YYYY-MM-DD format

  //     if (fromDate && toDate) {
  //       // If both fromDate and toDate are provided, filter the data within the range
  //       const filtered = billInfo.filter(
  //         (bill) => bill.formattedDate >= fromDate && bill.formattedDate <= toDate
  //       );
  //       setFilteredData(filtered);
  //     } else {
  //       // If no dates are provided, filter to show only the current date's details
  //       const filtered = billInfo.filter(bill => bill.formattedDate === currentDate);
  //       setFilteredData(filtered);
  //     }
  //   }, [fromDate, toDate, billInfo]);


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
            <Button variant="contained" onClick={handlePrintPDF}>
             Print 
        </Button>
        </Box>

        <div className="table-center"  >
         
          <TableContainer component={Paper} sx={{ mt: 5 }} ref={printRef} style={{  padding: "30px",
            margin: "auto",}}>
               <h3 style={{textAlign:"center"}}> Sales Report</h3>
            <Table>
              <TableHead sx={{ backgroundColor: "aliceblue" }}>
                <TableRow>
                  {["S.NO", "Bill No", "Date", "Customer Name", "Total Price"].map((label, idx) => (
                    <TableCell
                      key={idx}
                      align="center"
                      sx={{
                        fontWeight: "bold",
                        width: "10%",
                        border: "1px solid rgba(224, 224, 224, 1)", // Adds grid lines
                      }}
                    >
                      {label}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>

              <TableBody>
                {filteredData.length > 0 ? (
                  filteredData.map((item, index) => (
                    <TableRow key={item.id}>
                      <TableCell align="center" sx={{ width: "10%", border: "1px solid rgba(224, 224, 224, 1)" }}>
                        {index + 1}
                      </TableCell>
                      <TableCell align="center" sx={{ width: "10%", border: "1px solid rgba(224, 224, 224, 1)" }}>
                        {item.id}
                      </TableCell>
                      <TableCell align="center" sx={{ width: "10%", border: "1px solid rgba(224, 224, 224, 1)" }}>
                        {item.formattedDate}
                      </TableCell>
                      <TableCell align="center" sx={{ width: "10%", border: "1px solid rgba(224, 224, 224, 1)" }}>
                        {item.customer_name}
                      </TableCell>
                      <TableCell align="center" sx={{ width: "10%", border: "1px solid rgba(224, 224, 224, 1)" }}>
                        {item.total_price}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ border: "1px solid rgba(224, 224, 224, 1)" }}>
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
