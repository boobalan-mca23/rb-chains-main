import React, { useState, useEffect,useRef} from "react";
import VisibilityIcon from '@mui/icons-material/Visibility';
import {
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  IconButton,
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios, { Axios } from "axios";
import { REACT_APP_BACKEND_SERVER_URL } from "../../config/config";

function Customer() {
  const [open, setOpen] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [customer, setCustomer] = useState({
    name: "",
    shop: "",
    phone: "",
    address: "",
  });
  const [customers, setCustomers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewOpen, setViewOpen] = useState(false);
  const [viewCustomer, setViewCustomer] = useState(null);
  const [itemList, setItemList] = useState([]);
  const [save, setSave] = useState([])
  const nameRef=useRef()
  const shopRef=useRef()
  const phonRef=useRef()
  const addressRef=useRef()
  const saveRef=useRef()

  const handleView = async (customer) => {
    setViewCustomer(customer);
    try {
      const response = await axios.get(`${REACT_APP_BACKEND_SERVER_URL}/api/jewelType/getJewelDetails/${customer.customer_id}`);
      console.log('response from customer item list', response.data)
      setItemList(response.data);
      setViewOpen(true);
    } catch (error) {
      toast.error("Failed to load item list");
      console.error("Error fetching items:", error);
    }
  };

  const handleViewClose = () => {
    setViewOpen(false);
    setViewCustomer(null);
    setItemList([]);
  };

  const handleOpen = () => {
    setCustomer({ name: "", shop: "", phone: "", address: "" });
    setEditIndex(null);
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  const handleChange = (e) => {
    setCustomer({ ...customer, [e.target.name]: e.target.value });
  };

  const fetchCustomers = async () => {
    try {
      const response = await axios.get(
        `${REACT_APP_BACKEND_SERVER_URL}/api/customer/customerinfo`
      );
      setCustomers(response.data);
      console.log('customer data', response.data)
    } catch (error) {
      toast.error("Error fetching customers!", { containerId: "custom-toast" });
      console.error("Error:", error);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleSave = async () => {
    try {
      const payload = {
        customer_name: customer.name,
        customer_shop_name: customer.shop,
        phone_number: customer.phone,
        address: customer.address,
      };

      if (!customer.name) {
        toast.error("Customer name is required!", { autoClose: 2000 });
        return;
      }

      if (editIndex !== null) {
        await axios.put(
          `${REACT_APP_BACKEND_SERVER_URL}/api/customer/customer_info/${customers[editIndex].customer_id}`,
          payload
        );
        toast.success("Customer updated successfully!", { autoClose: 2000 });
      } else {
        await axios.post(
          `${REACT_APP_BACKEND_SERVER_URL}/api/customer/customer_info`,
          payload
        );
        toast.success("Customer added successfully!", { autoClose: 2000 });
      }

      fetchCustomers();
      setOpen(false);
      setCustomer({ name: "", shop: "", phone: "", address: "" });
    } catch (error) {
      console.error(
        "Error saving customer:",
        error.response ? error.response.data : error.message
      );
      toast.error("Failed to save customer!", { autoClose: 2000 });
    }
  };


  const handleEdit = (index) => {
    const selectedCustomer = customers[index];
    setCustomer({
      name: selectedCustomer.customer_name,
      shop: selectedCustomer.customer_shop_name,
      phone: selectedCustomer.phone_number,
      address: selectedCustomer.address,
    });
    setEditIndex(index);
    setOpen(true);
  };

  const handleDelete = async (customer_id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this customer?"
    );
    if (!confirmDelete) return;

    try {
      await axios.delete(
        `${REACT_APP_BACKEND_SERVER_URL}/api/customer/customer_info/${customer_id}`
      );
      fetchCustomers();
      toast.success("Customer deleted successfully!", { autoClose: 2000 });
    } catch (error) {
      console.error(
        "Error deleting customer:",
        error.response?.data || error.message
      );
      toast.error("Failed to delete customer!", { autoClose: 2000 });
    }
  };

  const filteredCustomers = customers.filter((cust) =>
    cust.customer_name.toLowerCase().includes(searchQuery.toLowerCase())
  );


  const handleItemPercentage = (itemIndex, customerId, master_jewel_id, value) => {
   console.log('values from itemPercentage function',itemIndex,customerId,master_jewel_id,value)

   const tempItem=[...itemList];
   const currentItem = tempItem[itemIndex];
   const existingValue = currentItem.MasterJewelTypeCustomerValue?.[0] || {};
   const tempObj=tempItem.filter((item,index)=>index===itemIndex)
   const newEntry={
    id:existingValue.id || undefined,
    customer_id:customerId,
    masterJewel_id:master_jewel_id,
    value:parseFloat(value)?parseFloat(value):"",

   }
   if(tempObj[0].MasterJewelTypeCustomerValue.length===0){
    tempObj[0].MasterJewelTypeCustomerValue.push(newEntry)
   }else{
    tempObj[0].MasterJewelTypeCustomerValue[0]=newEntry
   }  
   setItemList(tempItem)
  }



  const handleSaveItem = async () => {

     console.log('itemList from billing',itemList)

    console.log(itemList)

    try {
      const response = await axios.post(
        `${REACT_APP_BACKEND_SERVER_URL}/api/jewelType/createCustomerJewelPercentage`,
        { itemList }
      );
      console.log(response.data); //  log the response
     setViewOpen(false)
      toast.success(response.data.message, { autoClose: 2000 }); // optional: success toast
    } catch (err) {
      console.error(err);
      toast.error("Failed to save percentage!", { autoClose: 2000 });
    }
  };

  
  return (
    <div
      style={{
        maxWidth: "90%",
        margin: "auto",
        padding: 20,
        textAlign: "center",
      }}
    >
      <Typography
        variant="h4"
        style={{
          fontWeight: "bold",
          background: "linear-gradient(to right, #d4af37, #000)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          marginBottom: 20,
        }}
      >
        Customer List
      </Typography>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        style={{ marginTop: "60px" }}
      />

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <TextField
          variant="outlined"
          placeholder="Search Customer Name"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ width: 350, marginRight: 20 }}
          autoComplete="off"
        />
        <Button
          variant="contained"
          onClick={handleOpen}
          style={{
            backgroundColor: "#d4af37",
            color: "#000",
            fontWeight: "bold",
          }}
        >
          Add Customer
        </Button>
      </div>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>
          {editIndex !== null ? "Edit Customer Details" : "Add Customer"}
        </DialogTitle>
        <DialogContent >
          <TextField
            label="Customer Name"
            name="name"
            value={customer.name}
            onChange={handleChange}
            fullWidth
            margin="normal"
            autoComplete="off"
            inputRef={nameRef}
            onKeyDown={(e)=>{
                if (e.key === "Enter" || e.key==="ArrowDown" ||e.key==="ArrowRight"){ shopRef.current.focus()}


            }}
          />
          <TextField
            label="Shop Name"
            name="shop"
            value={customer.shop}
            onChange={handleChange}
            fullWidth
            margin="normal"
            autoComplete="off"
            inputRef={shopRef}
            onKeyDown={(e)=>{
                if (e.key === "Enter" || e.key==="ArrowDown" || e.key==="ArrowRight") {phonRef.current.focus()};
                if(e.key==="ArrowUp" || e.key ==="ArrowLeft") {nameRef.current.focus()};
            }}
          />
          <TextField
            label="Phone Number"
            name="phone"
            value={customer.phone}
            onChange={handleChange}
            fullWidth
            margin="normal"
            autoComplete="off"
            inputRef={phonRef}
            onKeyDown={(e)=>{
                if (e.key === "Enter" || e.key==="ArrowDown" || e.key==="ArrowRight") addressRef.current.focus();
                if(e.key==="ArrowUp" || e.key==="ArrowLeft") {shopRef.current.focus()};
            }}
          />
          <TextField
            label="Address"
            name="address"
            value={customer.address}
            onChange={handleChange}
            fullWidth
            multiline
            rows={3}
            margin="normal"
            autoComplete="off"
            inputRef={addressRef}
             onKeyDown={(e)=>{
                if (e.key === "Enter") saveRef.current.focus();
                if(e.key==="ArrowUp" || e.key==="ArrowLeft") {phonRef.current.focus()};
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} style={{ color: "#000" }}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            style={{
              backgroundColor: "#d4af37",
              color: "#000",
              fontWeight: "bold",
            }}
            ref={saveRef}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {filteredCustomers.length > 0 ? (
        <TableContainer
          component={Paper}
          style={{ marginTop: 30, borderRadius: 10, overflow: "hidden" }}
        >
          <Table
            style={{ minWidth: "100%", backgroundColor: "#000", color: "#fff" }}
          >
            <TableHead>
              <TableRow style={{ backgroundColor: "#f5f5f5" }}>
                <TableCell style={styles.headerCell}>Customer Name</TableCell>
                <TableCell style={styles.headerCell}>Shop Name</TableCell>
                <TableCell style={styles.headerCell}>Phone Number</TableCell>
                <TableCell style={styles.headerCell}>Address</TableCell>
                <TableCell style={styles.headerCell}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredCustomers.map((cust, index) => (
                <TableRow
                  key={cust.customer_id}
                  style={index % 2 === 0 ? styles.evenRow : styles.oddRow}
                >
                  <TableCell style={styles.cell}>{cust.customer_name}</TableCell>
                  <TableCell style={styles.cell}>{cust.customer_shop_name}</TableCell>
                  <TableCell style={styles.cell}>{cust.phone_number}</TableCell>
                  <TableCell style={styles.cell}>{cust.address}</TableCell>
                  <TableCell style={styles.cell}>
                    <IconButton onClick={() => handleEdit(index)} style={{ color: "black" }}>
                      <Edit />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDelete(cust.customer_id)}
                      style={{ color: "red" }}
                    >
                      <Delete />
                    </IconButton>
                    <IconButton
                      onClick={() => handleView(cust)}
                      style={{ color: "#25274D" }}
                    >
                      <VisibilityIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Typography variant="h6" style={{ marginTop: 20 }}>
          No customers found.
        </Typography>
      )}

      <Dialog open={viewOpen} onClose={handleViewClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {viewCustomer?.customer_name || "Customer Details"}
        </DialogTitle>
        <DialogContent>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Item Name</strong></TableCell>
                  <TableCell><strong>Value</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {itemList.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.jewel_name}</TableCell>
                    <TableCell>
                      <input
                        value={item.MasterJewelTypeCustomerValue.length === 0 ? "" : item.
                          MasterJewelTypeCustomerValue[0].value}
                        type="text"
                        placeholder="Enter value"
                        style={{
                          width: "100%",
                          padding: "6px 8px",
                          borderRadius: "4px",
                          border: "1px solid #ccc",
                        }}
                        onChange={(e) => { handleItemPercentage(index, viewCustomer?.customer_id, item.master_jewel_id, e.target.value) }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={()=>{handleSaveItem()}}> Save</Button>
          <Button onClick={handleViewClose} color="primary">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

const styles = {
  headerCell: {
    fontWeight: "bold",
    color: "#000",
    textAlign: "center",
    fontSize: 18,
  },
  cell: {
    color: "black",
    textAlign: "center",
    fontSize: 16,
  },
  evenRow: {
    backgroundColor: "#fff",
  },
  oddRow: {
    backgroundColor: "#fff",
  },
};

export default Customer;
