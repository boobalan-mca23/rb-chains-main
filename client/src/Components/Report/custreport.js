
import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Typography,
  Box,
} from "@mui/material";
import { Visibility } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const CustReport = () => {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BACKEND_SERVER_URL}/api/customer/customerinfo`
        );
        console.log("Fetched Customers:", response.data);
        setCustomers(Array.isArray(response.data) ? response.data : []);

        // Generate random data for testing
        const randomData = response.data.map((customer, index) => ({
          id: index + 1,
          date: generateRandomDate(),
          billNo: generateRandomBillNo(),
          customerName: customer.customer_name,
        }));
        setData(randomData);
      } catch (error) {
        toast.error("Error fetching customers!", {
          containerId: "custom-toast",
        });
        console.error("Error:", error);
      }
    };

    fetchCustomers();
  }, []);

  const generateRandomDate = () => {
    const start = new Date(2023, 0, 1);
    const end = new Date();
    return new Date(
      start.getTime() + Math.random() * (end.getTime() - start.getTime())
    )
      .toISOString()
      .split("T")[0];
  };

  const generateRandomBillNo = () => {
    return Math.floor(100000 + Math.random() * 900000);
  };

  useEffect(() => {
    let filtered = data;

    if (fromDate && toDate) {
      filtered = filtered.filter(
        (item) =>
          new Date(item.date) >= new Date(fromDate) &&
          new Date(item.date) <= new Date(toDate)
      );
    }

    if (searchTerm) {
      filtered = filtered.filter((item) =>
        item.customerName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCustomer) {
      filtered = filtered.filter(
        (item) => item.customerName === selectedCustomer.customer_name
      );
    }

    setFilteredData(filtered);
  }, [fromDate, toDate, searchTerm, selectedCustomer, data]);

  const handleViewBill = (billNo) => {
    navigate(`/billing`);
  };

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
        Customer Report
      </Typography>
      <div style={{ padding: "20px" }}>
        <TextField
          type="date"
          label="From Date"
          InputLabelProps={{ shrink: true }}
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          style={{ marginRight: "10px" }}
        />
        <TextField
          type="date"
          label="To Date"
          InputLabelProps={{ shrink: true }}
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          style={{ marginRight: "10px" }}
        />

        <TextField
          label="Search Customer"
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ marginRight: "10px" }}
        />

        <FormControl style={{ minWidth: 200 }}>
          <InputLabel>Select Customer</InputLabel>
          <Select
            value={selectedCustomer || ""}
            onChange={(e) => setSelectedCustomer(e.target.value)}
            displayEmpty
          >
          
            {customers.map((customer) => (
              <MenuItem key={customer.id} value={customer}>
                {customer.customer_name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {selectedCustomer && (
          <Box sx={{ marginTop: 2, padding: 2, border: "1px solid black" }}>
            <Typography variant="h6">Customer Name:</Typography>
            <strong>
              {selectedCustomer.customer_name}
            </strong>
          </Box>
        )}

        <TableContainer component={Paper} style={{ marginTop: "20px" }}>
          <Table>
            <TableHead style={{ backgroundColor: "aliceblue" }}>
              <TableRow>
                <TableCell style={{ color: "black", fontWeight: "bold" }}>
                  SI.NO
                </TableCell>
                <TableCell style={{ color: "black", fontWeight: "bold" }}>
                  Date
                </TableCell>
                <TableCell style={{ color: "black", fontWeight: "bold" }}>
                  Bill No
                </TableCell>
                <TableCell style={{ color: "black", fontWeight: "bold" }}>
                  Customer Name
                </TableCell>
                <TableCell style={{ color: "black", fontWeight: "bold" }}>
                  Action
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredData.length > 0 ? (
                filteredData.map((item, index) => (
                  <TableRow key={item.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{item.date}</TableCell>
                    <TableCell>{item.billNo}</TableCell>
                    <TableCell>{item.customerName}</TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleViewBill(item.billNo)}>
                        <Visibility style={{ color: "black" }} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} style={{ textAlign: "center" }}>
                    No data found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </>
  );
};

export default CustReport;
