import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import VisibilityIcon from "@mui/icons-material/Visibility";
import {
  IconButton,
  TextField,
  Table,
  TableBody,
  TableRow,
  TableCell,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Box,
  Typography,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TableHead,
  Paper,
  TableContainer,

} from "@mui/material";
import { REACT_APP_BACKEND_SERVER_URL } from "../../config/config";
import { toast, ToastContainer } from "react-toastify";
import { MdDeleteForever } from "react-icons/md";

const Receipt = ({ initialGoldRate = 0 }) => {
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingReceipts, setLoadingReceipts] = useState(false);
  const [error, setError] = useState(null);
  const [rows, setRows] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [allReceipts, setAllReceipts] = useState([]);
  const inputRefs = useRef({});
  const [total, setTotal] = useState(0)
  const [balance, setBalance] = useState(0)
  const [excess, setExcess] = useState(0)
  const [goldRate, setGoldRate] = useState(0)
  const [customerPure, setCustomerPure] = useState(0)
  const [customerExcees, setCustomerExcees] = useState(0)
  const [customerCashBalance, setCustomerCashBalance] = useState(0)
  const handleGoldRate = (goldValue) => {
    const tempRows = [...rows];
    for (const r of tempRows) {
      r.goldRate = goldValue
    }
    setRows(tempRows)
    setGoldRate(goldValue)

  }

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await axios.get(
          `${REACT_APP_BACKEND_SERVER_URL}/api/customer/customerinfo`
        );
        console.log('customer info', response)
        const normalized = response.data.map((c) => ({
          _id: c.customer_id,
          name: c.customer_name,
          phone: c.phone_number,
          balance: c.customerBalance[0].balance,
          expure: c.customerBalance[0].expure
        }));
        setCustomers(normalized);
        console.log('normalized', normalized)
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    fetchCustomers();
  }, []);

  useEffect(() => {
    if (selectedCustomer) {
      let tempCustomer = [...customers]
      let filterCustomer = tempCustomer.filter((item, index) => item._id === selectedCustomer)

      if (filterCustomer[0].balance > 0) {
        setBalance(filterCustomer[0].balance)
        setCustomerPure(filterCustomer[0].balance)
        setCustomerExcees(0)
        // setCustomerCashBalance(filterCustomer[0].balance*goldRate)
      }
      if (filterCustomer[0].expure > 0) {
        setExcess(filterCustomer[0].expure)
        setCustomerPure(0)
        setCustomerExcees(-filterCustomer[0].expure)
        // setCustomerCashBalance(-filterCustomer[0].expure*goldRate)

      }
      if (filterCustomer[0].balance === 0 && filterCustomer[0].expure === 0) {
        setTotal(0)
        setBalance(0)
        setExcess(0)
      }


    } else {
      setRows([createNewRow()]);
    }
  }, [selectedCustomer]);

  const createNewRow = () => ({
    id: Date.now(),
    date: new Date().toISOString().slice(0, 10),
    goldRate: goldRate,
    givenGold: "",
    touch: "",
    purityWeight: "",
    amount: "",
  });

  const handleCustomerChange = (event) => {
    const customerId = event.target.value;
    setSelectedCustomer(customerId);
    fetchCustomerReceipts(customerId);
  };

  const fetchCustomerReceipts = async (customerId) => {
    setLoadingReceipts(true);
    try {
      const response = await axios.get(
        `${REACT_APP_BACKEND_SERVER_URL}/api/receipt/customer/${customerId}`
      );
      setAllReceipts(response.data);
    } catch (err) {
      console.error("Error fetching receipts:", err);
    } finally {
      setLoadingReceipts(false);
    }
  };

  const handleInputChange = (id, field, value, index) => {
    const updatedRows = rows.map((row) => {
      if (row.id === id) {

        const updatedRow = { ...row, [field]: value };

        const goldRate = parseFloat(updatedRow.goldRate) || 0;
        const givenGold = parseFloat(updatedRow.givenGold) || 0;
        const touch = parseFloat(updatedRow.touch) || 0;
        const amount = parseFloat(updatedRow.amount) || 0;

        if (field === "goldRate") {
          updatedRow.amount = (updatedRow.purityWeight * updatedRow.goldRate).toFixed(2)
        }
        if (field === "givenGold" || field === "touch") {
          const purityWeight = givenGold * (touch / 100);
          updatedRow.purityWeight = purityWeight.toFixed(3);
          // updatedRow.amount = (purityWeight * goldRate).toFixed(2);

        } else if (field === "amount" && goldRate > 0) {
          const purityWeight = amount / goldRate;
          updatedRow.purityWeight = purityWeight.toFixed(3);

        } else if (field === "goldRate" && updatedRow.purityWeight > 0) {
          updatedRow.amount = (updatedRow.purityWeight * goldRate).toFixed(2);
        }

        return updatedRow;
      }
      return row;
    });
    setRows(updatedRows);
    if (balance) { // if customer have oldBalance

      // if(customerPure>=0){

      let totalPurity = updatedRows.reduce((acc, currValue) => acc + Number(currValue.purityWeight), 0);
      let value = balance - totalPurity
      console.log('value', value)
      if (value >= 0) {
        setCustomerPure(value)
        setCustomerExcees(0)

        for (let i = updatedRows.length - 1; i >= 0; i--) { // its calculate last gold rate
          if (updatedRows[i].goldRate > 0) {
            setCustomerCashBalance(value * updatedRows[i].goldRate)
            break
          }
        }


      }

      if (value < 0) {
        console.log('value excess', value)
        setCustomerPure(0)
        setCustomerExcees(value)

      }
      // }
      // if(customerExcees<0){
      //    let totalPurity=updatedRows.reduce((acc, currValue) => acc + Number(currValue.purityWeight), 0);
      //    let value=balance-totalPurity
      //    console.log('-1',value)
      //       setCustomerPure(0)
      //       setCustomerExcees(value)
      //       // setCustomerCashBalance(value*goldRate)
      // }
    }

    if (excess) {

      let totalPurity = updatedRows.reduce((acc, currValue) => acc + Number(currValue.purityWeight), 0);
      let value = excess + totalPurity
      setCustomerPure(0)
      setCustomerExcees(value)
      // setCustomerCashBalance(-value*goldRate)

    }

    if (total === 0 && (excess === 0 && balance === 0)) {
      console.log("hello")
      let totalPurity = updatedRows.reduce((acc, currValue) => acc + Number(currValue.purityWeight), 0);
      let value = excess + totalPurity
      setCustomerPure(0)
      setCustomerExcees(-value)
      // setCustomerCashBalance(-value*goldRate)
    }
  };

  const registerRef = (rowId, field) => (el) => {
    if (!inputRefs.current[rowId]) inputRefs.current[rowId] = {};
    inputRefs.current[rowId][field] = el;
  };

  const handleKeyDown = (e, rowId, field) => {
    if (e.key === "Enter") {
      const fields = ["date", "goldRate", "givenGold", "touch", "amount"];
      const index = fields.indexOf(field);
      const nextField = fields[index + 1];
      if (nextField && inputRefs.current[rowId]?.[nextField]) {
        inputRefs.current[rowId][nextField].focus();
      }
    }
  };

  const handleAddRow = () => setRows([...rows, createNewRow()]);

  const handleDeleteRow = (index) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this row?");
    if (confirmDelete) {

      const updatedRows = [...rows];
      updatedRows.splice(index, 1);

      if (balance) { // if customer have oldBalance

        if (customerPure >= 0) {

          let totalPurity = updatedRows.reduce((acc, currValue) => acc + Number(currValue.purityWeight), 0);
          let value = balance - totalPurity
          console.log('value', value)
          if (value >= 0) {
            setCustomerPure(value)
            setCustomerExcees(0)

            for (let i = updatedRows.length - 1; i >= 0; i--) { // its calculate last gold rate
              if (updatedRows[i].goldRate > 0) {
                setCustomerCashBalance(value * updatedRows[i].goldRate)
                break
              }
            }



          } else {
            setCustomerPure(0)
            setCustomerExcees(value)

          }
        }
      }


      if (excess) {

        let totalPurity = updatedRows.reduce((acc, currValue) => acc + Number(currValue.purityWeight), 0);
        let value = excess + totalPurity
        setCustomerPure(0)
        setCustomerExcees(value)
        // setCustomerCashBalance(-value*goldRate)

      }

      if (total === 0 && (excess === 0 && balance === 0)) {
        console.log("hello")
        let totalPurity = updatedRows.reduce((acc, currValue) => acc + Number(currValue.purityWeight), 0);
        let value = excess + totalPurity
        setCustomerPure(0)
        setCustomerExcees(-value)
        // setCustomerCashBalance(-value*goldRate)
      }
      setRows(updatedRows)


    }
  };


  const handleSave = async () => {
    const payload = {
      customer_id: selectedCustomer,
      receipts: rows.map(({ date, goldRate, givenGold, touch, purityWeight, amount }) => ({
        date,
        goldRate: parseFloat(goldRate) || 0,
        givenGold: parseFloat(givenGold) || 0,
        touch: parseFloat(touch) || 0,
        purityWeight: parseFloat(purityWeight) || 0,
        amount: parseFloat(amount) || 0,
      })),
      oldBalance: parseFloat(customerPure),
      excessBalance: parseFloat(customerExcees)
    };
    if (!selectedCustomer) {
      toast.warn("Customer Name is Required!", { autoClose: 2000 });
      return;
    }

    let isValid = true; // Assume all rows are valid
    let hasAtLeastOneValidRow = false;

    if (rows.length >= 1) {
      for (let i = 0; i < rows.length; i++) {
        const { goldRate, givenGold, touch, amount } = rows[i];

        const allEmpty =
          (!goldRate || goldRate <= 0) &&
          (!givenGold || givenGold <= 0) &&
          (!touch || touch <= 0) &&
          (!amount || amount <= 0);

        const isPartialValid =
          (goldRate > 0 && amount > 0) ||
          (givenGold > 0 && touch > 0);

        // If all fields are empty — show error
        if (allEmpty) {
          isValid = false;
          break; // No need to check further
        }

        // If one valid row exists, keep track
        if (isPartialValid) {
          hasAtLeastOneValidRow = true;
        } else {
          // If not fully valid, treat it as invalid
          isValid = false;
          break;
        }
      }

      if (!isValid) {
        toast.error("Fill all required fields", { autoClose: 1000 });
        return;
      } else if (hasAtLeastOneValidRow) {
        try {

          await axios.post(`${REACT_APP_BACKEND_SERVER_URL}/api/receipt/save`, payload);
          toast.success('Receipt Saved')
          fetchCustomerReceipts(selectedCustomer);
          setRows([createNewRow()]);
        } catch (err) {
          console.error("Save error:", err);
          alert("Error saving data");
        }
      }

    } else {
       toast.error("Received details row is required!", { autoClose: 2000 });
       return;
    }



  };

  if (loading) return <Box textAlign="center" mt={4}><CircularProgress /></Box>;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Box p={2}  >
      <FormControl size="small" margin="none" sx={{ width: '28%', mb: 1 }}>
        <InputLabel id="customer-label" size="small">Select Customer</InputLabel>
        <Select
          labelId="customer-label"
          label="Select Customer"
          value={selectedCustomer}
          onChange={handleCustomerChange}
          size="small"
          sx={{ fontSize: 13, py: 0.8 }}
        >
          {customers.map((c) => (
            <MenuItem key={c._id} value={c._id} sx={{ fontSize: 13 }}>
              {`${c.name} (${c.phone})`}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        padding={2}
        bgcolor="#f9f9f9"
        border="1px solid #ccc"
        borderRadius="8px"
        boxShadow="0 2px 6px rgba(0,0,0,0.1)"
        marginBottom={2}
        sx={{ width: '28%', mb: 1 }}
      >
        <Box >
          <b>
            {balance !== 0
              ? `Old Balance: ₹${balance}`
              : excess !== 0
                ? `Excess Balance: ₹${excess}`
                : `Total: ₹${total}`}
          </b>
        </Box>
      </Box>





      <Box display="flex" justifyContent="space-between" alignItems="center" my={2}>
        <Typography variant="h6">Receipt Voucher</Typography>
        <Box>
          <Button startIcon={<AddCircleOutlineIcon />} onClick={handleAddRow} size="small" variant="contained" sx={{ mr: 1 }}>
            Add Row
          </Button>
          <Button startIcon={<VisibilityIcon />} onClick={() => setOpenDialog(true)} size="small" variant="outlined">
            View Receipts
          </Button>
        </Box>
      </Box>

      <TableContainer component={Paper} >
        <Table size="small" >
          <TableHead>
            <TableRow>
              {["Date", "Gold Rate", "Given Gold", "Touch", "Purity Weight", "Amount"].map((header) => (
                <TableCell key={header} sx={{ border: "1px solid #ccc" }}>{header}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, index) => (
              <TableRow key={row.id}>
                {["date", "goldRate", "givenGold", "touch", "purityWeight", "amount"].map((field) => (
                  <TableCell key={field} sx={{ border: "1px solid #eee" }}>
                    <TextField
                      type={field === "date" ? "date" : "number"}
                      value={row[field]}
                      onChange={(e) => handleInputChange(row.id, field, e.target.value, index)}
                      onKeyDown={(e) => handleKeyDown(e, row.id, field)}
                      inputRef={registerRef(row.id, field)}
                      size="small"
                      fullWidth
                      variant="outlined"
                      label=""
                      disabled={field === "purityWeight"}
                      autoComplete="off"
                    />
                  </TableCell>
                ))}
                <IconButton onClick={() => handleDeleteRow(index)}>
                  <MdDeleteForever />
                </IconButton>

              </TableRow>
            ))}
          </TableBody>
        </Table>

      </TableContainer>
      <ToastContainer></ToastContainer>
      <Box
        display="flex"
        justifyContent="space-around"
        alignItems="center"
        padding={2}
        bgcolor="#f0f4f8"
        borderRadius="10px"
        boxShadow="0 2px 5px rgba(0,0,0,0.1)"
        marginBottom={2}
      >
        <Box textAlign="center">
          <b>{customerCashBalance >= 0 ? 'Customer Cash Balance:' : 'Excess Cash Balance :'} {(customerCashBalance).toFixed(2)}</b>
        </Box>
        <Box textAlign="center">
          <b>Excess Balance: {customerExcees > 0 ? '-' : ""}{(customerExcees).toFixed(3)}</b>
        </Box>
        <Box textAlign="center">
          <b>Purity Balance: {(customerPure).toFixed(3)}</b>
        </Box>
      </Box>

      <Box mt={2} display="flex" justifyContent="flex-end">
        <Button variant="contained" color="primary" onClick={handleSave} size="small" disabled={rows.length < 1} >
          Save
        </Button>
      </Box>


      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>All Receipts</DialogTitle>
        <DialogContent>
          {loadingReceipts ? (
            <Box textAlign="center" mt={2}><CircularProgress /></Box>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  {["Date", "Gold Rate", "Given Gold", "Touch", "Purity Weight", "Amount"].map((header) => (
                    <TableCell key={header} sx={{ border: "1px solid #ccc" }}>{header}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {allReceipts.map((r, i) => (
                  <TableRow key={i}>
                    <TableCell sx={{ border: "1px solid #eee" }}>{r.date?.slice(0, 10)}</TableCell>
                    <TableCell sx={{ border: "1px solid #eee" }}>{r.goldRate}</TableCell>
                    <TableCell sx={{ border: "1px solid #eee" }}>{r.givenGold}</TableCell>
                    <TableCell sx={{ border: "1px solid #eee" }}>{r.touch}</TableCell>
                    <TableCell sx={{ border: "1px solid #eee" }}>{r.purityWeight}</TableCell>
                    <TableCell sx={{ border: "1px solid #eee" }}>{r.amount}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Receipt;
