
import React, { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Grid,
  IconButton,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { Add, Search } from "@mui/icons-material";
import { useParams } from "react-router-dom";

const initialTransactions = [
  { date: "01-02-2024", description: "Bracelet", gram: 500, status: "Paid" },
  {
    date: "05-02-2024",
    description: "Chain",
    Gram: 200,
    status: "Paid",
  },
  {
    date: "10-02-2024",
    description: "Bangle",
    Gram: 1000,
    status: "Pending",
  },
];

function Transaction() {
  const {customerName} = useParams();
  const [transactions, setTransactions] = useState(initialTransactions);
  const [searchDate, setSearchDate] = useState("");
  const [open, setOpen] = useState(false);
  const [newTransaction, setNewTransaction] = useState({
    date: "",
    description: "",
    amount: "",
    status: "",
  });

  const handleSearch = () => {
    if (searchDate) {
      const filteredTransactions = initialTransactions.filter(
        (txn) => txn.date === searchDate
      );
      setTransactions(filteredTransactions);
    } else {
      setTransactions(initialTransactions);
    }
  };
  const decodedCustomerName = decodeURIComponent(customerName);
  const handleAddTransaction = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSave = () => {
    setTransactions([...transactions, newTransaction]);
    setOpen(false);
    setNewTransaction({ date: "", description: "", Gram: "", status: "" });
  };

  const totalAmount = transactions.reduce((sum, txn) => sum + txn.amount, 0);
  const outstandingBalance = transactions
    .filter((txn) => txn.status === "Pending")
    .reduce((sum, txn) => sum + txn.amount, 0);
  const lastTransactionDate =
    transactions.length > 0
      ? transactions[transactions.length - 1].date
      : "N/A";

  return (
    <div style={{ padding: 20 }}>
      <Typography variant="h4" style={{ marginBottom: 20, fontWeight: "bold" }}>
        Transactions for {decodedCustomerName}
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card style={{ backgroundColor: "aliceblue", color: "#000" }}>
            <CardContent>
              <Typography variant="h6">Total Transactions</Typography>
              <Typography variant="h4" style={{ fontWeight: "bold" }}>
                ₹{totalAmount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card style={{ backgroundColor: "aliceblue", color: "black" }}>
            <CardContent>
              <Typography variant="h6">Outstanding Balance</Typography>
              <Typography variant="h4" style={{ fontWeight: "bold" }}>
                ₹{outstandingBalance}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card style={{ backgroundColor: "aliceblue", color: "black" }}>
            <CardContent>
              <Typography variant="h6">Last Transaction</Typography>
              <Typography variant="h4" style={{ fontWeight: "bold" }}>
                {lastTransactionDate}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <div style={{ marginTop: 30, display: "flex", alignItems: "center" }}>
        <TextField
          label="Search by Date"
          type="date"
          InputLabelProps={{ shrink: true }}
          value={searchDate}
          onChange={(e) => setSearchDate(e.target.value)}
          style={{ marginRight: 20 }}
        />
        <Button
          variant="contained"
          startIcon={<Search />}
          style={{ backgroundColor: "#d4af37", color: "#000" }}
          onClick={handleSearch}
        >
          Search
        </Button>
      </div>

      <TableContainer component={Paper} style={{ marginTop: 20 }}>
        <Table>
          <TableHead>
            <TableRow style={{ backgroundColor: "#f5f5f5" }}>
              <TableCell>Date</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Gram </TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions.map((txn, index) => (
              <TableRow
                key={index}
                style={{
                  backgroundColor: index % 2 === 0 ? "#ffffff" : "#f9f9f9",
                }}
              >
                <TableCell>{txn.date}</TableCell>
                <TableCell>{txn.description}</TableCell>
                <TableCell style={{ color: txn.amount < 0 ? "red" : "#000" }}>
                  {txn.amount}
                </TableCell>
                <TableCell
                  style={{
                    color:
                      txn.status === "Pending"
                        ? "orange"
                        : txn.status === "Refunded"
                        ? "red"
                        : "green",
                  }}
                >
                  {txn.status}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <IconButton
        style={{
          position: "fixed",
          bottom: 30,
          right: 30,
          backgroundColor: "#d4af37",
          color: "#000",
        }}
        size="large"
        onClick={handleAddTransaction}
      >
        <Add />
      </IconButton>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Add New Transaction</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Date"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={newTransaction.date}
            onChange={(e) =>
              setNewTransaction({ ...newTransaction, date: e.target.value })
            }
          />
          <TextField
            margin="dense"
            label="Description"
            type="text"
            fullWidth
            value={newTransaction.description}
            onChange={(e) =>
              setNewTransaction({
                ...newTransaction,
                description: e.target.value,
              })
            }
          />
          <TextField
            margin="dense"
            label="Amount"
            type="number"
            fullWidth
            value={newTransaction.amount}
            onChange={(e) =>
              setNewTransaction({
                ...newTransaction,
                amount: parseFloat(e.target.value),
              })
            }
          />
          <TextField
            margin="dense"
            label="Status"
            type="text"
            fullWidth
            value={newTransaction.status}
            onChange={(e) =>
              setNewTransaction({ ...newTransaction, status: e.target.value })
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleSave} color="primary" variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default Transaction;



