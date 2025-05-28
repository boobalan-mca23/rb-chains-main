
// import React, { useState, useEffect, useRef } from "react";
// import {
//   Autocomplete,
//   TextField,
//   Box,
//   Button,
//   Table,
//   TableHead,
//   TableCell,
//   TableRow,
//   TableBody,
//   IconButton,
// } from "@mui/material";
// import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
// import jsPDF from "jspdf"; 
// import html2canvas from "html2canvas"; 
// import axios from "axios";
// import { toast, ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import { FaTrash } from "react-icons/fa";
// import { MdDeleteForever } from "react-icons/md";
// import { useNavigate } from "react-router-dom";
// import "./billing.css";

// const Billing = () => {
//   const [customers, setCustomers] = useState([]);
//   const [selectedCustomer, setSelectedCustomer] = useState(null);
//   const [selectedProduct, setSelectedProduct] = useState(null);
//   const [billItems, setBillItems] = useState([]);
//   const [billId, setBillId] = useState("");
//   const [date, setDate] = useState("");
//   const [time, setTime] = useState("");
//   const [isPrinting, setIsPrinting] = useState(false);
//   const billRef = useRef(); 
//   const [products, setProducts] = useState([]);
//   const [productWeight, setProductWeight] = useState([]);
//   const [totalPrice, setTotalPrice] = useState(0);
//   const [totalBillAmount, setTotalBillAmount] = useState(0);
//   const [customerClosing, setCustomerClosing] = useState(0);
//   const [balanceRow, setBalanceRow] = useState([]);
//   const [closing, setClosing] = useState(0);
//   const [pure, setPure] = useState(0);

//   const [rows, setRows] = useState([]); 
//   const [viewMode, setViewMode] = useState(false); 
//   const [selectedBill, setSelectedBill] = useState(null); 

//   const navigate = useNavigate(); 

//   const handleProductSelect = (itemIndex, stockId) => {
//     const tempProducts = [...productWeight];
//     let customerData;
//     const tempSelectProduct = tempProducts.filter(
//       (item, index) => itemIndex === index
//     );
//     console.log("masterjewelid", selectedProduct.master_jewel_id);

//     if (!selectedCustomer) {
//       toast.error("Please select a customer first!", { autoClose: 2000 });
//       return;
//     }

//     customerData = customers.filter(
//       (item) => item.customer_id === selectedCustomer.customer_id
//     );

//     if (customerData.length === 0) {
//       toast.error("Customer data not found for selected customer.", { autoClose: 2000 });
//       return;
//     }

//     const filterMasterItem =
//       customerData[0].MasterJewelTypeCustomerValue.filter(
//         (item) => item.masterJewel_id === selectedProduct.master_jewel_id
//       );

//     if (filterMasterItem.length === 0) {
//       toast.warning("Percentage is Required for this jewel type!", { autoClose: 2000 });
//     } else {
//       const billObj = {
//         productName: tempSelectProduct[0].item_name,
//         productTouch: tempSelectProduct[0].touchValue,
//         productWeight: tempSelectProduct[0].value,
//         productPure: 0,
//         productPercentage: 0,
//         stockId: stockId,
//       };

//       billObj.productPercentage = filterMasterItem[0].value;
//       billObj.productPure =
//         ((billObj.productTouch + billObj.productPercentage) *
//           billObj.productWeight) /
//         100;

//       const tempBill = [...billItems];
//       tempBill.push(billObj);
//       setBillItems(tempBill);

    
//       tempProducts.splice(itemIndex, 1);
//       setProductWeight(tempProducts);
//     }
//   };

//   const handleSaveBill = async () => {
//     if (!selectedCustomer) {
//       toast.error("Customer Name is Required!", { autoClose: 2000 });
//       return;
//     }
//     if (!selectedProduct) {
//       toast.error("Jewel Name is Required!", { autoClose: 2000 });
//       return;
//     }
//     if (billItems.length === 0) {
//       toast.error("Order Items are Required!", { autoClose: 2000 });
//       return;
//     }

//     const payLoad = {
//       customer_id: selectedCustomer.customer_id,
//       order_status: "completed",
//       totalPrice: totalPrice,
//       orderItems: billItems,
//       oldBalance: customerClosing,
//       balance: balanceRow,
//       closingbalance: balanceRow.length === 0 ? totalBillAmount : closing,
//       receivedDetails: rows,
//     };
//     console.log("payload", payLoad);

//     try {
//       const response = await axios.post(
//         `${process.env.REACT_APP_BACKEND_SERVER_URL}/api/bill/saveBill`,
//         payLoad
//       );
//       if (response.status === 201) {
//         setBillId(response.data.data.id);
//         toast.success("Bill Created Successfully!", { autoClose: 1000 });
//         const cells = document.querySelectorAll(".merge-cell");
//         window.onbeforeprint = () => {
//           cells.forEach((td) => td.setAttribute("colspan", "3"));
//         };
//         window.onafterprint = () => {
//           cells.forEach((td) => td.setAttribute("colspan", "4"));
//         };

//         window.print(); 
//       }
//     } catch (err) {
//       toast.error(`Error saving bill: ${err.message}`, { autoClose: 3000 });
//       console.error("Error saving bill:", err);
//     }
//   };

//   const calculateTotal = (items) => {
//     return items.reduce((acc, currValue) => acc + currValue.productPure, 0);
//   };


//   const calculateClosing = (balRows) => {
//     return balRows.reduce((acc, currValue) => acc + currValue.pure, 0);
//   };

//   const handleBalanceRow = () => {
//     if (!selectedCustomer) {
//       toast.warning("Select Customer Name", { autoClose: 2000 });
//       return;
//     }
//     if (!selectedProduct) {
//       toast.warning("Select Jewel Name", { autoClose: 2000 });
//       return;
//     }
//     if (billItems.length === 0) {
//       toast.warning("Add Order Items first!", { autoClose: 2000 });
//       return;
//     }

//     const tempRow = [
//       ...balanceRow,
//       {
//         customer_id: selectedCustomer.customer_id,
//         givenGold: "", 
//         touch: "", 
//         pure: 0,
//       },
//     ];
//     setBalanceRow(tempRow);
//   };

