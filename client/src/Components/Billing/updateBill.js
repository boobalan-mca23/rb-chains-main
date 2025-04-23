
import React, { useState, useEffect, useRef } from "react";
import { Autocomplete, TextField, Box, Button, Table, TableHead, TableCell, TableRow, TableBody} from "@mui/material";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import axios from "axios";
import { toast } from "react-toastify";
import { FaTrash } from "react-icons/fa";
import { useParams } from "react-router-dom"




const UpdateBill = () => {
  const [customers, setCustomers] = useState([]);
  const [billItems, setBillItems] = useState([]);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [isPrinting, setIsPrinting] = useState(false);
  const billRef = useRef();
  const [totalPrice, setTotalPrice] = useState(0)
  const [balanceRow, setBalanceRow] = useState([])
  const [closing,setClosing]=useState(0)
  const [billNo,setBillNo]=useState(null)
  const {id}=useParams()
  
    useEffect(()=>{
        const fetchBill=async()=>{
            try{
              const response=await axios.get(`${process.env.REACT_APP_BACKEND_SERVER_URL}/api/bill/getbill/${id}`)
              console.log('updatePageee',response)
              setBillNo(id)
            }catch(err){
              alert(err.message)
            }
        }
        fetchBill()
    },[])

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

  useEffect(() => {

    setTotalPrice(calculateTotal(billItems))

  }, [billItems])
  useEffect(()=>{
    setClosing(totalPrice-calculateClosing(balanceRow))
     
  },[balanceRow])

  



  const calculateTotal = (billItems) => {
    return billItems.reduce((acc, currValue) => {
      return acc + currValue.productPure
    }, 0)
  };

  

  const calculateClosing = (balanceRow) => {
    return balanceRow.reduce((acc, currValue) => {
      
      return acc + currValue.pure
    }, 0)
  };
 
  const handleBalanceRow = () => {
   
  }
  const handleBalanceInputChange = (index, field, value) => {
    const updatedRows = [...balanceRow];
    updatedRows[index][field] = value;

    if(field==="touch"){
     updatedRows[index]['pure']=updatedRows[index]['givenGold'] *  updatedRows[index]['touch']/100;
    }

    setBalanceRow(updatedRows);
  };
  const handleRemoveBalanceRow=(index)=>{
   
    const tempBalRow=[...balanceRow]
    tempBalRow.splice(index,1)
    setBalanceRow(tempBalRow)
  }
  

  return (
    <>
     updatePage
    </>
    // <Box sx={styles.wrapper}>
    //   <Box sx={styles.leftPanel} ref={billRef}>
    //     <h1 style={styles.heading}>Estimate Only</h1>

    //     <Box sx={styles.billInfo}>
            //  <p><strong>{id}</strong></p>
    //       <p>
    //         <strong>Date:</strong> {date} <br />
    //         <br></br>
    //         <strong>Time:</strong> {time}
    //       </p>
    //     </Box>

    //     <Box
    //       sx={styles.searchSection}
    //       style={{ display: isPrinting ? "none" : "flex" }}
    //     >
          

         
        
    //     </Box>

    //     {customers && (
    //       <Box sx={styles.customerDetails}>
    //         <h3>Customer Details:</h3>
            
    //       </Box>
    //     )}

    //     <Box sx={styles.itemsSection}>
    //       <h3>Bill Details:</h3>
    //       <table style={styles.table}>
    //         <thead>
    //           <tr>
    //             <th style={styles.th}>Description</th>
    //             <th style={styles.th}>Touch</th>
    //             <th style={styles.th}>Weight</th>
    //             <th style={styles.th}>Pure</th>
    //           </tr>
    //         </thead>
    //         <tbody>
    //           {billItems.length > 0 ? (
    //             billItems.map((item, index) => (
    //               <tr key={index}>
    //                 <td style={styles.td}>{item.productName}</td>
    //                 <td style={styles.td}>{item.productTouch}</td>
    //                 <td style={styles.td}>{item.productWeight}</td>
    //                 <td style={styles.td}>{item.productPure}</td>
    //               </tr>
    //             ))
    //           ) : (
    //             <tr>
    //               <td
    //                 colSpan="4"
    //                 style={{ textAlign: "center", padding: "10px" }}
    //               >
    //                 No products selected
    //               </td>
    //             </tr>
    //           )}
    //           <tr>
    //             <td colSpan="3" style={styles.td}>
    //               <strong>Total</strong>
    //             </td>
    //             <td style={styles.td}>{totalPrice}</td>
    //           </tr>
    //           <tr>
    //             <td></td>
    //             <td></td>
    //             <td></td>
    //             <td>
    //               <Button
    //                 variant="contained"
    //                 color="primary"
    //                 onClick={handleBalanceRow}
    //                 sx={styles.balanceButton}
    //                 style={{ display: isPrinting ? "none" : "block" }}
    //               >
    //                 +
    //               </Button></td>

    //           </tr>
    //         </tbody>
    //       </table>
    //       <h3>Recevied Details:</h3>
    //       <Table>
    //         <TableHead>
    //           <TableRow>
    //             <TableCell>Given Gold</TableCell>
    //             <TableCell>Touch</TableCell>
    //             <TableCell>Weight</TableCell>
    //           </TableRow>
    //         </TableHead>
    //         <TableBody>
    //        {balanceRow.map((row, index) => (
    //             <TableRow key={index}>
    //               <TableCell style={styles.td}>
    //                 <input
                     
    //                   type="number"
                      
    //                   value={row.givenGold}
    //                   onChange={(e) =>
    //                     handleBalanceInputChange(index, "givenGold", e.target.value)
    //                   }
    //                   style={styles.input}
    //                 />
    //               </TableCell>
    //               <TableCell style={styles.td}>
    //                 <input
    //                   type="number"
    //                   placeholder="Touch"
    //                   value={row.touch}
    //                   onChange={(e) =>
    //                     handleBalanceInputChange(index, "touch", e.target.value)
    //                   }
    //                   style={styles.input}
    //                 />
    //               </TableCell>
    //               <TableCell style={styles.td}>
    //                 <input
    //                   type="number"
    //                   placeholder="Weight"
    //                   value={(row.pure).toFixed(3)}
    //                   style={styles.input}
    //                 />
    //               </TableCell>
    //               <TableCell>
    //                 <Button style={styles.delButton} onClick={(e)=>{handleRemoveBalanceRow(index)}}><FaTrash></FaTrash></Button>
    //               </TableCell>
                  
    //             </TableRow>
    //           ))}
    //           <TableRow>
    //             <TableCell >Closing</TableCell>
    //             <TableCell ></TableCell>
    //             <TableCell ></TableCell>
    //             <TableCell >{(closing).toFixed(2)}</TableCell>
    //           </TableRow>
    //         </TableBody>
    //       </Table>
    //     </Box>

    //     <Button
    //       variant="contained"
    //       color="primary"
        
    //       sx={styles.saveButton}
    //       style={{ display: isPrinting ? "none" : "block" }}
    //     >
    //       Save
    //     </Button>
    //   </Box>

    
    // </Box>

  );
};

