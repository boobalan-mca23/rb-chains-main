
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
  const [excess, setExcess] = useState(0)
  const [balance, setBalance] = useState(0)
  const [totalExcess, setTotalExcess] = useState(0)
  const [totalBalance, setTotalBalance] = useState(0)


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
    if (fromDate > toDate) {
      toast.warn('Select Date order was Wrong')
      return
    }
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
      let billTotal = 0
      let excessTotal = 0
      try {
        const res = await axios.get(`${REACT_APP_BACKEND_SERVER_URL}/api/bill/getCustomerBillWithDate`, {
          params: {
            fromDate: from,
            toDate: to,
            customer_id: customer_id ? customer_id : null
          }
        });
        const rawData = res.data || [];

        const formatted = rawData.map((entry) => {
          const formattedDate = new Date(entry.date || entry.created_at).toISOString().split("T")[0];

          if (entry.type === "bill") {

            billTotal += entry.info.total_price
            return {
              type: "Bill",
              date: formattedDate,
              id: entry.info.id,
              value: entry.info.total_price,
              items: entry.info.OrderItems.map((item) => ({
                itemName: item.itemName,
                touchValue: item.touchValue,
                productWeight: item.productWeight,
                final_price: item.final_price,
              })),
            };
          } else if (entry.type === "receipt") {
            excessTotal += entry.info.purityWeight
            return {
              type: "Receipt",
              date: formattedDate,
              id: entry.info.receipt_id,
              value: entry.info.amount,
              gold: `${entry.info.givenGold}g`,
              purityWeight: entry.info.purityWeight,
              touch: entry.info.touch,
              rate: entry.info.goldRate,
            };
          }

          return null;
        }).filter(Boolean);
        setTotalExcess(excessTotal)
        setTotalBalance(billTotal)
        if (excessTotal > billTotal) {
          setExcess(excessTotal - billTotal)
          setBalance(0)
        }
        if (billTotal > excessTotal) {
          setExcess(0)
          setBalance(billTotal - excessTotal)
        }
        setBillInfo(formatted)




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
    let billTotal = 0
    let excessTotal = 0
    if (fromDate > toDate) {
      toast.warn('Select Date order was Wrong')
      return
    }
    if (selectedCustomer) {
      navigate(`/report?type=customer&fromDate=${fromDate}&toDate=${toDate}&custId=${selectedCustomer.customer_id}`);

    } else {
      navigate(`/report?type=customer&fromDate=${fromDate}&toDate=${toDate}&custId=null`);

    }

    billInfo.splice(0, billInfo.length)


    try {

      const res = await axios.get(`${REACT_APP_BACKEND_SERVER_URL}/api/bill/getCustomerBillWithDate`, {
        params: {
          fromDate: fromDate,
          toDate: toDate,
          customer_id: selectedCustomer ? selectedCustomer.customer_id : null
        }
      });
      let rawData = res.data || [];

      const formatted = rawData
        .map((entry) => {
          const formattedDate = new Date(entry.date || entry.created_at)
            .toISOString()
            .split("T")[0];

          if (entry.type === "bill") {
            return {
              type: "Bill",
              date: formattedDate,
              id: entry.info.id,
              value: entry.info.total_price,
              items: entry.info.OrderItems.map((item) => ({
                itemName: item.itemName,
                touchValue: item.touchValue,
                productWeight: item.productWeight,
                final_price: item.final_price,
              })),
            };
          } else if (entry.type === "receipt") {
            return {
              type: "Receipt",
              date: formattedDate,
              id: entry.info.receipt_id,
              value: entry.info.amount,
              gold: `${entry.info.givenGold}g`,
              purityWeight: entry.info.purityWeight,
              touch: entry.info.touch,
              rate: entry.info.goldRate,
            };
          }

          return null;
        })
        .filter(Boolean);
      console.log('res', formatted)
      setTotalExcess(excessTotal)
      setTotalBalance(billTotal)
      if (excessTotal > billTotal) {
        setExcess(excessTotal - billTotal)
        setBalance(0)
      }
      if (billTotal > excessTotal) {
        setExcess(0)
        setBalance(billTotal - excessTotal)
      }
      setBillInfo(formatted)
    } catch (err) {
      alert(err.message)
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
          <Button onClick={() => window.print()}>Print</Button>

        </Box>
        {/* Opening Balance at Top Right */}



        <TableContainer component={Paper} style={{ marginTop: "20px" }}>
          <Table>
            <TableHead style={{ backgroundColor: "aliceblue" }}>
              <TableRow>
                {[
                  "S.NO",
                  "Bill.NO",
                  "Date",
                  "Description",
                  "Received Amount",
                  "Balance",
                  // "Action",
                ].map((label, idx) => (
                  <TableCell
                    key={idx}
                    align="center"
                    sx={{
                      color: "black",
                      fontWeight: "bold",
                      border: "1px solid rgba(224, 224, 224, 1)",
                    }}
                  >
                    {label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {billInfo.length > 0 ? (
                billInfo.map((item, index) => (

                  <TableRow key={item.id}>
                    <TableCell align="center" sx={{ border: "1px solid #ccc" }}>
                      {index + 1}
                    </TableCell>
                    <TableCell align="center" sx={{ border: "1px solid #ccc" }}>
                      {item.id}
                    </TableCell>
                    <TableCell align="center" sx={{ border: "1px solid #ccc" }}>
                      {item.date}
                    </TableCell>
                    <TableCell align="center" sx={{ border: "1px solid #ccc" }}>
                      <Table size="small" sx={{ border: "1px solid #ccc", width: "100%" }}>
                        <TableHead sx={{ backgroundColor: "#f9f9f9" }}>
                          <TableRow>
                            {item.type === "Bill" ? (
                              <>
                                <TableCell sx={{ border: "1px solid #ccc", fontWeight: "bold" }} align="center">Item Name</TableCell>
                                <TableCell sx={{ border: "1px solid #ccc", fontWeight: "bold" }} align="center">Touch Value</TableCell>
                                <TableCell sx={{ border: "1px solid #ccc", fontWeight: "bold" }} align="center">Product Weight</TableCell>
                                <TableCell sx={{ border: "1px solid #ccc", fontWeight: "bold" }} align="center">Final Price</TableCell>
                              </>
                            ) : (
                              <>
                                <TableCell sx={{ border: "1px solid #ccc", fontWeight: "bold" }} align="center">Gold</TableCell>
                                <TableCell sx={{ border: "1px solid #ccc", fontWeight: "bold" }} align="center">Touch</TableCell>
                                <TableCell sx={{ border: "1px solid #ccc", fontWeight: "bold" }} align="center">Purity Weight</TableCell>
                                {/* <TableCell sx={{ border: "1px solid #ccc", fontWeight: "bold" }} align="center">Rate</TableCell>
                                <TableCell sx={{ border: "1px solid #ccc", fontWeight: "bold" }} align="center">Value</TableCell> */}
                              </>
                            )}
                          </TableRow>
                        </TableHead>

                        <TableBody>
                          {item.type === "Bill" ? (
                            item.items?.map((orderItem, idx) => (
                              <TableRow key={idx}>
                                <TableCell align="center" sx={{ border: "1px solid #ccc" }}>{orderItem.itemName}</TableCell>
                                <TableCell align="center" sx={{ border: "1px solid #ccc" }}>{orderItem.touchValue}</TableCell>
                                <TableCell align="center" sx={{ border: "1px solid #ccc" }}>{orderItem.productWeight}</TableCell>
                                <TableCell align="center" sx={{ border: "1px solid #ccc" }}>{orderItem.final_price}</TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell align="center" sx={{ border: "1px solid #ccc" }}>{item.gold}</TableCell>
                              <TableCell align="center" sx={{ border: "1px solid #ccc" }}>{item.touch}</TableCell>
                              <TableCell align="center" sx={{ border: "1px solid #ccc" }}>{item.purityWeight}</TableCell>
                              {/* <TableCell align="center" sx={{ border: "1px solid #ccc" }}>{item.rate}</TableCell>
                              <TableCell align="center" sx={{ border: "1px solid #ccc" }}>{item.value}</TableCell> */}
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </TableCell>

                    {item.type === "Bill" && (
                      <>

                        <TableCell align="center" sx={{ border: "1px solid #ccc" }}>
                        </TableCell>
                        <TableCell align="center" sx={{ border: "1px solid #ccc" }}>
                          {(item.value)}
                        </TableCell>
                      </>

                    )
                    }
                    {item.type === "Receipt" &&
                      (
                        <>
                          <TableCell align="center" sx={{ border: "1px solid #ccc" }}>
                            {(item.purityWeight).toFixed(3)}
                          </TableCell>
                          <TableCell align="center" sx={{ border: "1px solid #ccc" }}>

                          </TableCell>
                        </>

                      )}


                    {/* <TableCell align="center" sx={{ border: "1px solid #ccc" }}>
                      <IconButton onClick={() => handleViewBill(item.id)}>
                        <Visibility style={{ color: "black" }} />
                      </IconButton>
                    </TableCell> */}
                  </TableRow>


                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ border: "1px solid #ccc" }}>
                    No data found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <TableHead >
            <TableRow sx={{ backgroundColor: "#e6f7ff" }}>
            
              <TableCell align="center"  sx={{ fontWeight: "bold", border: "1px solid #ccc" }}>
                Total Received: {(totalExcess).toFixed(3)}
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: "bold", border: "1px solid #ccc" }}>
                Total Balance: {(totalBalance).toFixed(3)}
              </TableCell>
            </TableRow>
          </TableHead>

          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              gap: 4,
              marginTop: 2,
            }}
          >
            <Box
              sx={{
                backgroundColor: "#f0fff0",
                padding: "16px 24px",
                borderRadius: "10px",
                boxShadow: "0 0 10px rgba(0,0,0,0.1)",
                minWidth: "200px",
                textAlign: "center",
              }}
            >
              <b style={{ color: "#388e3c" }}>Excess:</b>
              <div style={{ fontSize: "1.2rem", fontWeight: "bold" }}>{(excess).toFixed(3)}</div>
            </Box>

            <Box
              sx={{
                backgroundColor: "#fff0f0",
                padding: "16px 24px",
                borderRadius: "10px",
                boxShadow: "0 0 10px rgba(0,0,0,0.1)",
                minWidth: "200px",
                textAlign: "center",
              }}
            >
              <b style={{ color: "#d32f2f" }}>Balance:</b>
              <div style={{ fontSize: "1.2rem", fontWeight: "bold" }}>{(balance).toFixed(3)}</div>
            </Box>
          </Box>

        </TableContainer>

        {/* TableContainer remains unchanged */}




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
