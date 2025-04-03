
import React, { useState, useEffect } from "react";
import { Edit, Delete, Visibility } from "@mui/icons-material";
import { IconButton } from "@mui/material";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  InputAdornment,
} from "@mui/material";
import {  Search } from "@mui/icons-material";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { REACT_APP_BACKEND_SERVER_URL } from "../../config/config";
import ProcessStepper from "./process";




const Lot = () => {
  const [lots, setLots] = useState([]);
  const [open, setOpen] = useState(false);
  const [newLot, setNewLot] = useState({
    lot_name: "",
    lot_before_weight: "",
    lot_after_weight: "",
    lot_difference_weight: "",
    lot_comments: "",
  });
  const [editMode, setEditMode] = useState(false);
  const [selectedLot, setSelectedLot] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchLots();
  }, []);

  const fetchLots = async () => {
    try {
     const response = await axios.get(
       `${REACT_APP_BACKEND_SERVER_URL}/api/lot/lotinfo`
     );
      console.log("Fetched lots:", response.data);

      if (Array.isArray(response.data)) {
        setLots(response.data);
      } else if (Array.isArray(response.data.data)) {
        setLots(response.data.data);
      } else {
        console.error("Unexpected response format:", response.data);
        toast.error("Failed to fetch lots. Unexpected data format.");
      }
    } catch (error) {
      console.error("Error fetching lots:", error);
      toast.error("Failed to fetch lots.");
    }
  };


const handleInputChange = (e) => {
  const { name, value } = e.target;

  
  if (["lot_before_weight", "lot_after_weight"].includes(name)) {
    const updatedValue = value === "" ? "" : parseFloat(value);
    const updatedLot = { ...newLot, [name]: updatedValue };

   
    if (updatedLot.lot_before_weight && updatedLot.lot_after_weight) {
      updatedLot.lot_difference_weight = Math.abs(
        updatedLot.lot_after_weight - updatedLot.lot_before_weight
      );
    }

    setNewLot(updatedLot);
  } else {
    setNewLot({ ...newLot, [name]: value });
  }
};

  const handleAddLot = async () => {
    try {
      const payload = {
        ...newLot,
        lot_before_weight: parseFloat(newLot.lot_before_weight),
        lot_after_weight: parseFloat(newLot.lot_after_weight),
        lot_difference_weight: parseFloat(newLot.lot_difference_weight),
          
      };

      await axios.post(
        `${REACT_APP_BACKEND_SERVER_URL}/api/lot/lotinfo`,
        payload
      );
      fetchLots();
      setOpen(false);
      setNewLot({
        lot_name: "",
        lot_before_weight: "",
        lot_after_weight: "",
        lot_difference_weight: "",
        lot_comments: "",
      });
        console.log("Lot added successfully");
  toast.success("Lot added successfully");

    } catch (error) {
      console.error("Error adding lot:", error);
      toast.error("Failed to add lot");
    }
  };

  
  const handleEditLot = (lot) => {
    setSelectedLot(lot);

    setNewLot({
      lot_name: lot.lot_name || "",
      lot_before_weight: lot.lot_before_weight
        ? lot.lot_before_weight.toString()
        : "",
      lot_after_weight: lot.lot_after_weight
        ? lot.lot_after_weight.toString()
        : "",
      lot_difference_weight: lot.lot_difference_weight
        ? lot.lot_difference_weight.toString()
        : "",
      lot_comments: lot.lot_comments || "",
    });

    setEditMode(true);
    setOpen(true);
  };
  const navigate = useNavigate();