//   const handleBalanceInputChange = (index, field, value) => {
//     const updatedRows = [...balanceRow];
//     updatedRows[index][field] = value;

//     const givenGold = parseFloat(updatedRows[index]["givenGold"]);
//     const touch = parseFloat(updatedRows[index]["touch"]);

//     if (!isNaN(givenGold) && !isNaN(touch)) {
//       updatedRows[index]["pure"] = (givenGold * touch) / 100;
//     } else {
//       updatedRows[index]["pure"] = 0; 
//     }

//     setBalanceRow(updatedRows);
//   };

//   const handleRemoveBalanceRow = (index) => {
//     const confirmDelete = window.confirm(
//       "Are you sure you want to delete this balance row?"
//     );

//     if (confirmDelete) {
//       const tempBalRow = [...balanceRow];
//       tempBalRow.splice(index, 1);
//       setBalanceRow(tempBalRow);
//     }
//   };

//   const handleChangePercentage = (itemIndex, value) => {
//     const tempBill = [...billItems];
//     const itemToUpdate = tempBill[itemIndex];

//     const newPercentage = parseInt(value);
//     if (isNaN(newPercentage)) {
    
//       itemToUpdate.productPercentage = ""; 
//       itemToUpdate.productPure = (itemToUpdate.productTouch * itemToUpdate.productWeight) / 100; 
//     } else {
//       itemToUpdate.productPercentage = newPercentage;
//       itemToUpdate.productPure =
//         ((itemToUpdate.productTouch + newPercentage) * itemToUpdate.productWeight) / 100;
//     }

//     setBillItems([...tempBill]);
//   };

//   const handleRemoveOrder = (index, item_name, touchValue, value, stock_id) => {
//     const confirmDelete = window.confirm(
//       "Are you sure you want to delete this order item?"
//     );

//     if (confirmDelete) {
//       const tempBill = [...billItems];
//       tempBill.splice(index, 1);
//       setBillItems(tempBill);

//       const tempProduct = [...productWeight];
//       tempProduct.push({ item_name, stock_id, touchValue, value });
//       setProductWeight(tempProduct); 
//     }
//   };

//   const handleAddRow = () => {
//     setRows([
//       ...rows,
//       {
//         date: "",
//         goldRate: "",
//         givenGold: "",
//         touch: "",
//         purityWeight: "",
//         amount: "",
//         hallmark: "",
//       },
//     ]);
//   };

//   const handleDeleteRow = (index) => {
//     const updatedRows = [...rows];
//     updatedRows.splice(index, 1);
//     setRows(updatedRows);
//   };

//   const handleRowChange = (index, field, value) => {
//     const updatedRows = [...rows];
//     updatedRows[index][field] = value;

//     if (field === "givenGold" || field === "touch") {
//       const givenGold = parseFloat(updatedRows[index]["givenGold"]);
//       const touch = parseFloat(updatedRows[index]["touch"]);
//       if (!isNaN(givenGold) && !isNaN(touch)) {
//         updatedRows[index]["purityWeight"] = (
//           (givenGold * touch) /
//           100
//         ).toFixed(3);
//       } else {
//         updatedRows[index]["purityWeight"] = "";
//       }
//     }
//     setRows(updatedRows);
//   };

//   useEffect(() => {
//     const fetchCustomers = async () => {
//       try {
//         const response = await axios.get(
//           `${process.env.REACT_APP_BACKEND_SERVER_URL}/api/customer/getCustomerValueWithPercentage`
//         );
//         setCustomers(Array.isArray(response.data) ? response.data : []);
//       } catch (error) {
//         toast.error("Error fetching customers!", { containerId: "custom-toast" });
//         console.error("Error:", error);
//       }
//     };

//     const fetchJewelItem = async () => {
//       try {
//         const response = await axios.get(
//           `${process.env.REACT_APP_BACKEND_SERVER_URL}/api/jewelType/getJewelType`
//         );
//         setProducts(
//           Array.isArray(response.data.allJewel) ? response.data.allJewel : []
//         );
//       } catch (error) {
//         toast.error("Error fetching jewel types!", { containerId: "custom-toast" });
//         console.error("Error:", error);
//       }
//     };

//     fetchCustomers();
//     fetchJewelItem();
//   }, []);

//   useEffect(() => {
//     const updateTime = () => {
//       const now = new Date();
//       setDate(now.toLocaleDateString("en-IN"));
//       setTime(
//         now.toLocaleTimeString("en-IN", {
//           hour: "2-digit",
//           minute: "2-digit",
//           hour12: true,
//         })
//       );
//     };

//     updateTime();
//     const timer = setInterval(updateTime, 60000); 
//     return () => clearInterval(timer);
//   }, []);

//   useEffect(() => {
//     if (balanceRow.length === 0) {
//       setClosing(totalBillAmount);
//       setPure(0); 
//     } else {
//       const calculatedPure = calculateClosing(balanceRow);
//       setPure(calculatedPure);
//       setClosing(totalBillAmount - calculatedPure);
//     }
//   }, [balanceRow, totalBillAmount]);

//   useEffect(() => {
//     setTotalPrice(calculateTotal(billItems));
//     setTotalBillAmount(Number(calculateTotal(billItems)) + Number(customerClosing));
//   }, [billItems, customerClosing]);

//   useEffect(() => {
//     if (selectedProduct) {
//       const fetchWeight = async () => {
//         try {
//           const productsWeight = await axios.get(
//             `${process.env.REACT_APP_BACKEND_SERVER_URL}/api/jewelType/getProductWeight/${selectedProduct.master_jewel_id}`
//           );
//           setProductWeight(productsWeight.data.productsWeight);
//         } catch (err) {
//           if (err.response && err.response.status === 400) {
//             setProductWeight([]);
//             toast.info("No products found for this jewel type.", { autoClose: 2000 });
//           } else if (err.response && err.response.status === 500) {
//             toast.error("Server error while fetching product weights.", { autoClose: 3000 });
//           } else {
//             toast.error("Error fetching product weights.", { autoClose: 3000 });
//           }
//           console.error("Error fetching product weights:", err);
//         }
//       };
//       fetchWeight();
//     } else {
//       setProductWeight([]); 
//     }
//   }, [selectedProduct]);

