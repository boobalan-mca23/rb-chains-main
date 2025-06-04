import React, { useState, useEffect,useRef } from "react";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TextField,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button
} from "@mui/material";
import { REACT_APP_BACKEND_SERVER_URL } from "../../config/config";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const ReceiptReport = () => {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filteredReceipts, setFilteredReceipts] = useState([]);
  const [dateFilter, setDateFilter] = useState({
    startDate: "",
    endDate: "",
  });
  const [customerFilter, setCustomerFilter] = useState("all");
  const [customers, setCustomers] = useState([]);
  const printRef=useRef()
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

    pdf.save("Receipt-Report.pdf");
  };
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [receiptsResponse, customersResponse] = await Promise.all([
          axios.get(`${REACT_APP_BACKEND_SERVER_URL}/api/receipt/receipts`),
          axios.get(
            `${REACT_APP_BACKEND_SERVER_URL}/api/customer/customerinfo`
          ),
        ]);

        setReceipts(receiptsResponse.data);
        setFilteredReceipts(receiptsResponse.data);

        setCustomers(
          customersResponse.data.map((c) => ({
            id: c.customer_id,
            name: c.customer_name,
            phone: c.phone_number,
          }))
        );

        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [dateFilter, customerFilter, receipts]);

  const applyFilters = () => {
    let result = [...receipts];

    if (dateFilter.startDate && dateFilter.endDate) {
      result = result.filter((receipt) => {
        const receiptDate = new Date(receipt.date).getTime();
        const startDate = new Date(dateFilter.startDate).getTime();
        const endDate = new Date(dateFilter.endDate).getTime();
        return receiptDate >= startDate && receiptDate <= endDate;
      });
    }

    if (customerFilter !== "all") {
      result = result.filter(
        (receipt) => receipt.customer_id === customerFilter
      );
    }

    setFilteredReceipts(result);
  };

  const handleStartDateChange = (e) => {
    setDateFilter({ ...dateFilter, startDate: e.target.value });
  };

  const handleEndDateChange = (e) => {
    setDateFilter({ ...dateFilter, endDate: e.target.value });
  };

  const handleCustomerFilterChange = (e) => {
    setCustomerFilter(e.target.value);
  };

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Typography color="error" align="center" mt={4}>
        Error loading receipts: {error}
      </Typography>
    );
  }

 
  const totalAmount = filteredReceipts.reduce(
    (sum, receipt) => sum + parseFloat(receipt.amount),
    0
  );
  const totalPurityWeight = filteredReceipts.reduce(
    (sum, receipt) => sum + parseFloat(receipt.purityWeight),
    0
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography style={{ textAlign: "center" }} variant="h5" gutterBottom>
        Receipt Report
      </Typography>
      
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 2,
          mb: 3,
          alignItems: "center",
        }}
      >
        <TextField
          label="Start Date"
          type="date"
          size="small"
          value={dateFilter.startDate}
          onChange={handleStartDateChange}
          InputLabelProps={{ shrink: true }}
          sx={{ width: 180 }}
        />

        <TextField
          label="End Date"
          type="date"
          size="small"
          value={dateFilter.endDate}
          onChange={handleEndDateChange}
          InputLabelProps={{ shrink: true }}
          sx={{ width: 180 }}
        />

        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Customer</InputLabel>
          <Select
            value={customerFilter}
            label="Customer"
            onChange={handleCustomerFilterChange}
          >
            <MenuItem value="all">All Customers</MenuItem>
            {customers.map((customer) => (
              <MenuItem key={customer.id} value={customer.id}>
                {customer.name} ({customer.phone})
              </MenuItem>
            ))}
          </Select>

        </FormControl>
        <Button variant="contained" onClick={handlePrintPDF}>
          Print 
        </Button>
      </Box>

      <TableContainer
        component={Paper}
        sx={{ maxHeight: "calc(100vh - 250px)" }}
        ref={printRef}
        style={{padding:"20px"}}
      >
        <h3 style={{textAlign:"center"}}>Receipt Report</h3>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell>
                <strong>Customer</strong>
              </TableCell>
              <TableCell>
                <strong>Date</strong>
              </TableCell>
              <TableCell align="right">
                <strong>Gold Rate</strong>
              </TableCell>
              <TableCell align="right">
                <strong>Given Gold</strong>
              </TableCell>
              <TableCell align="right">
                <strong>Touch</strong>
              </TableCell>
              <TableCell align="right">
                <strong>Purity Weight</strong>
              </TableCell>
              <TableCell align="right">
                <strong>Amount</strong>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredReceipts.length > 0 ? (
              filteredReceipts.map((receipt) => (
                <TableRow key={receipt.id}>
                  <TableCell>{receipt.customer_name}</TableCell>
                  <TableCell>{formatDate(receipt.date)}</TableCell>
                  <TableCell align="right">
                    {parseFloat(receipt.goldRate).toFixed(2)}
                  </TableCell>
                  <TableCell align="right">
                    {parseFloat(receipt.givenGold).toFixed(3)}
                  </TableCell>
                  <TableCell align="right">
                    {parseFloat(receipt.touch).toFixed(2)}%
                  </TableCell>
                  <TableCell align="right">
                    {parseFloat(receipt.purityWeight).toFixed(3)}
                  </TableCell>
                  <TableCell align="right">
                    ₹{parseFloat(receipt.amount).toFixed(2)}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No receipts found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {filteredReceipts.length > 0 && (
        <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
          <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
            Total Receipts: {filteredReceipts.length} | Total Purity Weight:{" "}
            {totalPurityWeight.toFixed(3)} | Total Amount: ₹
            {totalAmount.toFixed(2)}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default ReceiptReport;