
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
  Autocomplete,
  Box,
  Button,
} from "@mui/material";
import { Balance, Visibility } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const CustReport = () => {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [billInfo, setBillInfo] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [openBalance, setOpenBalance] = useState(0);
  const [closingBalance, setClosingBalance] = useState(0);
  const [selectedBill, setSelectedBill] = useState([])

  const navigate = useNavigate();

  useEffect(() => {
    const fetchBill = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BACKEND_SERVER_URL}/api/bill/getCustomerBillDetails`
        );
        console.log("Fetched Bill:", response.data.billInfo);
        const tempBill = [...billInfo]
        response.data.billInfo.map((item, key) => {
          const dateObj = new Date(item.created_at);
          const year = dateObj.getFullYear();
          const month = String(dateObj.getMonth() + 1).padStart(2, '0');
          const day = String(dateObj.getDate()).padStart(2, '0');

          const formattedDate = `${year}-${month}-${day}`;
          const billObj = {
            'id': item.id,
            'customer_id': item.customer_id,
            'date': formattedDate,
            'value': item.total_price,
            'recivedAmount': item.Balance.length === 0 ? 0 : calculateRecivedAmount(item.Balance),
            'Balance': item.Balance.length === 0 ? item.total_price : item.Balance[item.Balance.length - 1].remaining_gold_balance
          }
          tempBill.push(billObj)

        })
        setBillInfo(tempBill)


      } catch (error) {
        toast.error("Error fetching Bills!", {
          containerId: "custom-toast",
        });
        console.error("Error:", error);
      }
    };
    const fetchCustomer = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BACKEND_SERVER_URL}/api/customer/customerinfo`
        );
        console.log("Fetch Customer:", response);
        setCustomers(response.data)


      } catch (error) {
        toast.error("Error fetching Customer!", {
          containerId: "custom-toast",
        });
        console.error("Error:", error);
      }
    }

    fetchBill();
    fetchCustomer();
  }, []);


  const calculateRecivedAmount = (Balance) => {
    return Balance.reduce((acc, currValue) => {
      return acc + currValue.gold_pure

    }, 0)
  }

  const handleViewBill = (billNo) => {
    navigate(`/billing`);
  };

  const handleCustomerBill = async () => {
    console.log(fromDate)
    const bill = billInfo.filter((item) => item.customer_id === selectedCustomer.customer_id)
    if (bill.length === 0) {
      console.log(bill)
      setSelectedBill([])
    } else {
      //Closing Balance Api
      

      if (fromDate > toDate) {
        alert('Enter Date Correct')
      }
      else {
        const tempSelectedBill = []
        let boolean = false;
        let openBalanceData = 0
        bill.map((item, key) => {
          if (item.date >= fromDate && item.date <= toDate) {
            tempSelectedBill.push(item)
            boolean = true;

          }
          if (item.date < fromDate) {
            openBalanceData += item.Balance
          }

        })
        setOpenBalance(openBalanceData)
        if (boolean) {
          setSelectedBill(tempSelectedBill)
        } else {
          setSelectedBill([])
        }
      }

    }
  }

  useEffect(() => {
    const fetchClosing = async () => {
      if (selectedCustomer?.customer_id) {
        try {
          const response = await axios.get(
            `${process.env.REACT_APP_BACKEND_SERVER_URL}/api/customer/closing/${selectedCustomer.customer_id}`
          );
          setClosingBalance(response.data.closingBalance.closing_balance);
        } catch (error) {
          setClosingBalance(0)
          
        }
      }
    };
  
    fetchClosing();
  }, [selectedCustomer?.customer_id]);
  
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
            sx={{ minWidth: 200 }}
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
          <Autocomplete
            options={customers}
            getOptionLabel={(option) => option.customer_name || ""}
            onChange={(event, newValue) => setSelectedCustomer(newValue)}
            renderInput={(params) => (
              <TextField {...params} label="Select Customer" size="small" />
            )}
            sx={{ minWidth: 300 }}
          />
          <Button
            variant="contained"
            onClick={handleCustomerBill}
            sx={{
              backgroundColor: "#1976d2",
              color: "#fff",
              fontWeight: "bold",
              paddingX: 3,
              paddingY: 1,
              borderRadius: "8px",
              textTransform: "none",
              boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
              '&:hover': {
                backgroundColor: "#115293",
              },
            }}
          >
            Search
          </Button>

        </Box>
        {/* Opening Balance at Top Right */}
        <Box display="flex" justifyContent="flex-end" mt={1} mb={1}>
          <Typography variant="h6" sx={{ fontWeight: "bold", color: "#333" }}>
            Opening Balance: {openBalance}
          </Typography>
        </Box>


        <TableContainer component={Paper} style={{ marginTop: "20px" }}>
          <Table>
            <TableHead style={{ backgroundColor: "aliceblue" }}>
              <TableRow>
                <TableCell style={{ color: "black", fontWeight: "bold" }}>
                  S.NO
                </TableCell>
                <TableCell style={{ color: "black", fontWeight: "bold" }}>
                  Bill.NO
                </TableCell>
                <TableCell style={{ color: "black", fontWeight: "bold" }}>
                  Date
                </TableCell>
                <TableCell style={{ color: "black", fontWeight: "bold" }}>
                  value
                </TableCell>
                <TableCell style={{ color: "black", fontWeight: "bold" }}>
                  recivedAmount
                </TableCell>
                <TableCell style={{ color: "black", fontWeight: "bold" }}>
                  Balance
                </TableCell>
                <TableCell style={{ color: "black", fontWeight: "bold" }}>
                  Action
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {selectedBill.length > 0 ? (
                selectedBill.map((item, index) => (
                  <TableRow key={item.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{item.id}</TableCell>
                    <TableCell>{item.date}</TableCell>
                    <TableCell>{item.value}</TableCell>
                    <TableCell>{item.recivedAmount}</TableCell>
                    <TableCell>{item.Balance}</TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleViewBill(item.id)}>
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
        {/* TableContainer remains unchanged */}

        {/* Closing Balance at Bottom Right */}
        <Box display="flex" justifyContent="flex-end" mt={2}>
          <Typography variant="h6" sx={{ fontWeight: "bold", color: "#333" }}>
            Closing Balance: {(closingBalance).toFixed(3)}
          </Typography>
        </Box>

      </div>
    </>
  );
};

const styles = {
  smallAutocomplete: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: "5px",
  },
}
export default CustReport;