//   useEffect(() => {
//     const fetchClosingBalance = async () => {
//       try {
//         const response = await axios.get(
//           `${process.env.REACT_APP_BACKEND_SERVER_URL}/api/customer/closing/${selectedCustomer.customer_id}`
//         );
//         setCustomerClosing(response.data.closingBalance);
//       } catch (err) {
//         toast.error(`Error fetching customer closing balance: ${err.message}`, { autoClose: 3000 });
//         console.error("Error fetching closing balance:", err);
//         setCustomerClosing(0); 
//       }
//     };
//     if (selectedCustomer) {
//       fetchClosingBalance();
//     } else {
//       setCustomerClosing(0); 
//     }
//   }, [selectedCustomer]);

//   useEffect(() => {
//     setBillItems([]);
//     setRows([]);
//     setBalanceRow([]);

//     if (selectedProduct && selectedCustomer) {
//       const fetchWeightOnCustomerProductChange = async () => {
//         try {
//           const productsWeight = await axios.get(
//             `${process.env.REACT_APP_BACKEND_SERVER_URL}/api/jewelType/getProductWeight/${selectedProduct.master_jewel_id}`
//           );
//           setProductWeight(productsWeight.data.productsWeight);
//         } catch (err) {
//           if (err.response && err.response.status === 400) {
//             setProductWeight([]);
//           } else if (err.response && err.response.status === 500) {
//             toast.error("Server Error: Could not fetch product weights on change.", { autoClose: 3000 });
//           } else {
//             toast.error("Error fetching products on customer/product change.", { autoClose: 3000 });
//           }
//           console.error("Error fetching product weights on change:", err);
//         }
//       };
//       fetchWeightOnCustomerProductChange();
//     } else {
//       setProductWeight([]); 
//     }
//   }, [selectedCustomer, selectedProduct]);

//   return (
//     <Box className="billing-wrapper" ref={billRef}>
//       <Box className="left-panel">
//         <h1 className="heading">Estimate Only</h1>
//         <Box className="bill-header">
//           <Box className="bill-number">
//             <p>
//               <strong>Bill No:</strong> {billId}
//             </p>
//           </Box>
//           <Box className="bill-info">
//             <p>
//               <strong>Date:</strong> {date}
//               <br></br>
//               <br></br>
//               <strong>Time:</strong> {time}
//             </p>
//           </Box>
//         </Box>

//         <Box className="search-section no-print">
//           <Autocomplete
//             options={customers}
//             getOptionLabel={(option) => option.customer_name || ""}
//             onChange={(event, newValue) => setSelectedCustomer(newValue)}
//             value={selectedCustomer}
//             renderInput={(params) => (
//               <TextField
//                 {...params}
//                 label="Select Customer"
//                 variant="outlined"
//                 size="small"
//               />
//             )}
//             className="small-autocomplete"
//           />

//           <Autocomplete
//             options={products}
//             getOptionLabel={(option) => option.jewel_name || ""}
//             onChange={(event, newValue) => setSelectedProduct(newValue)}
//             value={selectedProduct}
//             renderInput={(params) => (
//               <TextField
//                 {...params}
//                 label="Search Product Name"
//                 variant="outlined"
//                 size="small"
//               />
//             )}
//             className="small-autocomplete"
//           />
//         </Box>
//         {selectedCustomer && (
//           <Box className="customer-details">
//             <h3 className="no-print">Customer Details:</h3>
//             <p>
//               <strong>Name:</strong> {selectedCustomer.customer_name}
//             </p>
//           </Box>
//         )}
//         <Box className="items-section">
//           <h3 className="no-print">Bill Details:</h3>
//           <div className="run">
//             <b>
//               Gold Rate:
//               <TextField
//                 size="small"
//                 style={{
//                   width: "120px",
//                   height: "1rem",
//                   bottom: "18px",
//                   left: "5px",
//                 }}
//                 // value={goldRate}
//                 // onChange={(e) => setGoldRate(e.target.value)}
//                 type="number"
//                 required
//                 disabled={viewMode && selectedBill}
//               />
//             </b>
//           </div>
//           <table className="table">
//             <thead>
//               <tr>
//                 <th className="th">Description</th>
//                 <th className="th">Touch</th>
//                 <th className="th no-print">%</th>
//                 <th className="th">Weight</th>
//                 <th className="th">Pure</th>
//                 <th className="th no-print">Action</th>
//               </tr>
//             </thead>
//             <tbody>
//               {billItems.length > 0 ? (
//                 billItems.map((item, index) => (
//                   <tr key={index}>
//                     <td className="td">{item.productName}</td>
//                     <td className="td">{item.productTouch}</td>
//                     <td className="td no-print">
//                       <input
//                         value={item.productPercentage}
//                         type="number"
//                         onChange={(e) =>
//                           handleChangePercentage(index, e.target.value)
//                         }
//                       />
//                     </td>
//                     <td className="td">{item.productWeight}</td>
//                     <td className="td">{item.productPure.toFixed(3)}</td>
//                     <td className="td no-print">
//                       <Button
//                         onClick={() =>
//                           handleRemoveOrder(
//                             index,
//                             item.productName,
//                             item.productTouch,
//                             item.productWeight,
//                             item.stockId
//                           )
//                         }
//                       >
//                         <FaTrash />
//                       </Button>
//                     </td>
//                   </tr>
//                 ))
//               ) : (
//                 <tr>
//                   <td colSpan={6} className="no-products-message">
//                     No products selected
//                   </td>
//                 </tr>
//               )}
//               <tr>
//                 <td colSpan={4} className="td merge-cell">
//                   <strong>Bill Total</strong>
//                 </td>
//                 <td className="td">{totalPrice.toFixed(3)}</td>
//                 <td className="no-print"></td>
//               </tr>
//               {selectedCustomer && (
//                 <tr>
//                   <td colSpan={4} className="td merge-cell">
//                     <strong>Old Balance</strong>
//                   </td>
//                   <td className="td">{customerClosing.toFixed(3)}</td>
//                   <td className="no-print"></td>
//                 </tr>
//               )}
//               <tr>
//                 <td colSpan={4} className="td merge-cell">
//                   <strong>Total Amount</strong>
//                 </td>
//                 <td className="td">{totalBillAmount.toFixed(3)}</td>
//                 <td className="no-print"></td>
//               </tr>
//               {balanceRow.map((row, index) => (
//                 <tr key={`balance-${index}`}>
//                   <td className="td">Given Gold</td>
//                   <td className="td">
//                     <input
//                       type="number"
//                       value={row.givenGold}
//                       onChange={(e) =>
//                         handleBalanceInputChange(
//                           index,
//                           "givenGold",
//                           e.target.value
//                         )
//                       }
//                     />
//                   </td>
//                   <td className="td">
//                     <input
//                       type="number"
//                       value={row.touch}
//                       onChange={(e) =>
//                         handleBalanceInputChange(index, "touch", e.target.value)
//                       }
//                     />
//                   </td>
//                   <td className="td"></td>
//                   <td className="td">{row.pure.toFixed(3)}</td>
//                   <td className="td no-print">
//                     <Button onClick={() => handleRemoveBalanceRow(index)}>
//                       <FaTrash />
//                     </Button>
//                   </td>
//                 </tr>
//               ))}
//               <tr>
//                 <td
//                   colSpan={6}
//                   className="no-print"
//                   style={{ textAlign: "right" }}
//                 >
//                   <Button
//                     variant="contained"
//                     color="primary"
//                     onClick={handleBalanceRow}
//                     className="balance-button"
//                   >
//                     + Add Given Gold
//                   </Button>
//                 </td>
//               </tr>
//             </tbody>
//           </table>
//           <Box className="items-section no-print">
//             <div className="add">
//               <h3>Received Details:</h3>
//               <p className="add-icon-wrapper">
//                 <IconButton
//                   size="small"
//                   onClick={handleAddRow}
//                   className="add-circle-icon"
//                 >
//                   <AddCircleOutlineIcon />
//                 </IconButton>
//               </p>
//             </div>

