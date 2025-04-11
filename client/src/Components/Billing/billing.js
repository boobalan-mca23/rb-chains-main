
import React, { useState, useEffect, useRef } from "react";
import { Autocomplete, TextField, Box, Button,Table,TableHead,TableCell,TableRow,TableBody } from "@mui/material";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import axios from "axios";
import { toast } from "react-toastify";

const Billing = () => {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [billItems, setBillItems] = useState([]);
  const [billNo, setBillNo] = useState("001");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [isPrinting, setIsPrinting] = useState(false);
  const billRef = useRef();
  const [products, setProducts] = useState([]);
  const [productWeight,setProductWeight]=useState([])

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BACKEND_SERVER_URL}/api/customer/customerinfo`
        );
        console.log("Fetched Customers:", response.data);
        setCustomers(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        toast.error("Error fetching customers!", {
          containerId: "custom-toast",
        });
        console.error("Error:", error);
      }
    };

    const fetchJewelItem = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BACKEND_SERVER_URL}/api/jewelType/getJewelType`
        );
        console.log("Fetched JewelItems:", response.data.allJewel);

        setProducts(Array.isArray(response.data.allJewel) ? response.data.allJewel : []);
      } catch (error) {
        toast.error("Error fetching customers!", {
          containerId: "custom-toast",
        });
        console.error("Error:", error);
      }
    };

    fetchCustomers();
    fetchJewelItem();
  }, []);

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

  const handleProductSelect = (event, newValue) => {
    if (newValue && !billItems.some((item) => item.id === newValue.id)) {
      setBillItems((prevItems) => [...prevItems, newValue]);
    }
  };

  const handlePrint = () => {
    console.log('selected Customer', selectedCustomer)
    setIsPrinting(true);
    setTimeout(() => {
      html2canvas(billRef.current).then((canvas) => {
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF();
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
        pdf.save(`Bill_${billNo}.pdf`);

        setIsPrinting(false);
      });
    }, 0);
  };

  const calculateTotal = () => {
    return billItems.reduce((total, item) => total + item.pure, 0).toFixed(3);
  };

  const calculateLess = (total) => {
    const lessValue = (total * 0.9992).toFixed(3);
    return lessValue;
  };

  const calculateClosing = (total, less) => {
    return (total - less).toFixed(3);
  };
  useEffect(() => {
    if (selectedCustomer && selectedProduct) {
      console.log('selectedProductId',selectedProduct.master_jewel_id)
       const fetchWeight=async()=>{
          try{
             const productsWeight=await axios.get( `${process.env.REACT_APP_BACKEND_SERVER_URL}/api/jewelType/getProductWeight/${selectedProduct.master_jewel_id}`)
             console.log('responseWeight',productsWeight.data.productsWeight)
             setProductWeight(productsWeight.data.productsWeight)
             if(productsWeight.status===404){
               setProductWeight(productsWeight.data.productsWeight)
             }
          }catch(err){
            if(err.status===500){
              alert("server Error")
            }else{
              toast.error('No Products')
            }
          }
       }
       fetchWeight()
    }
    
  }, [selectedCustomer, selectedProduct]);
  

  return (
    <Box sx={styles.wrapper}>
    <Box sx={styles.leftPanel} ref={billRef}>
         <h1 style={styles.heading}>Estimate Only</h1>
  
        <Box sx={styles.billInfo}>
          <p>
            <strong>Bill No:</strong> {billNo}
          </p>
          <p>
            <strong>Date:</strong> {date} <br />
            <br></br>
            <strong>Time:</strong> {time}
          </p>
        </Box>
  
        <Box
          sx={styles.searchSection}
          style={{ display: isPrinting ? "none" : "flex" }}
        >
          <Autocomplete
            options={customers}
            getOptionLabel={(option) => option.customer_name || ""}
            
            onChange={(event, newValue) => setSelectedCustomer(newValue)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Select Customer"
                variant="outlined"
                size="small"
              />
            )}
            sx={styles.smallAutocomplete}
          />
  
          <Autocomplete
            options={products}
            getOptionLabel={(option) => option.jewel_name || ""}
            onChange={(event,newValue)=>setSelectedProduct(newValue)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Search Product Name"
                variant="outlined"
                size="small"
              />
            )}
            sx={styles.smallAutocomplete}
          />
  
          {/* <Autocomplete
            options={products}
            getOptionLabel={(option) => option.jewel_name || ""}
            onChange={handleProductSelect}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Search Product We"
                variant="outlined"
                size="small"
              />
            )}
            sx={styles.smallAutocomplete}
          /> */}
        </Box>
  
        {selectedCustomer && (
          <Box sx={styles.customerDetails}>
            <h3>Customer Details:</h3>
            <p>
              <strong>Name:</strong> {selectedCustomer.customer_name}
            </p>
            {selectedCustomer.address && (
              <p>
                <strong>Address:</strong> {selectedCustomer.address}
              </p>
            )}
            {selectedCustomer.phone_number && (
              <p>
                <strong>Phone:</strong> {selectedCustomer.phone_number}
              </p>
            )}
            {selectedCustomer.customer_shop_name && (
              <p>
                <strong>Shop Name:</strong> {selectedCustomer.customer_shop_name}
              </p>
            )}
          </Box>
        )}
  
        <Box sx={styles.itemsSection}>
          <h3>Bill Details:</h3>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Description</th>
                <th style={styles.th}>Touch</th>
                <th style={styles.th}>Weight</th>
                <th style={styles.th}>Pure</th>
              </tr>
            </thead>
            <tbody>
              {billItems.length > 0 ? (
                billItems.map((item, index) => (
                  <tr key={index}>
                    <td style={styles.td}>{item.name}</td>
                    <td style={styles.td}>{item.touch}</td>
                    <td style={styles.td}>{item.weight}</td>
                    <td style={styles.td}>{item.pure}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="4"
                    style={{ textAlign: "center", padding: "10px" }}
                  >
                    No products selected
                  </td>
                </tr>
              )}
              <tr>
                <td colSpan="3" style={styles.td}>
                  <strong>Total</strong>
                </td>
                <td style={styles.td}>{calculateTotal()}</td>
              </tr>
              <tr>
                <td colSpan="3" style={styles.td}>
                  <strong>Less: {calculateTotal()} X 99.92%</strong>
                </td>
                <td style={styles.td}>{calculateLess(calculateTotal())}</td>
              </tr>
              <tr>
                <td colSpan="3" style={styles.td}>
                  <strong>Less: {calculateTotal()} X 99.92%</strong>
                </td>
                <td style={styles.td}>{calculateLess(calculateTotal())}</td>
              </tr>
              <tr>
                <td colSpan="3" style={styles.td}>
                  <strong>Closing</strong>
                </td>
                <td style={styles.td}>
                  {calculateClosing(
                    calculateTotal(),
                    calculateLess(calculateTotal())
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </Box>
  
        <Button
          variant="contained"
          color="primary"
          onClick={handlePrint}
          sx={styles.printButton}
          style={{ display: isPrinting ? "none" : "block" }}
        >
          Print Bill
        </Button>
       </Box>
  
    <Box sx={styles.rightPanel}>
      <Table sx={styles.table}>
        <TableHead>
          <TableRow>
            <TableCell sx={styles.th}>S.No</TableCell>
            <TableCell sx={styles.th}>Product Finish Weight</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {productWeight.length > 0 ? (
            productWeight.map((product, index) => (
              <TableRow key={index}>
                <TableCell sx={styles.td}>{index + 1}</TableCell>
                <TableCell sx={styles.td}>{product.value}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell sx={styles.td} colSpan={2}>
                No product weight data
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Box>
  </Box>
  
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
  printButton: {
    marginTop: "20px",
    display: "block",
    marginLeft: "auto",
    marginRight: "auto",
  },
};


export default Billing;




