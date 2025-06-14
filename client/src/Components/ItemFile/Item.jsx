// // http://localhost:5000/api/jewelType/getJewelDetails/3

// import React, { useState, useEffect } from "react";
// import {
//   Button,
//   TextField,
//   Dialog,
//   DialogActions,
//   DialogContent,
//   DialogTitle,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   Paper,
//   Typography,
//   IconButton,
// } from "@mui/material";
// import { Edit, Delete } from "@mui/icons-material";
// import { toast, ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import axios from "axios";
// import { REACT_APP_BACKEND_SERVER_URL } from "../../config/config";

// const Item = () => {
//   const [open, setOpen] = useState(false);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [jewelType, setJewelType] = useState({ name: "" });
//   const [jewelTypes, setJewelTypes] = useState([]);
//   const [editIndex, setEditIndex] = useState(null);
//   const [itemList, setItemList] = useState([]);


//   const fetchItems = async () => {
//     try {
//       const response = await axios.get(`${REACT_APP_BACKEND_SERVER_URL}/api/jewelType/getAllJewelTypes`);
//       setItemList(response.data);
//     } catch (error) {
//       console.error("Error fetching items:", error);
//       toast.error("Failed to load items.");
//     }
//   };
  

//   const handleOpen = () => {
//     setJewelType({ name: "" });
//     setEditIndex(null);
//     setOpen(true);
//   };

//   const handleClose = () => setOpen(false);

//   const fetchJewelTypes = async () => {
//     try {
//       const response = await axios.get(
//         `${REACT_APP_BACKEND_SERVER_URL}/api/jewelType/getAllJewelTypes`
//       );
//       setJewelTypes(response.data);
//     } catch (error) {
//       toast.error("Error fetching jewel types!", {
//         containerId: "custom-toast",
//       });
//       console.error("Error:", error);
//     }
//   };

//   useEffect(() => {
//     fetchJewelTypes();
//   }, []);

//   // const handleSave = async () => {
//   //   if (!jewelType.name) {
//   //     toast.error("Item name is required!", { autoClose: 2000 });
//   //     return;
//   //   }

//   //   try {
//   //     await axios.post(`${REACT_APP_BACKEND_SERVER_URL}/api/jewelType/createJewelType`, {
//   //       jewelName: jewelType.name,
//   //     });

//   //     toast.success("Item added successfully!", { autoClose: 2000 });
//   //     fetchJewelTypes();
//   //     setOpen(false);
//   //     setJewelType({ name: "" });
//   //   } catch (error) {
//   //     console.error("Error saving item:", error.response?.data || error.message);
//   //     toast.error("Failed to save item!", { autoClose: 2000 });
//   //   }
//   // };

//   const handleSave = async () => {
//     if (!jewelType.name) {
//       toast.error("Item name is required!", { autoClose: 2000 });
//       return;
//     }

//     try {
//       if (editIndex !== null) {
//         // If editIndex is set, we're updating an existing jewel
//         await axios.put(
//           `${REACT_APP_BACKEND_SERVER_URL}/api/jewelType/updateJewelType/${jewelTypes[editIndex].master_jewel_id}`,
//           {
//             jewelName: jewelType.name,
//           }
//         );
//         toast.success("Item updated successfully!", { autoClose: 2000 });
//       } else {
//         // Otherwise, it's a new item creation
//         await axios.post(
//           `${REACT_APP_BACKEND_SERVER_URL}/api/jewelType/createJewelType`,
//           {
//             jewelName: jewelType.name,
//           }
//         );
//         toast.success("Item added successfully!", { autoClose: 2000 });
//       }
//       fetchJewelTypes();
//       setOpen(false);
//       setJewelType({ name: "" });
//     } catch (error) {
//       console.error(
//         "Error saving item:",
//         error.response?.data || error.message
//       );
//       toast.error("Failed to save item!", { autoClose: 2000 });
//     }
//   };

//   const handleEdit = (index) => {
//     const jewelToEdit = jewelTypes[index];
//     setJewelType({ name: jewelToEdit.jewel_name });
//     setEditIndex(index);
//     setOpen(true);
//   };

//   const handleDelete = async (master_jewel_id) => {
//     const confirmDelete = window.confirm(
//       "Are you sure you want to delete this item?"
//     );
//     if (!confirmDelete) return;

//     try {
//       await axios.delete(
//         `${REACT_APP_BACKEND_SERVER_URL}/api/jewelType/deleteJewelType/${master_jewel_id}`
//       );
//       fetchJewelTypes();
//       toast.success("Item deleted successfully!", { autoClose: 2000 });
//     } catch (error) {
//       console.error(
//         "Error deleting item:",
//         error.response?.data || error.message
//       );
//       toast.error("Failed to delete item!", { autoClose: 2000 });
//     }
//   };

