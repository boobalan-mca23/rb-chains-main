import React, { useState, useEffect, useRef } from "react";
import { Box, Button, Table, TableHead, TableCell, TableRow, TableBody } from "@mui/material";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaTrash } from "react-icons/fa";
import { useParams } from "react-router-dom"
import { useNavigate } from "react-router-dom";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import PrintIcon from "@mui/icons-material/Print";
import './updateBill.css'


const UpdateBill = () => {
  const [customers, setCustomers] = useState([]);
  const [billItems, setBillItems] = useState([]);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [isPrinting, setIsPrinting] = useState(false);
  const billRef = useRef();
  const [totalPrice, setTotalPrice] = useState(0)
  const [balanceRow, setBalanceRow] = useState([])
  const [totalBillAmount,setTotalBillAmount]=useState(0)
  const [customerClosing,setCustomerClosing]=useState(0)
  const [closing, setClosing] = useState(0)
  const [billNo, setBillNo] = useState(null)
  const { id } = useParams()

  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productWeight, setProductWeight] = useState([])
  const [products, setProducts] = useState([]);
  const [pure, setPure] = useState(0)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchBill = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_SERVER_URL}/api/bill/getbill/${id}`);
        console.log('updatePageee', response);

        const billData = response.data[0]; // assuming response.data is an array with a single object

        setBillNo(id);

        // Set customer info
        setSelectedCustomer(billData.CustomerInfo);

        // Set order items
        const formattedItems = billData.OrderItems.map(item => ({
          productName: item.itemName,
          productTouch: item.touchValue,
          productWeight: item.productWeight,
          productPure: item.final_price,
          stockId: item.stock_id
        }));
        setBillItems(formattedItems);
        setCustomerClosing(billData.oldBalance)

        // Set balance rows if available
        if (billData.Balance && billData.Balance.length > 0) {
          setBalanceRow(billData.Balance);
          setClosing(billData.Balance[billData.Balance.length - 1].
            remaining_gold_balance
          )
        }
        else {
          setClosing(billData.total_price)
        }

      } catch (err) {
        alert(err.message);
      }
    };

    fetchBill();
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

    if(billItems.length>=1){
      setTotalBillAmount(Number(calculateTotal(billItems))+Number(customerClosing))
    }else{
     setTotalBillAmount(0)
    }

  }, [billItems])


  useEffect(() => {
    const receivedGold = calculateClosing(balanceRow);
    const updatedClosing = totalBillAmount - receivedGold;
    setClosing(updatedClosing);
    setPure(calculateClosing(balanceRow))
  }, [balanceRow]);




  const calculateTotal = (billItems) => {
    return billItems.reduce((acc, currValue) => {
      return acc + currValue.productPure
    }, 0)
  };

  const calculateClosing = (balanceRow) => {
    return balanceRow.reduce((acc, currValue) => {
      return acc + currValue.gold_pure
    }, 0)
  };

  const handleBalanceRow = () => {
    const tempRow = [...balanceRow, { 'balance_id': 0, 'customer_id': selectedCustomer.customer_id, 'gold_weight': 0, 'gold_touch': 0, 'gold_pure': 0 }]
    setBalanceRow(tempRow)

  }
  const handleBalanceInputChange = (index, field, value) => {
    const updatedRows = [...balanceRow];
    updatedRows[index][field] = value;

    if (field === "gold_touch" || field === "gold_weight") {
      updatedRows[index]['gold_pure'] = updatedRows[index]['gold_weight'] * updatedRows[index]['gold_touch'] / 100;
    }

    setBalanceRow(updatedRows);
  };
  const handleRemoveBalanceRow = (index) => {
    if (window.confirm("Are you sure you want to delete this balance row?")) {
      const tempBalRow = [...balanceRow];
      tempBalRow.splice(index, 1);
      setBalanceRow(tempBalRow);
    }
  };


  const handleProductSelect = (itemIndex, stockId) => {
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
        stockId: stockId
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

  const handleUpdateBill = async () => {
    // validation for bill
    if (balanceRow.length === 0) {
      alert('Give Some New Balance Entry')
    } else {
      const tempBalRow = [...balanceRow]
      tempBalRow.push({ 'closing': (closing).toFixed(2) })
      console.log('balanceRow', tempBalRow)
      try {
        const response = await axios.put(`${process.env.REACT_APP_BACKEND_SERVER_URL}/api/bill/updateBill/${billNo}`, tempBalRow)
        if (response.status === 200) {
          toast.success(response.data.message, { autoClose: 2000 });

        }

      } catch (err) {
        console.log(err)
      }
    }
  }

  const handleDownloadPdf = () => {
    setIsPrinting(true);

    setTimeout(() => {
      const input = billRef.current;

      if (!input) return;

      html2canvas(input, { scale: 2 }).then((canvas) => {
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a6");
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, 150);

        const blob = pdf.output("blob");
        const blobUrl = URL.createObjectURL(blob);

        window.open(blobUrl, "_blank"); //  opens PDF in new tab
        setIsPrinting(false);
      });
    }, 300);
  };

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'end' }} >
        <div className="button-container print-hide">
          <Button
            variant="contained"
            color="primary"
            onClick={handleDownloadPdf}
            className="no-print"
          >
            Download as Pdf
          </Button>
          <Button className="print-button no-print" onClick={() => window.print()}>
            <PrintIcon />
          </Button>
        </div>


      </div>

      <Box sx={styles.wrapper} className="updatebillprint">
        <Box sx={styles.leftPanel} ref={billRef}>
          <h1 style={styles.heading}>Estimate Only</h1>
          <Box sx={styles.billHeader}>
            <Box sx={styles.billNumber}>
              <p><strong>Bill No: {id}</strong></p>
            </Box>
            <Box sx={styles.billInfo}>
              <p>
                <strong>Date:</strong> {date}<br /> <br />
                <strong>Time:</strong> {time}
              </p>
            </Box>
          </Box>
          {selectedCustomer && (
            <Box sx={styles.customerDetails}>
              {!isPrinting && (<h3 className="no-print">Customer Details:</h3>)}
              <p><strong>Name:</strong> {selectedCustomer.customer_name}</p>
              {/* <p><strong>Phone:</strong> {selectedCustomer.phone_number}</p>
              <p><strong>Address:</strong> {selectedCustomer.address}</p>
              <p><strong>Shop Name:</strong> {selectedCustomer.customer_shop_name}</p> */}
            </Box>
          )}
          <Box sx={styles.itemsSection}>
            <h3 className="no-print">Order Items:</h3>
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
                  <td style={styles.td}>{(totalPrice).toFixed(3)}</td>
                </tr>
                <tr>
                <td colSpan="3" style={styles.td}>
                  <strong>Old Balance</strong>
                </td>
                <td style={styles.td}>{customerClosing}</td>
                
              </tr>
              <tr>
                <td colSpan="3" style={styles.td}>
                  <strong>Total Amount</strong>
                </td>
                <td style={styles.td}>{(totalBillAmount).toFixed(3)}</td>
                
              </tr>
                <tr>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td>
                 {!isPrinting && (
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={handleBalanceRow}
                        sx={styles.balanceButton}
                        className="no-print"
                      >
                        +
                      </Button>
                    )}

                  </td>

                </tr>
              </tbody>
            </table>
              <h3 className="no-print">Recevied Details:</h3>
            <Table style={{marginBottom:"20px"}} className="no-print">
              <TableHead>
                <TableRow>
                  <TableCell> <strong>Given Gold </strong></TableCell>
                  <TableCell><strong> Touch</strong></TableCell>
                  <TableCell><strong>Weight </strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {balanceRow.map((row, index) => (
                  <TableRow key={index}>

                    <TableCell>
                      {isPrinting ? (
                        <span>{row.gold_weight}</span>
                      ) : (
                        <input
                          type="number"
                          value={row.gold_weight}
                          onChange={(e) =>
                            handleBalanceInputChange(index, "gold_weight", e.target.value)
                          }
                          style={styles.input}
                        />
                      )}
                    </TableCell>

                    <TableCell>
                      {isPrinting ? (
                        <span>{row.gold_touch}</span>
                      ) : (
                        <input
                          type="number"
                          placeholder="Touch"
                          value={row.gold_touch}
                          onChange={(e) =>
                            handleBalanceInputChange(index, "gold_touch", e.target.value)
                          }
                          style={styles.input}
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      {isPrinting ? (
                        <span>{(row.gold_pure).toFixed(3)}</span>
                      ) : (
                        <input
                        
                          type="number"
                          placeholder="Weight"
                          value={(row.gold_pure).toFixed(3)}
                          style={styles.input}
                        />
                      )}
                    </TableCell>

                    <TableCell>
                      {!isPrinting && (
                        <Button style={styles.delButton} onClick={(e) => { handleRemoveBalanceRow(index) }}className="no-print"><FaTrash></FaTrash></Button>
                      )}
                    </TableCell>

                  </TableRow>
                ))}
                {/* <TableRow>
                  <TableCell colSpan={3} >Closing</TableCell>
               

                  <TableCell>{Number(balanceRow.length === 0 ? totalBillAmount : closing).toFixed(3)}</TableCell>

                </TableRow> */}
              </TableBody>
            </Table>
            <ToastContainer />

             <Box style={styles.closingBox}>
            
                      <p style={styles.closingLine} >
                        <span>Recevied</span> 
                        <span >{(pure).toFixed(3)}</span>
                        
                      </p>
            
                      <p style={styles.closingLine}>
                        <span>closing</span> 
                        <span >{(balanceRow.length === 0 ? totalBillAmount : closing).toFixed(2)}</span>
                        
                      </p>
                    </Box>
          </Box>


          {!isPrinting && (
            <>
              <Button
                variant="contained"
                color="primary"
                onClick={handleUpdateBill}
                sx={styles.saveButton}
                className="no-print"
              >
                Save
              </Button>


            </>
          )}
        </Box>
      </Box>
    </>

  );
};


const styles = {
  wrapper: {
    display: "flex",
    gap: "20px",
    justifyContent: 'center',
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
  heading: { textAlign: "center", color: "black",fontSize: "20px" },

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
  delButton: {
    margin: "10px",
    display: "block",
    marginLeft: "auto",
    marginRight: "auto",
    fontSize: "20px"
  },
  billHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop:"10px"
  },
  billNumber: {
    flex: 1
  },
  billInfo: {
    flex: 1,
    textAlign: "right",
    marginBottom: "20px",

  },
  closingBox:{
    width: "60%",
    padding: "20px",
    marginLeft:"130px",
    
  },
  closingLine: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    margin: "0 0 14px 0",       // reset default <p> margins
    padding: "4px 0",
     // optional vertical padding
  }
};

export default UpdateBill;