const handleViewLot = (id, lotName) => {
  const formattedLotName = encodeURIComponent(lotName); 
  navigate(`/process/${id}/${formattedLotName}`);
};


  const handleUpdateLot = async () => {
    try {
      const payload = {
        ...newLot,
        lot_before_weight: parseFloat(newLot.lot_before_weight),
        lot_after_weight: parseFloat(newLot.lot_after_weight),
        lot_difference_weight: parseFloat(newLot.lot_difference_weight),
      };

      console.log("Updating lot with ID:", selectedLot.id);
      console.log("Payload:", payload);

     await axios.put(
       `${REACT_APP_BACKEND_SERVER_URL}/api/lot/lotinfo/${selectedLot.id}`,
       payload
     );
      fetchLots();
      setOpen(false);
      setEditMode(false);
      resetNewLot();
      toast.success("Lot updated successfully");
    } catch (error) {
      console.error("Error updating lot:", error.response || error.message);
      toast.error("Failed to update lot");
    }
  };

  const handleDeleteLot = async (id) => {
    try {
      console.log("Deleting lot with ID:", id);

   await axios.delete(`${REACT_APP_BACKEND_SERVER_URL}/api/lot/lotinfo/${id}`);

      fetchLots();
      toast.success("Lot deleted successfully");
    } catch (error) {
      console.error("Error deleting lot:", error.response || error.message);
      toast.error("Failed to delete lot");
    }
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const resetNewLot = () => {
    setNewLot({
      lot_name: "",
      lot_before_weight: "",
      lot_after_weight: "",
      lot_difference_weight: "",
      lot_comments: "",
    });
  };

  const formatWeight = (weight) => {
    return weight ? parseFloat(weight).toFixed(2) : "0.00";
  };

  return (
    <div style={{ padding: 20, justifyContent: "center" }}>
      <h1
        style={{
          textAlign: "center",
          background: "linear-gradient(45deg, gold, black)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          position: "relative",
          top: "-20px",
        }}
      >
        Lot Information
      </h1>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        style={{ marginTop: "60px" }}
      />

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          textAlign: "center",
          marginBottom: 20,
        }}
      >
        <TextField
          placeholder="Search Lot Name"
          value={search}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />
     
        <Button
          style={{
            backgroundColor: "#d4af37",
            color: "#000",
            fontWeight: "bold",
            height: "2.2rem",
          }}
          variant="contained"
          color="primary"
          onClick={() => setOpen(true)}
        >
          Create lot
        </Button>
      </div>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow style={{ backgroundColor: "#f5f5f5" }}>
              <TableCell style={{ fontWeight: "bold", fontSize: "1rem" }}>
                SI.No
              </TableCell>
              <TableCell style={{ fontWeight: "bold", fontSize: "1rem" }}>
                Lot Name
              </TableCell>
              <TableCell style={{ fontWeight: "bold", fontSize: "1rem" }}>
                Scrap Gold Weight
              </TableCell>
              <TableCell style={{ fontWeight: "bold", fontSize: "1rem" }}>
                After Weight
              </TableCell>
              <TableCell style={{ fontWeight: "bold", fontSize: "1rem" }}>
                Difference Weight
              </TableCell>
              <TableCell style={{ fontWeight: "bold", fontSize: "1rem" }}>
                Comments
              </TableCell>
              <TableCell style={{ fontWeight: "bold", fontSize: "1rem" }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(lots || [])
              .filter((lot) =>
                lot.lot_name.toLowerCase().includes(search.toLowerCase())
              )
              .map((lot, index) => (
                <TableRow key={lot.lot_id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{lot.lot_name}</TableCell>
                  <TableCell>{formatWeight(lot.lot_before_weight)}</TableCell>
                  <TableCell>{formatWeight(lot.lot_after_weight)}</TableCell>
                  <TableCell>
                    {formatWeight(lot.lot_difference_weight)}
                  </TableCell>
                  <TableCell>{lot.lot_comments}</TableCell>
                  <TableCell>
                    <IconButton
                      color="black"
                      onClick={() => handleEditLot(lot)}
                      sx={{ color: "black" }}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      color="primary"
                      onClick={() => handleViewLot(lot.id, lot.lot_name)}
                      sx={{ color: "#25274D" }}
                    >
                      <Visibility />
                    </IconButton>

                    <IconButton
                      color="secondary"
                      onClick={() => handleDeleteLot(lot.id)}
                      sx={{ color: "red" }}
                    >
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>{editMode ? "Edit Lot" : "Add New Lot"}</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Lot Name"
            name="lot_name"
            value={newLot.lot_name}
            onChange={handleInputChange}
            fullWidth
          />
          <TextField
            margin="dense"
            label="Scrap Gold Weight"
            name="lot_before_weight"
            type="number"
            value={newLot.lot_before_weight}
            onChange={handleInputChange}
            fullWidth
          />
          <TextField
            margin="dense"
            label="After Weight"
            name="lot_after_weight"
            type="number"
            value={newLot.lot_after_weight}
            onChange={handleInputChange}
            fullWidth
          />
          <TextField
            margin="dense"
            label="Difference Weight"
            name="lot_difference_weight"
            type="number"
            value={newLot.lot_difference_weight}
            onChange={handleInputChange}
            fullWidth
          />
          <TextField
            margin="dense"
            label="Comments"
            name="lot_comments"
            value={newLot.lot_comments}
            onChange={handleInputChange}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={editMode ? handleUpdateLot : handleAddLot}>
            {editMode ? "Update" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Lot;