//   const filteredJewelTypes = jewelTypes.filter((jewel) =>
//     jewel.jewel_name.toLowerCase().includes(searchQuery.toLowerCase())
//   );

//   return (
//     <div
//       style={{
//         maxWidth: "90%",
//         margin: "auto",
//         padding: 20,
//         textAlign: "center",
//       }}
//     >
//       <Typography
//         variant="h4"
//         style={{
//           fontWeight: "bold",
//           background: "linear-gradient(to right, #d4af37, #000)",
//           WebkitBackgroundClip: "text",
//           WebkitTextFillColor: "transparent",
//           marginBottom: 20,
//         }}
//       >
//         Item List
//       </Typography>

//       <ToastContainer
//         position="top-right"
//         autoClose={3000}
//         style={{ marginTop: "60px" }}
//       />

//       <div
//         style={{
//           display: "flex",
//           justifyContent: "space-between",
//           alignItems: "center",
//           marginBottom: 20,
//         }}
//       >
//         <TextField
//           variant="outlined"
//           placeholder="Search Item Name"
//           value={searchQuery}
//           onChange={(e) => setSearchQuery(e.target.value)}
//           style={{ width: 350, marginRight: 20 }}
//         />
//         <Button
//           variant="contained"
//           onClick={handleOpen}
//           style={{
//             backgroundColor: "#d4af37",
//             color: "#000",
//             fontWeight: "bold",
//           }}
//         >
//           Add Item
//         </Button>
//       </div>

//       <Dialog open={open} onClose={handleClose}>
//         <DialogTitle>
//           {editIndex !== null ? "Edit Item Details" : "Add Item"}
//         </DialogTitle>
//         <DialogContent>
//           <TextField
//             label="Item Name"
//             name="name"
//             value={jewelType.name}
//             onChange={(e) =>
//               setJewelType({ ...jewelType, name: e.target.value })
//             }
//             fullWidth
//             margin="normal"
//           />
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={handleClose} style={{ color: "#000" }}>
//             Cancel
//           </Button>
//           <Button
//             onClick={handleSave}
//             style={{
//               backgroundColor: "#d4af37",
//               color: "#000",
//               fontWeight: "bold",
//             }}
//           >
//             Save
//           </Button>
//         </DialogActions>
//       </Dialog>

//       {filteredJewelTypes.length > 0 ? (
//         <TableContainer
//           component={Paper}
//           style={{ marginTop: 30, borderRadius: 10, overflow: "hidden" }}
//         >
//           <Table
//             style={{ minWidth: "100%", backgroundColor: "#000", color: "#fff" }}
//           >
//             <TableHead>
//               <TableRow style={{ backgroundColor: "#f5f5f5" }}>
//                 <TableCell style={styles.headerCell}>Item Name</TableCell>

//                 <TableCell style={styles.headerCell}>Actions</TableCell>
//               </TableRow>
//             </TableHead>
//             <TableBody>
//               {filteredJewelTypes.map((jewel, index) => (
//                 <TableRow key={jewel.master_jewel_id}>
//                   <TableCell style={styles.cell}>{jewel.jewel_name}</TableCell>
//                   <TableCell style={styles.cell}>
//                     <IconButton
//                       onClick={() => handleEdit(index)}
//                       style={{ color: "black" }}
//                     >
//                       <Edit />
//                     </IconButton>
//                     <IconButton
//                       onClick={() => handleDelete(jewel.master_jewel_id)}
//                       style={{ color: "red" }}
//                     >
//                       <Delete />
//                     </IconButton>
//                   </TableCell>
//                 </TableRow>
//               ))}
//             </TableBody>
//           </Table>
//         </TableContainer>
//       ) : (
//         <Typography variant="h6" style={{ marginTop: 20 }}>
//           No Items found.
//         </Typography>
//       )}
//     </div>
//   );
// };

// const styles = {
//   headerCell: {
//     fontWeight: "bold",
//     color: "#000",
//     textAlign: "center",
//     fontSize: 18,
//   },
//   cell: {
//     color: "black",
//     textAlign: "center",
//     fontSize: 16,
//     backgroundColor: "white",
//   },
//   evenRow: {
//     backgroundColor: "#fff",
//   },
//   oddRow: {
//     backgroundColor: "#fff",
//   },
// };

// export default Item;



// http://localhost:5000/api/jewelType/getJewelDetails/3

