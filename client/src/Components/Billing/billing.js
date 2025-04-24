
import React, { useState, useEffect, useRef } from "react";
import { Autocomplete, TextField, Box, Button, Table, TableHead, TableCell, TableRow, TableBody} from "@mui/material";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import axios from "axios";
import { toast } from "react-toastify";
import { FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const Billing = () => {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [billItems, setBillItems] = useState([]);
  
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [isPrinting, setIsPrinting] = useState(false);
  const billRef = useRef();
  const [products, setProducts] = useState([]);
  const [productWeight, setProductWeight] = useState([])
  const [totalPrice, setTotalPrice] = useState(0)
  const [balanceRow, setBalanceRow] = useState([])
  const [closing,setClosing]=useState(0)
 const navigate=useNavigate()
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BACKEND_SERVER_URL}/api/customer/getCustomerValueWithPercentage`
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

  useEffect(() => {

    setTotalPrice(calculateTotal(billItems))

  }, [billItems])
  useEffect(
    ()=>{

    if(balanceRow.length===0){
  setClosing(totalPrice)
    }else{
      setClosing(totalPrice-calculateClosing(balanceRow))
    }
     
  },[balanceRow] 

)


  const handleProductSelect = (itemIndex,stockId) => {
    const tempProducts = [...productWeight]
    const tempSelectProduct = tempProducts.filter((item, index) => itemIndex === index)
    console.log('masterjewelid', selectedProduct.master_jewel_id)
    const customerData = customers.filter((item, index) => item.customer_id === selectedCustomer.customer_id)
    const filterMasterItem = customerData[0].MasterJewelTypeCustomerValue.filter((item, index) => item.masterJewel_id === selectedProduct.master_jewel_id)
    if (filterMasterItem.length === 0) {
      alert('Percentage is Required')
    } else {
      const billObj = {
        productName: tempSelectProduct[0].item_name,
        productTouch: tempSelectProduct[0].touchValue,
        productWeight: tempSelectProduct[0].value,
        productPure: 0,
        stockId:stockId
      }

      billObj.productPure = ((billObj.productTouch + filterMasterItem[0].value) * billObj.productWeight) / 100
      console.log('pure', billObj.productPure)
      const tempBill = [...billItems]
      tempBill.push(billObj)
      setBillItems(tempBill)
      tempProducts.splice(itemIndex, 1)
      setProductWeight(tempProducts)

    }


  };

  const handleSaveBill = async() => {
    // validation for bill
    if(!selectedCustomer){
      alert('Customer Name is Required')
    }
    if(!selectedProduct){
        alert('Jewel Name is Required')
    }
    
    else{
       if(selectedCustomer){

        const payLoad = {
          "customer_id": selectedCustomer.customer_id,
          "order_status": "completed",
          "totalPrice": totalPrice,
          "orderItems":billItems,
          "balance":balanceRow,
          "closingbalance":balanceRow.length===0? totalPrice:closing
          
        }
         console.log('payload', payLoad)

        try{
            const response= await axios.post(`${process.env.REACT_APP_BACKEND_SERVER_URL}/api/bill/saveBill`,payLoad);
            if(response.status===201){
              console.log(response.data.data.id)
               navigate(`/billing/${response.data.data.id}`)
            }
          }catch(err){
               alert(err.message)
          }
         
          
       }else{
        alert('Products is Required')
       }
    
    } 
    
   
  }

  const calculateTotal = (billItems) => {
    return billItems.reduce((acc, currValue) => {
      return acc + currValue.productPure
    }, 0)
  };

  const calculateLess = (total) => {
    const lessValue = (total * 0.9992).toFixed(3);
    return lessValue;
  };

  const calculateClosing = (balanceRow) => {
    return balanceRow.reduce((acc, currValue) => {
      
      return acc + currValue.pure
    }, 0)
  };
  useEffect(() => {
    if (selectedCustomer && selectedProduct) {
      console.log('selectedProductId', selectedProduct.master_jewel_id)
      const fetchWeight = async () => {
        try {
          const productsWeight = await axios.get(`${process.env.REACT_APP_BACKEND_SERVER_URL}/api/jewelType/getProductWeight/${selectedProduct.master_jewel_id}`)

          setProductWeight(productsWeight.data.productsWeight)
          console.log('productFinish',productsWeight.data.productsWeight)

        } catch (err) {
          if (err.status === 400) {
            setProductWeight([])
          }
          if (err.status === 500) {
            alert("server Error")
          } else {
            toast.error('No Products')
          }
        }
      }
      fetchWeight()
    }

  }, [selectedCustomer, selectedProduct]);
  const handleBalanceRow = () => {
    if(selectedCustomer){
      const tempRow = [...balanceRow, { 'customer_id':selectedCustomer.customer_id,'givenGold': 0, 'touch': 0, 'pure': 0 }]
      setBalanceRow(tempRow)
    }
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
    <Box sx={styles.wrapper}>
      <Box sx={styles.leftPanel} ref={billRef}>
        <h1 style={styles.heading}>Estimate Only</h1>

        {/* <Box sx={styles.billInfo}>
         
          <p>
            <strong>Date:</strong> {date} <br />
            <br></br>
            <strong>Time:</strong> {time}
          </p>
        </Box> */}

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
            onChange={(event, newValue) => setSelectedProduct(newValue)}
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
                    <td style={styles.td}>{item.productName}</td>
                    <td style={styles.td}>{item.productTouch}</td>
                    <td style={styles.td}>{item.productWeight}</td>
                    <td style={styles.td}>{item.productPure}</td>
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
                <td style={styles.td}>{totalPrice}</td>
              </tr>
              <tr>
                <td></td>
                <td></td>
                <td></td>
                <td>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleBalanceRow}
                    sx={styles.balanceButton}
                    style={{ display: isPrinting ? "none" : "block" }}
                  >
                    +
                  </Button></td>

              </tr>
            </tbody>
          </table>
          <h3>Recevied Details:</h3>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Given Gold</TableCell>
                <TableCell>Touch</TableCell>
                <TableCell>Weight</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
           {balanceRow.map((row, index) => (
                <TableRow key={index}>
                  <TableCell >
                    <input                     
                      type="number"                      
                      value={row.givenGold}
                      onChange={(e) =>
                        handleBalanceInputChange(index, "givenGold", e.target.value)
                      }
                      style={styles.input}
                    />
                  </TableCell>
                  <TableCell>
                    <input
                      type="number"
                      placeholder="Touch"
                      value={row.touch}
                      onChange={(e) =>
                        handleBalanceInputChange(index, "touch", e.target.value)
                      }
                      style={styles.input}
                    />
                  </TableCell>
                  <TableCell>
                    <input
                      type="number"
                      placeholder="Weight"
                      value={(row.pure).toFixed(3)}
                      style={styles.input}
                    />
                  </TableCell>
                  <TableCell>
                    <Button style={styles.delButton} onClick={(e)=>{handleRemoveBalanceRow(index)}}><FaTrash></FaTrash></Button>
                  </TableCell>
                  
                </TableRow>
              ))}
              <TableRow>
                <TableCell >Closing</TableCell>
                <TableCell ></TableCell>
                <TableCell ></TableCell>
                {/* <TableCell >{(closing).toFixed(2)}</TableCell> */}
                <TableCell>{(balanceRow.length === 0 ? totalPrice : closing).toFixed(2)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Box>

        <Button
          variant="contained"
          color="primary"
          onClick={handleSaveBill}
          sx={styles.saveButton}
          style={{ display: isPrinting ? "none" : "block" }}
        >
          Save
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
                <TableRow key={index} onClick={() => { handleProductSelect(index,product.stock_id) }} style={{ cursor: 'pointer' }}>
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


export default Billing;