const styles = {
  wrapper: {
    display: "flex",
    gap: "20px",
    alignItems: "flex-start",
    padding: "20px",
  },
  leftPanel: {
    width: "60%",
    padding: "20px",
    border: "1px solid #ccc",
    borderRadius: "10px",
    backgroundColor: "#f9f9f9",
    fontFamily: "Arial, sans-serif",
  },
  rightPanel: {
    width: "40%",
    padding: "20px",
    border: "1px solid #ccc",
    borderRadius: "10px",
    backgroundColor: "#fff",
    fontFamily: "Arial, sans-serif",
  },
  heading: { textAlign: "center", color: "black" },
  billInfo: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "20px",
  },
  searchSection: { display: "flex", gap: "10px", marginBottom: "20px" },
  smallAutocomplete: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: "5px",
  },
  customerDetails: {
    marginBottom: "20px",
    padding: "10px",
    border: "1px solid #ddd",
    borderRadius: "5px",
    backgroundColor: "#fff",
  },
  itemsSection: { marginTop: "20px" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: {
    border: "1px solid #ddd",
    padding: "10px",
    backgroundColor: "#f2f2f2",
    textAlign: "left",
    fontWeight: "bold",
  },
  td: {
    border: "1px solid #ddd",
    padding: "10px",
    textAlign: "left",
  },
  saveButton: {
    marginTop: "20px",
    display: "block",
    marginLeft: "auto",
    marginRight: "auto",
  },
  balanceButton: {
    margin: "10px",
    display: "block",
    marginLeft: "auto",
    marginRight: "auto",
    fontSize: "18 px"
  },
  input: {
    width: "100%",
    padding: "8px 12px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    fontSize: "14px",
    fontFamily: "inherit",
    backgroundColor: "#fff",
    boxSizing: "border-box",
    outline: "none",
  },
  delButton:{
    margin: "10px",
    display: "block",
    marginLeft: "auto",
    marginRight: "auto",
    fontSize: "20px"
  }
  
};


export default UpdateBill;




