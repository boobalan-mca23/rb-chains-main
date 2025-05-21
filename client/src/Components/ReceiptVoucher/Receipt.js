
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
  TableContainer
} from "@mui/material";
import { REACT_APP_BACKEND_SERVER_URL } from "../../config/config";

const Receipt = ({ initialGoldRate = 0 }) => {
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingReceipts, setLoadingReceipts] = useState(false);
  const [error, setError] = useState(null);
  const [rows, setRows] = useState([]);
  const [viewMode, setViewMode] = useState(false);
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
      setViewMode(false);
    } else {
      setRows([]);
    }
  }, [selectedCustomer]);

  const fetchCustomerReceipts = async (customerId) => {
    setLoadingReceipts(true);
    try {
      const response = await axios.get(
        `${REACT_APP_BACKEND_SERVER_URL}/api/receipt/customer/${customerId}`
      );
      setAllReceipts(
        response.data.map((r) => ({
          id: r.id,
          date: new Date(r.date).toISOString().slice(0, 10),
          goldRate: r.goldRate.toString(),
          givenGold: r.givenGold.toString(),
          touch: r.touch.toString(),
          purityWeight: r.purityWeight.toString(),
          amount: r.amount.toString(),
        }))
      );
    } catch (err) {
      console.error("Error fetching receipts:", err);
      setAllReceipts([]);
    } finally {
      setLoadingReceipts(false);
    }
  };

  const createNewRow = () => {
    return {
      id: Date.now(), 
      date: new Date().toISOString().slice(0, 10),
      goldRate: initialGoldRate.toString(),
      givenGold: "",
      touch: "",
      purityWeight: "",
      amount: "",
    };
  };

  const handleCustomerChange = (event) => {
    setSelectedCustomer(event.target.value);
    fetchCustomerReceipts(event.target.value);
  };

  const handleAddRow = () => {
    setRows([...rows, createNewRow()]);
  };

  const calculateValues = (row) => {
    const givenGold = parseFloat(row.givenGold) || 0;
    const touch = parseFloat(row.touch) || 0;
    const goldRate = parseFloat(row.goldRate) || 0;

    const purityWeight = ((givenGold * touch) / 100).toFixed(3);
    const amount = (purityWeight * goldRate).toFixed(2);

    return { purityWeight, amount };
  };

  const handleInputChange = (id, field, value) => {
    const updatedRows = rows.map((row) => {
      if (row.id === id) {
        let updatedRow = { ...row, [field]: value };

        if (
          field === "givenGold" ||
          field === "touch" ||
          field === "goldRate"
        ) {
          const { purityWeight, amount } = calculateValues(updatedRow);
          updatedRow.purityWeight = purityWeight;
          updatedRow.amount = amount;
        }

        return updatedRow;
      }
      return row;
    });

    setRows(updatedRows);
  };

  const registerRef = (rowId, field) => (el) => {
    if (!inputRefs.current[rowId]) {
      inputRefs.current[rowId] = {};
    }
    inputRefs.current[rowId][field] = el;
  };

  const handleKeyDown = (e, rowId, field) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const fields = [
        "date",
        "goldRate",
        "givenGold",
        "touch",
        "purityWeight",
        "amount",
      ];
      const currentIndex = fields.indexOf(field);
      const nextField = fields[currentIndex + 1];

      if (nextField && inputRefs.current[rowId]?.[nextField]) {
        inputRefs.current[rowId][nextField].focus();
      }
    }
  };

  const handleSave = async () => {
    try {
      const payload = {
        customer_id: selectedCustomer,
        receipts: rows.map((row) => ({
          date: row.date,
          goldRate: parseFloat(row.goldRate) || 0,
          givenGold: parseFloat(row.givenGold) || 0,
          touch: parseFloat(row.touch) || 0,
          purityWeight: parseFloat(row.purityWeight) || 0,
          amount: parseFloat(row.amount) || 0,
        })),
      };

      await axios.post(
        `${REACT_APP_BACKEND_SERVER_URL}/api/receipt/save`,
        payload
      );

      alert("Receipt data saved successfully!");
      fetchCustomerReceipts(selectedCustomer);
      setRows([createNewRow()]);
    } catch (err) {
      console.error("Error saving receipt data:", err);
      alert("Failed to save receipt data.");
    }
  };

  const handleViewReceipts = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
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
        Error loading customers: {error}
      </Typography>
    );
  }

  return (
    <div>
      <Box sx={{ mb: 3 }}>
        <FormControl fullWidth size="small">
          <InputLabel id="customer-select-label">Select Customer</InputLabel>
          <Select
            labelId="customer-select-label"
            value={selectedCustomer}
            onChange={handleCustomerChange}
            label="Select Customer"
          >
            {customers.map((customer) => (
              <MenuItem key={customer._id} value={customer._id}>
                {customer.name} ({customer.phone})
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {selectedCustomer ? (
        <>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Typography variant="h6">
              Receipt Voucher for:{" "}
              {customers.find((c) => c._id === selectedCustomer)?.name}
            </Typography>
            <Button
              variant="outlined"
              startIcon={<VisibilityIcon />}
              onClick={handleViewReceipts}
            >
              View Receipts
            </Button>
          </Box>

          {loadingReceipts ? (
            <Box display="flex" justifyContent="center" mt={4}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <Table>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>
                        <TextField
                          type="date"
                          value={row.date}
                          onChange={(e) =>
                            handleInputChange(row.id, "date", e.target.value)
                          }
                          onKeyDown={(e) => handleKeyDown(e, row.id, "date")}
                          inputRef={registerRef(row.id, "date")}
                          variant="outlined"
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          type="number"
                          value={row.goldRate}
                          onChange={(e) =>
                            handleInputChange(
                              row.id,
                              "goldRate",
                              e.target.value
                            )
                          }
                          onKeyDown={(e) =>
                            handleKeyDown(e, row.id, "goldRate")
                          }
                          inputRef={registerRef(row.id, "goldRate")}
                          label="Gold Rate"
                          variant="outlined"
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          type="number"
                          value={row.givenGold}
                          onChange={(e) =>
                            handleInputChange(
                              row.id,
                              "givenGold",
                              e.target.value
                            )
                          }
                          onKeyDown={(e) =>
                            handleKeyDown(e, row.id, "givenGold")
                          }
                          inputRef={registerRef(row.id, "givenGold")}
                          label="Given Gold"
                          variant="outlined"
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          type="number"
                          value={row.touch}
                          onChange={(e) =>
                            handleInputChange(row.id, "touch", e.target.value)
                          }
                          onKeyDown={(e) => handleKeyDown(e, row.id, "touch")}
                          inputRef={registerRef(row.id, "touch")}
                          label="Touch"
                          variant="outlined"
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          type="number"
                          value={row.purityWeight}
                          onChange={(e) =>
                            handleInputChange(
                              row.id,
                              "purityWeight",
                              e.target.value
                            )
                          }
                          onKeyDown={(e) =>
                            handleKeyDown(e, row.id, "purityWeight")
                          }
                          inputRef={registerRef(row.id, "purityWeight")}
                          label="Purity Weight"
                          variant="outlined"
                          size="small"
                          disabled
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          type="number"
                          value={row.amount}
                          onChange={(e) =>
                            handleInputChange(row.id, "amount", e.target.value)
                          }
                          onKeyDown={(e) => handleKeyDown(e, row.id, "amount")}
                          inputRef={registerRef(row.id, "amount")}
                          label="Amount"
                          variant="outlined"
                          size="small"
                          disabled
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <Box sx={{ mt: 2, display: "flex", gap: 2 }}>
                <IconButton size="small" onClick={handleAddRow} color="primary">
                  <AddCircleOutlineIcon /> Add Row
                </IconButton>

                <Button
                  variant="contained"
                  onClick={handleSave}
                  color="success"
                >
                  Save
                </Button>
              </Box>
            </>
          )}
        </>
      ) : (
        <Typography variant="body1" color="text.secondary">
          Please select a customer to create a receipt voucher
        </Typography>
      )}

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          All Receipts for{" "}
          {customers.find((c) => c._id === selectedCustomer)?.name}
        </DialogTitle>
        <DialogContent>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <strong>Date</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Gold Rate</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Given Gold</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Touch</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Purity</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Amount</strong>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {allReceipts.map((receipt) => (
                  <TableRow key={receipt.id}>
                    <TableCell>{receipt.date}</TableCell>
                    <TableCell>{receipt.goldRate}</TableCell>
                    <TableCell>{receipt.givenGold}</TableCell>
                    <TableCell>{receipt.touch}</TableCell>
                    <TableCell>{receipt.purityWeight}</TableCell>
                    <TableCell>{receipt.amount}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Close</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Receipt;