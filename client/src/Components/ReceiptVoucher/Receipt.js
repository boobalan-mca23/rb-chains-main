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

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await axios.get(
          `${REACT_APP_BACKEND_SERVER_URL}/api/customer/customerinfo`
        );
        const normalized = response.data.map((c) => ({
          _id: c.customer_id,
          name: c.customer_name,
          phone: c.phone_number,
        }));
        setCustomers(normalized);
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
      setRows([createNewRow()]);
    } else {
      setRows([]);
    }
  }, [selectedCustomer]);

  const createNewRow = () => ({
    id: Date.now(),
    date: new Date().toISOString().slice(0, 10),
    goldRate: initialGoldRate.toString(),
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

  const handleInputChange = (id, field, value) => {
    const updatedRows = rows.map((row) => {
      if (row.id === id) {
        const updatedRow = { ...row, [field]: value };
        const goldRate = parseFloat(updatedRow.goldRate) || 0;
        const givenGold = parseFloat(updatedRow.givenGold) || 0;
        const touch = parseFloat(updatedRow.touch) || 0;
        const amount = parseFloat(updatedRow.amount) || 0;

        if (field === "givenGold" || field === "touch") {
          const purityWeight = givenGold * (touch / 100);
          updatedRow.purityWeight = purityWeight.toFixed(3);
          updatedRow.amount = (purityWeight * goldRate).toFixed(2);
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
  };

  const registerRef = (rowId, field) => (el) => {
    if (!inputRefs.current[rowId]) inputRefs.current[rowId] = {};
    inputRefs.current[rowId][field] = el;
  };

  const handleKeyDown = (e, rowId, field) => {
    if (e.key === "Enter") {
      const fields = ["date", "goldRate", "givenGold", "touch", "purityWeight", "amount"];
      const index = fields.indexOf(field);
      const nextField = fields[index + 1];
      if (nextField && inputRefs.current[rowId]?.[nextField]) {
        inputRefs.current[rowId][nextField].focus();
      }
    }
  };

  const handleAddRow = () => setRows([...rows, createNewRow()]);

  const handleSave = async () => {
    try {
      const payload = {
        customer_id: selectedCustomer,
        receipts: rows.map(({ date, goldRate, givenGold, touch, purityWeight, amount }) => ({
          date,
          goldRate: parseFloat(goldRate),
          givenGold: parseFloat(givenGold),
          touch: parseFloat(touch),
          purityWeight: parseFloat(purityWeight),
          amount: parseFloat(amount),
        })),
      };
      await axios.post(`${REACT_APP_BACKEND_SERVER_URL}/api/receipt/save`, payload);
      alert("Saved successfully");
      fetchCustomerReceipts(selectedCustomer);
      setRows([createNewRow()]);
    } catch (err) {
      console.error("Save error:", err);
      alert("Error saving data");
    }
  };

  if (loading) return <Box textAlign="center" mt={4}><CircularProgress /></Box>;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Box p={2}>
      <FormControl size="small" margin="none" sx={{ width: '50%', mb: 1 }}>
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



      {selectedCustomer && (
        <>
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

          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  {["Date", "Gold Rate", "Given Gold", "Touch", "Purity Weight", "Amount"].map((header) => (
                    <TableCell key={header} sx={{ border: "1px solid #ccc" }}>{header}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.id}>
                    {["date", "goldRate", "givenGold", "touch", "purityWeight", "amount"].map((field) => (
                      <TableCell key={field} sx={{ border: "1px solid #eee" }}>
                        <TextField
                          type={field === "date" ? "date" : "number"}
                          value={row[field]}
                          onChange={(e) => handleInputChange(row.id, field, e.target.value)}
                          onKeyDown={(e) => handleKeyDown(e, row.id, field)}
                          inputRef={registerRef(row.id, field)}
                          size="small"
                          fullWidth
                          variant="outlined"
                          label=""
                          disabled={field === "purityWeight"}
                        />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Box mt={2} display="flex" justifyContent="flex-end">
            <Button variant="contained" color="primary" onClick={handleSave} size="small">
              Save
            </Button>
          </Box>
        </>
      )}

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