import React, { useState, useEffect ,useRef} from "react";
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
import axios from "axios";
import { REACT_APP_BACKEND_SERVER_URL } from "../../config/config";

const Item = () => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [jewelType, setJewelType] = useState({ name: "" });
  const [jewelTypes, setJewelTypes] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const saveRef=useRef()

  const handleOpen = () => {
    setJewelType({ name: "" });
    setEditIndex(null);
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  const fetchJewelTypes = async () => {
    try {
      const response = await axios.get(
        `${REACT_APP_BACKEND_SERVER_URL}/api/jewelType/getAllJewelTypes`
      );
      setJewelTypes(response.data);
    } catch (error) {
      toast.error("Error fetching jewel types!", {
        containerId: "custom-toast",
      });
      console.error("Error:", error);
    }
  };

  useEffect(() => {
    fetchJewelTypes();
  }, []);

  const handleSave = async () => {
    if (!jewelType.name) {
      toast.error("Item name is required!", { autoClose: 2000 });
      return;
    }

    try {
      if (editIndex !== null) {
        await axios.put(
          `${REACT_APP_BACKEND_SERVER_URL}/api/jewelType/updateJewelType/${jewelTypes[editIndex].master_jewel_id}`,
          {
            jewelName: jewelType.name,
          }
        );
        toast.success("Item updated successfully!", { autoClose: 2000 });
      } else {
        await axios.post(
          `${REACT_APP_BACKEND_SERVER_URL}/api/jewelType/createJewelType`,
          {
            jewelName: jewelType.name,
          }
        );
        toast.success("Item added successfully!", { autoClose: 2000 });
      }
      fetchJewelTypes();
      setOpen(false);
      setJewelType({ name: "" });
    } catch (error) {
      console.error("Error saving item:", error.response?.data || error.message);
      toast.error("Failed to save item!", { autoClose: 2000 });
    }
  };

  const handleEdit = (index) => {
    const jewelToEdit = jewelTypes[index];
    setJewelType({ name: jewelToEdit.jewel_name });
    setEditIndex(index);
    setOpen(true);
  };

  const handleDelete = async (master_jewel_id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this item?");
    if (!confirmDelete) return;

    try {
      await axios.delete(
        `${REACT_APP_BACKEND_SERVER_URL}/api/jewelType/deleteJewelType/${master_jewel_id}`
      );
      fetchJewelTypes();
      toast.success("Item deleted successfully!", { autoClose: 2000 });
    } catch (error) {
      console.error("Error deleting item:", error.response?.data || error.message);
      toast.error("Failed to delete item!", { autoClose: 2000 });
    }
  };

  const filteredJewelTypes = jewelTypes.filter((jewel) =>
    jewel.jewel_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        Item List
      </Typography>

      <ToastContainer position="top-right" autoClose={3000} style={{ marginTop: "60px" }} />

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
          placeholder="Search Item Name"
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
          Add Item
        </Button>
      </div>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{editIndex !== null ? "Edit Item Details" : "Add Item"}</DialogTitle>
        <DialogContent>
          <TextField
            label="Item Name"
            name="name"
            value={jewelType.name}
            onChange={(e) => setJewelType({ ...jewelType, name: e.target.value })}
            fullWidth
            margin="normal"
            
            autoComplete="off"
            onKeyDown={(e)=>{
              if(e.key==="Enter"){
                saveRef.current.focus()
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} style={{ color: "#000" }}>
            Cancel
          </Button>
          <Button
             ref={saveRef}
            onClick={handleSave}
            style={{
              backgroundColor: "#d4af37",
              color: "#000",
              fontWeight: "bold",
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {filteredJewelTypes.length > 0 ? (
        <TableContainer component={Paper} style={{ marginTop: 30, borderRadius: 10 }}>
          <Table style={{ minWidth: "100%", backgroundColor: "#000", color: "#fff" }}>
            <TableHead>
              <TableRow style={{ backgroundColor: "#f5f5f5" }}>
                <TableCell style={styles.headerCell}>Item Name</TableCell>
                <TableCell style={styles.headerCell}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredJewelTypes.map((jewel, index) => (
                <TableRow key={jewel.master_jewel_id}>
                  <TableCell style={styles.cell}>{jewel.jewel_name}</TableCell>
                  <TableCell style={styles.cell}>
                    <IconButton onClick={() => handleEdit(index)} style={{ color: "black" }}>
                      <Edit />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDelete(jewel.master_jewel_id)}
                      style={{ color: "red" }}
                    >
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Typography variant="h6" style={{ marginTop: 20 }}>
          No Items found.
        </Typography>
      )}
    </div>
  );
};

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
    backgroundColor: "white",
  },
};

export default Item;