//             <table className="table received-details-table">
//               <thead>
//                 <tr>
//                   <th className="th">S.No</th>
//                   <th className="th">Date</th>
//                   <th className="th">Gold Rate</th>
//                   <th className="th">Gold</th>
//                   <th className="th">Touch</th>
//                   <th className="th">Purity WT</th>
//                   <th className="th">Amount</th>
//                   <th className="th">Hallmark</th>
//                   <th className="th">Action</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {rows.length > 0 ? (
//                   rows.map((row, index) => (
//                     <tr key={index}>
//                       <td className="td">{index + 1}</td>
//                       <td className="td">
//                         <TextField
//                           className="date-field"
//                           size="small"
//                           type="date"
//                           value={row.date}
//                           onChange={(e) =>
//                             handleRowChange(index, "date", e.target.value)
//                           }
//                           InputProps={{ disableUnderline: true }}
//                         />
//                       </td>
//                       <td className="td">
//                         <TextField
//                           size="small"
//                           value={row.goldRate}
//                           onChange={(e) =>
//                             handleRowChange(index, "goldRate", e.target.value)
//                           }
//                           type="number"
//                           InputProps={{ disableUnderline: true }}
//                         />
//                       </td>
//                       <td className="td">
//                         <TextField
//                           size="small"
//                           value={row.givenGold}
//                           onChange={(e) =>
//                             handleRowChange(index, "givenGold", e.target.value)
//                           }
//                           type="number"
//                           InputProps={{ disableUnderline: true }}
//                         />
//                       </td>
//                       <td className="td">
//                         <TextField
//                           size="small"
//                           value={row.touch}
//                           onChange={(e) =>
//                             handleRowChange(index, "touch", e.target.value)
//                           }
//                           type="number"
//                           InputProps={{ disableUnderline: true }}
//                         />
//                       </td>
//                       <td className="td">
//                         <TextField
//                           size="small"
//                           value={row.purityWeight}
//                           InputProps={{
//                             readOnly: true,
//                             disableUnderline: true,
//                           }}
//                         />
//                       </td>
//                       <td className="td">
//                         <TextField
//                           size="small"
//                           value={row.amount}
//                           onChange={(e) =>
//                             handleRowChange(index, "amount", e.target.value)
//                           }
//                           type="number"
//                           InputProps={{ disableUnderline: true }}
//                         />
//                       </td>
//                       <td className="td">
//                         <TextField
//                           size="small"
//                           value={row.hallmark}
//                           onChange={(e) =>
//                             handleRowChange(index, "hallmark", e.target.value)
//                           }
//                           type="number"
//                           InputProps={{ disableUnderline: true }}
//                         />
//                       </td>
//                       <td className="td">
//                         {(!viewMode ||
//                           index >=
//                             (selectedBill?.receivedDetails?.length || 0)) && (
//                           <IconButton onClick={() => handleDeleteRow(index)}>
//                             <MdDeleteForever />
//                           </IconButton>
//                         )}
//                       </td>
//                     </tr>
//                   ))
//                 ) : (
//                   <tr>
//                     <td colSpan={9} className="no-products-message">
//                       No received details added
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </Box>
//         </Box>
//         <div className="flex">
//           <b>Cash Balance:</b>
//           <b>Pure Balance:</b>
//           <b>Hallmark Balance:</b>
//         </div>
//         {/* <Box className="closing-box">
//           <p className="closing-line">
//             <span>Received</span>
//             <span>{pure.toFixed(3)}</span>
//           </p>
//           <p className="closing-line">
//             <span>Closing</span>
//             <span>
//               {(balanceRow.length === 0 ? totalBillAmount : closing).toFixed(3)}
//             </span>
//           </p>
//         </Box> */}
//      <br></br>

//         <Button
//           variant="contained"
//           color="primary"
//           onClick={handleSaveBill}
//           className="save-button no-print"
//         >
//           Save
//         </Button>
//       </Box>

//       <Box className="right-panel no-print">
//         <h3
//           className="heading"
//           style={{ fontSize: "20px", marginBottom: "15px" }}
//         >
//           Available Product Weights
//         </h3>
//         <Table className="table">
//           <TableHead>
//             <TableRow>
//               <TableCell className="th">S.No</TableCell>
//               <TableCell className="th">Product Finish Weight</TableCell>
//             </TableRow>
//           </TableHead>
//           <TableBody>
//             {productWeight.length > 0 ? (
//               productWeight.map((product, index) => (
//                 <TableRow
//                   key={index}
//                   onClick={() => handleProductSelect(index, product.stock_id)}
//                   className="product-weight-row"
//                 >
//                   <TableCell className="td">{index + 1}</TableCell>
//                   <TableCell className="td">{product.value}</TableCell>
//                 </TableRow>
//               ))
//             ) : (
//               <TableRow>
//                 <TableCell className="td no-product-weight-message" colSpan={2}>
//                   No product weight data
//                 </TableCell>
//               </TableRow>
//             )}
//           </TableBody>
//         </Table>
//         <ToastContainer />
//       </Box>
//     </Box>
//   );
// };

