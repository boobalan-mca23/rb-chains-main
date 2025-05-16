
import React, { useState, useEffect } from "react";
import axios from "axios";

import { REACT_APP_BACKEND_SERVER_URL } from '../../config/config'
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


import { Balance, ElevatorSharp, Visibility } from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { teal } from "@mui/material/colors";

const CustReport = () => {
  const location = useLocation();

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [billInfo, setBillInfo] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [openBalance, setOpenBalance] = useState(0);
  const [closingBalance, setClosingBalance] = useState(0);


  const navigate = useNavigate();
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const from = params.get("fromDate");
    const to = params.get("toDate");

    if (from && to) {
      setFromDate(from);
      setToDate(to);
    }
  }, [location.search])

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const customer_id = params.get("custId");

    if (customer_id && customers.length > 0) {
      const match = customers.find(
        (cust) => String(cust.customer_id) === String(customer_id)
      );
      if (match) setSelectedCustomer(match);
    }
  }, [location.search, customers]); // depends on both URL and customers


  useEffect(() => {
    const fetchBill = async () => {
      const params = new URLSearchParams(location.search);
      const from = params.get("fromDate");
      const to = params.get("toDate");
      const customer_id = params.get("custId")
      billInfo.splice(0, billInfo.length)
      if (customer_id) {
        const cust = customers.find((item) => item.customer_id.toString() === customer_id);
        if (cust) {
          console.log('customer name', cust)
          setSelectedCustomer(cust); // ✅ Set the selected customer in Autocomplete
        }
      }
      try {
        const res = await axios.get(`${REACT_APP_BACKEND_SERVER_URL}/api/bill/getCustomerBillWithDate`, {
          params: {
            fromDate: from,
            toDate: to,
            customer_id: customer_id ? customer_id : null
          }
        });
        console.log("Fetched Bill:", res);

        if (res.data.data.billInfo.length >= 1) {
          const tempBill = [...billInfo]
          res.data.data.billInfo.map((item, key) => {
            const dateObj = new Date(item.created_at);
            const year = dateObj.getFullYear();
            const month = String(dateObj.getMonth() + 1).padStart(2, '0');
            const day = String(dateObj.getDate()).padStart(2, '0');

            const formattedDate = `${year}-${month}-${day}`;
            const billObj = {
              'id': item.id,
              'customer_id': item.customer_id,
              'date': formattedDate,
              'orderItems': item.OrderItems,
              'value': item.total_price,
              'recivedAmount': item.Balance.length === 0 ? 0 : calculateRecivedAmount(item.Balance),
              'Balance': item.Balance.length === 0 ? item.total_price : item.Balance[item.Balance.length - 1].remaining_gold_balance
            }
            tempBill.push(billObj)

          })
          console.log('temp bill', tempBill)
          setBillInfo(tempBill)
          setOpenBalance(res.data.data.openingBalance)

          setClosingBalance(res.data.data.closingAmount)

        } else {
          setBillInfo([])
          setOpenBalance(res.data.data.openingBalance)

          setClosingBalance(res.data.data.closingAmount)


        }


      } catch (error) {
        toast.error("Error fetching Bills!", {
          containerId: "custom-toast",
        });
        console.error("Error:", error);
      }
    };


    fetchBill();

  }, [location.search]);

  useEffect(() => {
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
    fetchCustomer();
  }, [])


  const calculateRecivedAmount = (Balance) => {
    return Balance.reduce((acc, currValue) => {
      return acc + currValue.gold_pure

    }, 0)
  }

  const handleCustomerBill = async () => {

    if (selectedCustomer) {
      navigate(`/report?type=customer&fromDate=${fromDate}&toDate=${toDate}&custId=${selectedCustomer.customer_id}`);

    } else {
      navigate(`/report?type=customer&fromDate=${fromDate}&toDate=${toDate}&custId=null`);

    }
    const from = new Date(fromDate);
    const to = new Date(toDate);
    billInfo.splice(0, billInfo.length)

    if (from <= to) {
      try {

        const res = await axios.get(`${REACT_APP_BACKEND_SERVER_URL}/api/bill/getCustomerBillWithDate`, {
          params: {
            fromDate: fromDate,
            toDate: toDate,
            customer_id: selectedCustomer ? selectedCustomer.customer_id : null
          }
        });
        console.log(res)
        if (res.data.data.billInfo.length >= 1) {

          const tempBill = [...billInfo]
          res.data.data.billInfo.map((item, key) => {
            const dateObj = new Date(item.created_at);
            const year = dateObj.getFullYear();
            const month = String(dateObj.getMonth() + 1).padStart(2, '0');
            const day = String(dateObj.getDate()).padStart(2, '0');

            const formattedDate = `${year}-${month}-${day}`;
            const billObj = {
              'id': item.id,
              'customer_id': item.customer_id,
              'orderItems': item.OrderItems,
              'date': formattedDate,
              'value': item.total_price,
              'recivedAmount': item.Balance.length === 0 ? 0 : calculateRecivedAmount(item.Balance),
              'Balance': item.Balance.length === 0 ? item.total_price : item.Balance[item.Balance.length - 1].remaining_gold_balance
            }
            tempBill.push(billObj)

          })
          console.log('closingAmount', res.data)
          setBillInfo(tempBill)
          setOpenBalance(res.data.data.openingBalance)
          setClosingBalance(res.data.data.closingAmount)
        } else {
          setBillInfo([])
          setOpenBalance(res.data.data.openingBalance)

          setClosingBalance(res.data.data.closingAmount)

        }
      } catch (err) {
        alert(err.message)
      }
    } else {
      alert('Select correct date: From Date must be before To Date');
    }

  };





  // const location = useLocation();

  // useEffect(() => {
  //   // Get query params from URL when page loads or reloads
  //   const params = new URLSearchParams(location.search);
  //   const urlFromDate = params.get("fromDate");
  //   const urlToDate = params.get("toDate");
  //   const custId = params.get("custId");

  //   const fetchFliterData=async()=>{
  //     billInfo.splice(0,billInfo.length)
  //     try{
  //       const res= await getCustomerBillWithDate(urlFromDate,urlToDate,custId)
  //       //  setBillInfo(res.data.data.billInfo)

  //         const tempBill = [...billInfo]
  //         res.data.data.billInfo.map((item, key) => {
  //         const dateObj = new Date(item.created_at);
  //         const year = dateObj.getFullYear();
  //         const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  //         const day = String(dateObj.getDate()).padStart(2, '0');

  //         const formattedDate = `${year}-${month}-${day}`;
  //         const billObj = {
  //           'id': item.id,
  //           'customer_id': item.customer_id,
  //           'date': formattedDate,
  //           'value': item.total_price,
  //           'recivedAmount': item.Balance.length === 0 ? 0 : calculateRecivedAmount(item.Balance),
  //           'Balance': item.Balance.length === 0 ? item.total_price : item.Balance[item.Balance.length - 1].remaining_gold_balance
  //         }
  //         tempBill.push(billObj)

  //       })
  //        console.log('closingAmount',res.data)
  //        setBillInfo(tempBill)
  //        setOpenBalance(res.data.data.openingBalance)
  //        setClosingBalance(res.data.data.closingAmount)

  //     }catch(err){
  //       alert(err.message)
  //     }
  //   }
  //   fetchFliterData()
  //   // Fetch Bill and Customer data

  // }, [location.search]); // Re-run on query change

  // Fetch bill info when component mounts





  const handleViewBill = (billNo) => {
    // Update URL with the specific billNo
    navigate(`/billing/${billNo}`)
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
            value={selectedCustomer || null}
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
            Opening Balance: {(openBalance).toFixed(2)}
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
                  Description
                </TableCell>
                <TableCell style={{ color: "black", fontWeight: "bold" }}>
                  Weight
                </TableCell>
                <TableCell style={{ color: "black", fontWeight: "bold" }}>
                  Recived Amount
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
              {billInfo.length > 0 ? (
                billInfo.map((item, index) => (
                  <TableRow key={item.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{item.id}</TableCell>
                    <TableCell>{item.date}</TableCell>
                    <TableCell>

                      <>
                        {/* <TableCell>{orderItem.itemName}</TableCell>
                         <TableCell>{`${orderItem.touchValue}*${orderItem.productWeight}=${orderItem.final_price}`}</TableCell> */}
                        <Table size="small" sx={{ border: '1px solid #ccc' }}>
                          <TableHead>
                            <TableRow>
                              <TableCell>Item Name</TableCell>
                              <TableCell>Touch Value</TableCell>
                              <TableCell>Product Weight</TableCell>
                              <TableCell>Final Price</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {item.orderItems.map((orderItem, idx) => (
                              <TableRow key={idx}>
                                <TableCell>{orderItem.itemName}</TableCell>
                                <TableCell>{orderItem.touchValue}</TableCell>
                                <TableCell>{orderItem.productWeight}</TableCell>
                                <TableCell>{orderItem.final_price}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </>
                    </TableCell>
                    <TableCell>{item.value}</TableCell>
                    <TableCell>{item.recivedAmount}</TableCell>
                    <TableCell>{(item.Balance).toFixed(3)}</TableCell>
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
            Closing Balance: {(closingBalance).toFixed(2)}
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