// export default Billing;







import React, { useState, useEffect, useRef } from "react";
import {
  Autocomplete,
  TextField,
  Box,
  Button,
  Modal,
  Typography,
  IconButton,
  Tooltip,
  MenuItem,
  Alert,
  Snackbar,
  TableCell,
  TableRow,
  Table,
  TableBody,
  TableHead
} from "@mui/material";
import PrintIcon from "@mui/icons-material/Print";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import AddIcon from "@mui/icons-material/Add";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import "./billing.css";
import { MdDeleteForever } from "react-icons/md";

// import { BACKEND_SERVER_URL } from "../../Config/Config";

const Billing = () => {
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [billItems, setBillItems] = useState([]);
  const [billNo, setBillNo] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [goldRate, setGoldRate] = useState("");
  const [hallmarkCharges, setHallmarkCharges] = useState(0);
  const [rows, setRows] = useState([]);

  const [viewMode, setViewMode] = useState(false);
  const [fetchedBills, setFetchedBills] = useState([]);
  const [selectedBill, setSelectedBill] = useState(null);

  const [openAddItem, setOpenAddItem] = useState(false);
  const [newItem, setNewItem] = useState({
    name: "",
    no: "",
    percentage: "",
    weight: "",
    pure: "",
    touch: "",
  });

  const [customers, setCustomers] = useState([]);
  const [stockData, setStockData] = useState([]);
  const [stockError, setStockError] = useState(null);
  const [availableStock, setAvailableStock] = useState(0);
  const [latestBill, setLatestBill] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const billRef = useRef(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const customersResponse = await fetch(
          `$/api/customers`
        );
        const customersData = await customersResponse.json();
        setCustomers(customersData);

        const stocksResponse = await fetch(
          `$/api/v1/stocks`
        );
        const stocksData = await stocksResponse.json();
        setStockData(stocksData);

        const billsResponse = await fetch(`/api/bills`);
        const billsData = await billsResponse.json();
        const latest = billsData.length > 0 ? billsData[0] : null;
        setLatestBill(latest);
        setBillNo(latest ? `BILL-${parseInt(latest.id) + 1}` : "BILL-1");
      } catch (error) {
        console.error("Error fetching initial data:", error);
        showSnackbar("Failed to load initial data", "error");
      }
    };

    fetchInitialData();
  }, []);

  useEffect(() => {
    if (newItem.percentage) {
      checkStockAvailability();
    }
  }, [newItem.percentage, newItem.name, newItem.no]);

  const fetchBills = async () => {
    try {
      const response = await fetch(`/api/bills`);
      const data = await response.json();
      setFetchedBills(data);
      showSnackbar("Bills fetched successfully", "success");
    } catch (error) {
      console.error("Error fetching bills:", error);
      showSnackbar("Failed to fetch bills", "error");
    }
  };

  const viewBill = (bill) => {
    setViewMode(true);
    setSelectedBill(bill);
    setSelectedCustomer(customers.find((c) => c.id === bill.customerId));
    setGoldRate(bill.goldRate.toString());
    setHallmarkCharges(bill.hallmarkCharges.toString());

    setBillItems(
      bill.items.map((item) => ({
        id: item.id || Date.now().toString(),
        coinValue: item.coinValue,
        quantity: item.quantity,
        percentage: item.percentage,
        touch: item.touch,
        weight: item.weight,
        purity: item.purity,
      }))
    );

    setRows(
      bill.receivedDetails.map((detail) => ({
        date: detail.date
          ? new Date(detail.date).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        goldRate: detail.goldRate.toString(),
        givenGold: detail.givenGold?.toString() || "",
        touch: detail.touch?.toString() || "",
        purityWeight: detail.purityWeight.toString(),
        amount: detail.amount.toString(),
        hallmark: detail.hallmark?.toString() || "",
      }))
    );

    setBillNo(`BILL-${bill.id}`);
  };

  const checkStockAvailability = () => {
    if (!newItem.percentage) return;

    const selectedCoin = stockData.find(
      (item) =>
        item.gram === parseFloat(newItem.name || 0) &&
        item.coinType === newItem.percentage
    );

    if (selectedCoin) {
      setAvailableStock(selectedCoin.quantity);
      if (newItem.no && selectedCoin.quantity < parseInt(newItem.no)) {
        setStockError(`Insufficient stock Available: ${selectedCoin.quantity}`);
      } else {
        setStockError(null);
      }
    } else {
      setAvailableStock(0);
      if (newItem.name) {
        setStockError("No stock available for this combination");
      }
    }
  };

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleAddRow = () => {
    setRows([
      ...rows,
      {
        date: new Date().toISOString().slice(0, 10),
        goldRate: goldRate,
        givenGold: "",
        touch: "",
        purityWeight: "",
        amount: "",
        hallmark: "",
      },
    ]);
  };

  const handleDeleteRow = (index) => {
    const updatedRows = rows.filter((_, i) => i !== index);
    setRows(updatedRows);
  };

  const handleRowChange = (index, field, value) => {
    const updatedRows = [...rows];
    updatedRows[index][field] = value;

    if (field === "givenGold" || field === "touch") {
      const givenGold = parseFloat(updatedRows[index].givenGold) || 0;
      const touch = parseFloat(updatedRows[index].touch) || 0;
      const purityWeight = givenGold * (touch / 100);
      updatedRows[index].purityWeight = purityWeight.toFixed(3);

      if (updatedRows[index].goldRate) {
        const amount = purityWeight * parseFloat(updatedRows[index].goldRate);
        updatedRows[index].amount = amount.toFixed(2);
      }
    } else if (field === "amount") {
      const amount = parseFloat(value) || 0;
      const goldRate = parseFloat(updatedRows[index].goldRate) || 1;
      const purityWeight = amount / goldRate;
      updatedRows[index].purityWeight = purityWeight.toFixed(3);
      updatedRows[index].givenGold = "";
      updatedRows[index].touch = "";
    } else if (field === "goldRate") {
      const goldRate = parseFloat(value) || 0;
      if (updatedRows[index].givenGold && updatedRows[index].touch) {
        const givenGold = parseFloat(updatedRows[index].givenGold) || 0;
        const touch = parseFloat(updatedRows[index].touch) || 0;
        const purityWeight = givenGold * (touch / 100);
        const amount = purityWeight * goldRate;
        updatedRows[index].amount = amount.toFixed(2);
        updatedRows[index].purityWeight = purityWeight.toFixed(3);
      } else if (updatedRows[index].amount) {
        const amount = parseFloat(updatedRows[index].amount) || 0;
        const purityWeight = amount / goldRate;
        updatedRows[index].purityWeight = purityWeight.toFixed(3);
      }
    }

    setRows(updatedRows);
  };

  useEffect(() => {
    if (goldRate) {
      const updatedRows = rows.map((row) => {
        if (row.purityWeight) {
          const amount = parseFloat(row.purityWeight) * parseFloat(goldRate);
          return { ...row, amount: amount.toFixed(2), goldRate: goldRate };
        }
        return { ...row, goldRate: goldRate };
      });
      setRows(updatedRows);
    }
  }, [goldRate]);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setDate(now.toLocaleDateString("en-IN"));
      setTime(
        now.toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 60000);
    return () => clearInterval(timer);
  }, []);

  const handleAddItem = () => {
    setOpenAddItem(true);
  };

  const handleCloseAddItem = () => {
    setOpenAddItem(false);
    setNewItem({
      name: "",
      no: "",
      percentage: "",
      weight: "",
      pure: "",
      touch: "",
    });
    setStockError(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewItem((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const calculateValues = () => {
    const coin = parseFloat(newItem.name) || 0;
    const no = parseFloat(newItem.no) || 0;
    const percentage = parseFloat(newItem.percentage) || 0;

    const weight = coin * no;
    const purityFactor = percentage / 1000;
    const pure = weight * purityFactor;

    setNewItem((prev) => ({
      ...prev,
      weight: weight.toString(),
      pure: pure % 1 === 0 ? pure.toString() : pure.toFixed(3),
      touch: (percentage / 10).toString(),
    }));
  };

  useEffect(() => {
    if (newItem.name && newItem.no && newItem.percentage) {
      calculateValues();
    }
  }, [newItem.name, newItem.no, newItem.percentage]);

  const handleSaveItem = () => {
    if (!newItem.name || !newItem.no || !newItem.percentage) {
      showSnackbar("Please fill all required fields", "error");
      return;
    }

    if (stockError) {
      showSnackbar(stockError, "error");
      return;
    }

    setBillItems((prevItems) => [
      ...prevItems,
      {
        id: Date.now().toString(),
        coinValue: parseFloat(newItem.name),
        quantity: parseInt(newItem.no),
        percentage: newItem.percentage,
        touch: newItem.touch,
        weight: newItem.weight,
        purity: newItem.pure,
      },
    ]);

    handleCloseAddItem();
  };

  const calculateTotals = () => {
    let totalWeight = 0;
    let totalPurity = 0;

    billItems.forEach((item) => {
      totalWeight += parseFloat(item.weight) || 0;
      totalPurity += parseFloat(item.purity) || 0;
    });

    return { totalWeight, totalPurity };
  };

  const { totalWeight, totalPurity } = calculateTotals();

  const calculateReceivedTotals = () => {
    const receivedAmount = rows.reduce(
      (sum, row) => sum + parseFloat(row.amount || 0),
      0
    );
    const receivedHallmark = rows.reduce(
      (sum, row) => sum + parseFloat(row.hallmark || 0),
      0
    );
    const receivedPurity = rows.reduce(
      (sum, row) => sum + parseFloat(row.purityWeight || 0),
      0
    );

    return { receivedAmount, receivedHallmark, receivedPurity };
  };

  const { receivedAmount, receivedHallmark, receivedPurity } =
    calculateReceivedTotals();

  const calculateBalances = () => {
    const billAmount = totalPurity * parseFloat(goldRate || 0);
    const cashBalance = billAmount - receivedAmount;
    const hallmarkBalance = parseFloat(hallmarkCharges || 0) - receivedHallmark;
    const pureBalance = totalPurity - receivedPurity;

    return {
      cashBalance: cashBalance.toFixed(2),
      pureBalance: pureBalance.toFixed(3),
      hallmarkBalance: hallmarkBalance.toFixed(2),
    };
  };

  const { cashBalance, pureBalance, hallmarkBalance } = calculateBalances();

  const handleUpdateBill = async () => {
    if (!selectedBill || !selectedCustomer || !goldRate) {
      showSnackbar("Invalid bill data", "error");
      return;
    }

    try {
      const updatedBill = {
        ...selectedBill,
        receivedDetails: [
          ...selectedBill.receivedDetails,
          ...rows.slice(selectedBill.receivedDetails.length).map((row) => ({
            date: row.date || new Date().toISOString().split("T")[0],
            goldRate: parseFloat(row.goldRate || goldRate),
            givenGold: parseFloat(row.givenGold || 0),
            touch: parseFloat(row.touch || 0),
            purityWeight: parseFloat(row.purityWeight || 0),
            amount: parseFloat(row.amount || 0),
            hallmark: parseFloat(row.hallmark || 0),
          })),
        ],
      };

      const response = await fetch(
        `/receive`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedBill),
        }
      );

      if (!response.ok) throw new Error("Failed to update bill");

      const data = await response.json();
      setSelectedBill(data);
      showSnackbar("Bill updated successfully!", "success");
      fetchBills();
    } catch (error) {
      console.error("Error:", error);
      showSnackbar(error.message || "Failed to update bill", "error");
    }
  };

  const reduceStockForBill = async (items) => {
    try {
      const results = await Promise.allSettled(
        items.map(async (item) => {
          const response = await fetch(
            `$/api/v1/stocks/reduce`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                coinType: item.percentage.toString(),
                gram: item.coinValue.toString(),
                quantity: item.quantity.toString(),
                reason: `Sold in bill (${item.coinValue}g ${item.percentage})`,
              }),
            }
          );

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Failed to reduce stock");
          }
          return response.json();
        })
      );

      const failedReductions = results.filter((r) => r.status === "rejected");
      if (failedReductions.length > 0) {
        const errorMessages = failedReductions
          .map((f) => f.reason.message)
          .join(", ");
        throw new Error(`Some items couldn't be reduced: ${errorMessages}`);
      }

      return results.map((r) => r.value);
    } catch (error) {
      console.error("Stock reduction error:", error);
      throw error;
    }
  };

  const handleSubmitBill = async () => {
    if (!selectedCustomer || !goldRate || billItems.length === 0) {
      showSnackbar("Please fill all required fields", "error");
      return;
    }

    try {
      await reduceStockForBill(billItems);
      const totalWeight = billItems.reduce(
        (sum, item) => sum + parseFloat(item.weight || 0),
        0
      );
      const totalPurity = billItems.reduce(
        (sum, item) => sum + parseFloat(item.purity || 0),
        0
      );
      const totalAmount = rows.reduce(
        (sum, row) => sum + parseFloat(row.amount || 0),
        0
      );

      const billData = {
        customerId: selectedCustomer.id,
        goldRate: parseFloat(goldRate),
        hallmarkCharges: parseFloat(hallmarkCharges || 0),
        totalWeight,
        totalPurity,
        totalAmount,
        items: billItems.map((item) => ({
          coinValue: parseFloat(item.coinValue),
          quantity: parseInt(item.quantity),
          percentage: parseInt(item.percentage),
          touch: parseFloat(item.touch || 0),
          weight: parseFloat(item.weight || 0),
          purity: parseFloat(item.purity || 0),
          amount: parseFloat(item.amount || 0),
        })),
        receivedDetails: rows.map((row) => ({
          date: row.date ? new Date(row.date) : new Date(),
          goldRate: parseFloat(row.goldRate || goldRate),
          givenGold: parseFloat(row.givenGold || 0),
          touch: parseFloat(row.touch || 0),
          purityWeight: parseFloat(row.purityWeight || 0),
          amount: parseFloat(row.amount || 0),
          hallmark: parseFloat(row.hallmark || 0),
        })),
      };

      const response = await fetch(`/api/bills`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(billData),
      });

      if (!response.ok) throw new Error("Failed to create bill");

      const newBill = await response.json();
      setLatestBill(newBill);
      showSnackbar("Bill created successfully!", "success");

      await fetchBills();
      resetForm();
    } catch (error) {
      console.error("Error:", error);
      showSnackbar(error.message || "Failed to create bill", "error");
    }
  };

  const resetForm = () => {
    setBillItems([]);
    setRows([]);
    setSelectedCustomer(null);
    setGoldRate("");
    setHallmarkCharges(0);
    setSelectedBill(null);
    setViewMode(false);

    const newBillNo = latestBill
      ? `BILL-${parseInt(latestBill.id) + 1}`
      : "BILL-1";
    setBillNo(newBillNo);
  };

  const handlePrint = async () => {
    const printButton = document.querySelector(".add-circle-icon");
    let printButtonParent = null;
    let printButtonClone = null;
    if (printButton) {
      printButtonParent = printButton.parentNode;
      printButtonClone = printButton.cloneNode(true);
      printButtonParent.removeChild(printButton);
    }

    const input = billRef.current;
    if (input) {
      const canvas = await html2canvas(input, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a5");

      const imgWidth = 150;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      pdf.save("bill.pdf");
    }

    if (printButtonClone && printButtonParent) {
      printButtonParent.appendChild(printButtonClone);
    }
  };

  return (
    <>
      <div className="fless">
        {(!viewMode || selectedBill) && (
          <Box className="container" ref={billRef}>
            <h1 className="heading">Estimate Only</h1>

            <Box className="billInfo">
              <p>
                <strong>Bill No:</strong> {billNo}
              </p>
              <p className="date-time">
                <strong>Date:</strong> {date} <br />
                <br />
                <strong>Time:</strong> {time}
              </p>
            </Box>
            <div className="autocomplete-container">
              <Box className="autocomplete-box">
                <Autocomplete
                  options={customers}
                  getOptionLabel={(option) => option.name || ""}
                  onChange={(event, newValue) => setSelectedCustomer(newValue)}
                  value={selectedCustomer}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Select Customer"
                      variant="outlined"
                      size="small"
                      required
                      disabled={viewMode && selectedBill}
                    />
                  )}
                  className="smallAutocomplete"
                  disabled={viewMode && selectedBill}
                />
              </Box>

              <Box className="autocomplete-box">
                <Autocomplete
                  getOptionLabel={(option) => option.name || ""}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Select Products"
                      variant="outlined"
                      size="small"
                      required
                      disabled={viewMode && selectedBill}
                    />
                  )}
                  className="smallAutocomplete"
                  disabled={viewMode && selectedBill}
                />
              </Box>
            </div>

            {selectedCustomer && (
              <Box className="customerDetails">
                <h3>Customer Details:</h3>
                <br />
                <p>
                  <strong>Name:</strong> {selectedCustomer?.name || "-"}
                </p>
              </Box>
            )}

            <Box className="itemsSection">
              <div className="bill">
                <h3>Bill Details:</h3>
                <b style={{ marginLeft: "41rem" }}>
                  Gold Rate:
                  <TextField
                    size="small"
                    style={{
                      width: "120px",
                      height: "1rem",
                      bottom: "18px",
                      left: "5px",
                    }}
                    value={goldRate}
                    onChange={(e) => setGoldRate(e.target.value)}
                    type="number"
                    required
                    disabled={viewMode && selectedBill}
                  />
                </b>
              </div>
              <table className="table">
                <thead>
                  <tr>
                    <th className="th">Coin</th>
                    <th className="th">No</th>
                    <th className="th">%</th>
                    <th className="th">Touch</th>
                    <th className="th">Weight</th>
                    <th className="th">Purity</th>
                    <th className="th">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {billItems.map((item, index) => (
                    <tr key={index}>
                      <td className="td">{item.coinValue}</td>
                      <td className="td">{item.quantity}</td>
                      <td className="td">{item.percentage}</td>
                      <td className="td">{item.touch}</td>
                      <td className="td">{item.weight}</td>
                      <td className="td">{item.purity}</td>
                      <td className="td">
                        {goldRate
                          ? (
                              parseFloat(item.purity) * parseFloat(goldRate)
                            ).toFixed(2)
                          : "-"}
                      </td>
                    </tr>
                  ))}
                  <tr>
                    <td className="td">
                      <strong>Total</strong>
                    </td>
                    <td className="td">
                      <strong>
                        {billItems.reduce(
                          (sum, item) => sum + parseInt(item.quantity),
                          0
                        )}
                      </strong>
                    </td>
                    <td className="td"></td>
                    <td className="td"></td>
                    <td className="td">
                      <strong>{totalWeight.toFixed(3)}</strong>
                    </td>
                    <td className="td">
                      <strong>{totalPurity.toFixed(3)}</strong>
                    </td>
                    <td className="td">
                      <strong>
                        {goldRate
                          ? (totalPurity * parseFloat(goldRate)).toFixed(2)
                          : "0.00"}
                      </strong>
                    </td>
                  </tr>

                  <tr>
                    <td className="td" colSpan={6}>
                      <strong>Hallmark or MC Charges</strong>
                    </td>
                    <td className="td">
                      <TextField
                        size="small"
                        style={{ width: "100px" }}
                        value={hallmarkCharges}
                        onChange={(e) => setHallmarkCharges(e.target.value)}
                        type="number"
                        disabled={viewMode && selectedBill}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td className="td" colSpan={6}>
                      <strong>Total Amount</strong>
                    </td>
                    <td className="td">
                      <strong>
                        {(
                          totalPurity * parseFloat(goldRate || 0) +
                          parseFloat(hallmarkCharges || 0)
                        ).toFixed(2)}
                      </strong>
                    </td>
                  </tr>
                </tbody>
              </table>
            </Box>

            <br />

            <Box className="itemsSection">
              <div className="add">
                <h3>Received Details:</h3>
                {(!viewMode || selectedBill) && (
                  <p style={{ marginLeft: "42.4rem" }}>
                    <IconButton
                      size="small"
                      onClick={handleAddRow}
                      className="add-circle-icon"
                    >
                      <AddCircleOutlineIcon />
                    </IconButton>
                  </p>
                )}
              </div>

              <table className="table">
                <thead>
                  <tr>
                    <th className="th">S.No</th>
                    <th className="th">Date</th>
                    <th className="th">Gold Rate</th>
                    <th className="th">Gold</th>
                    <th className="th">Touch</th>
                    <th className="th">Purity WT</th>
                    <th className="th">Amount</th>
                    <th className="th">Hallmark</th>
                    {(!viewMode || selectedBill) && (
                      <th className="th">Action</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, index) => (
                    <tr key={index}>
                      <td className="td">{index + 1}</td>
                      <td className="td">
                        <TextField
                          style={{ right: "17px" }}
                          size="small"
                          type="date"
                          value={row.date}
                          onChange={(e) =>
                            handleRowChange(index, "date", e.target.value)
                          }
                          disabled={
                            viewMode &&
                            index < selectedBill?.receivedDetails?.length
                          }
                        />
                      </td>
                      <td className="td">
                        <TextField
                          size="small"
                          value={row.goldRate}
                          onChange={(e) =>
                            handleRowChange(index, "goldRate", e.target.value)
                          }
                          type="number"
                          disabled={
                            viewMode &&
                            index < selectedBill?.receivedDetails?.length
                          }
                        />
                      </td>
                      <td className="td">
                        <TextField
                          size="small"
                          value={row.givenGold}
                          onChange={(e) =>
                            handleRowChange(index, "givenGold", e.target.value)
                          }
                          type="number"
                          disabled={
                            viewMode &&
                            index < selectedBill?.receivedDetails?.length
                          }
                        />
                      </td>
                      <td className="td">
                        <TextField
                          size="small"
                          value={row.touch}
                          onChange={(e) =>
                            handleRowChange(index, "touch", e.target.value)
                          }
                          type="number"
                          disabled={
                            viewMode &&
                            index < selectedBill?.receivedDetails?.length
                          }
                        />
                      </td>
                      <td className="td">
                        <TextField
                          size="small"
                          value={row.purityWeight}
                          InputProps={{ readOnly: true }}
                        />
                      </td>
                      <td className="td">
                        <TextField
                          size="small"
                          value={row.amount}
                          onChange={(e) =>
                            handleRowChange(index, "amount", e.target.value)
                          }
                          type="number"
                          disabled={
                            viewMode &&
                            index < selectedBill?.receivedDetails?.length
                          }
                        />
                      </td>
                      <td className="td">
                        <TextField
                          size="small"
                          value={row.hallmark}
                          onChange={(e) =>
                            handleRowChange(index, "hallmark", e.target.value)
                          }
                          type="number"
                          disabled={
                            viewMode &&
                            index < selectedBill?.receivedDetails?.length
                          }
                        />
                      </td>
                      {(!viewMode || selectedBill) && (
                        <td className="td">
                          {(!viewMode ||
                            index >= selectedBill?.receivedDetails?.length) && (
                            <IconButton onClick={() => handleDeleteRow(index)}>
                              <MdDeleteForever />
                            </IconButton>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="flex">
                <b>Cash Balance: {cashBalance}</b>
                <b>Pure Balance: {pureBalance}</b>
                <b>Hallmark Balance: {hallmarkBalance}</b>
              </div>
            </Box>
          </Box>
        )}

        <Box className="right-panel no-print">
          <h3
            className="heading"
            style={{ fontSize: "20px", marginBottom: "15px" }}
          >
            Available Product Weights
          </h3>
          <Table className="table">
            <TableHead>
              <TableRow>
                <TableCell className="jk">S.No</TableCell>
                <TableCell className="jk">Product Finish Weight</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow
                //  onClick={() => handleProductSelect(index, product.stock_id)}
                className="product-weight-row"
              >
                <TableCell className="td"></TableCell>
                <TableCell className="td"></TableCell>
              </TableRow>

              <TableRow>
                <TableCell className="td no-product-weight-message" colSpan={2}>
                  No product weight data
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Box>
      </div>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default Billing;


