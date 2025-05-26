
import React, { useState, useEffect, useRef } from "react";
import {
  Autocomplete,
  TextField,
  Box,
  Button,
  Table,
  TableHead,
  TableCell,
  TableRow,
  TableBody,
  IconButton,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import jsPDF from "jspdf"; 
import html2canvas from "html2canvas"; 
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaTrash } from "react-icons/fa";
import { MdDeleteForever } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import "./billing.css";

const Billing = () => {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [billItems, setBillItems] = useState([]);
  const [billId, setBillId] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [isPrinting, setIsPrinting] = useState(false);
  const billRef = useRef(); 
  const [products, setProducts] = useState([]);
  const [productWeight, setProductWeight] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [totalBillAmount, setTotalBillAmount] = useState(0);
  const [customerClosing, setCustomerClosing] = useState(0);
  const [balanceRow, setBalanceRow] = useState([]);
  const [closing, setClosing] = useState(0);
  const [pure, setPure] = useState(0);

  const [rows, setRows] = useState([]); 
  const [viewMode, setViewMode] = useState(false); 
  const [selectedBill, setSelectedBill] = useState(null); 

  const navigate = useNavigate(); 

  const handleProductSelect = (itemIndex, stockId) => {
    const tempProducts = [...productWeight];
    let customerData;
    const tempSelectProduct = tempProducts.filter(
      (item, index) => itemIndex === index
    );
    console.log("masterjewelid", selectedProduct.master_jewel_id);

    if (!selectedCustomer) {
      toast.error("Please select a customer first!", { autoClose: 2000 });
      return;
    }

    customerData = customers.filter(
      (item) => item.customer_id === selectedCustomer.customer_id
    );

    if (customerData.length === 0) {
      toast.error("Customer data not found for selected customer.", { autoClose: 2000 });
      return;
    }

    const filterMasterItem =
      customerData[0].MasterJewelTypeCustomerValue.filter(
        (item) => item.masterJewel_id === selectedProduct.master_jewel_id
      );

    if (filterMasterItem.length === 0) {
      toast.warning("Percentage is Required for this jewel type!", { autoClose: 2000 });
    } else {
      const billObj = {
        productName: tempSelectProduct[0].item_name,
        productTouch: tempSelectProduct[0].touchValue,
        productWeight: tempSelectProduct[0].value,
        productPure: 0,
        productPercentage: 0,
        stockId: stockId,
      };

      billObj.productPercentage = filterMasterItem[0].value;
      billObj.productPure =
        ((billObj.productTouch + billObj.productPercentage) *
          billObj.productWeight) /
        100;

      const tempBill = [...billItems];
      tempBill.push(billObj);
      setBillItems(tempBill);

    
      tempProducts.splice(itemIndex, 1);
      setProductWeight(tempProducts);
    }
  };

  const handleSaveBill = async () => {
    if (!selectedCustomer) {
      toast.error("Customer Name is Required!", { autoClose: 2000 });
      return;
    }
    if (!selectedProduct) {
      toast.error("Jewel Name is Required!", { autoClose: 2000 });
      return;
    }
    if (billItems.length === 0) {
      toast.error("Order Items are Required!", { autoClose: 2000 });
      return;
    }

    const payLoad = {
      customer_id: selectedCustomer.customer_id,
      order_status: "completed",
      totalPrice: totalPrice,
      orderItems: billItems,
      oldBalance: customerClosing,
      balance: balanceRow,
      closingbalance: balanceRow.length === 0 ? totalBillAmount : closing,
      receivedDetails: rows,
    };
    console.log("payload", payLoad);

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_SERVER_URL}/api/bill/saveBill`,
        payLoad
      );
      if (response.status === 201) {
        setBillId(response.data.data.id);
        toast.success("Bill Created Successfully!", { autoClose: 1000 });
        const cells = document.querySelectorAll(".merge-cell");
        window.onbeforeprint = () => {
          cells.forEach((td) => td.setAttribute("colspan", "3"));
        };
        window.onafterprint = () => {
          cells.forEach((td) => td.setAttribute("colspan", "4"));
        };

        window.print(); 
      }
    } catch (err) {
      toast.error(`Error saving bill: ${err.message}`, { autoClose: 3000 });
      console.error("Error saving bill:", err);
    }
  };

  const calculateTotal = (items) => {
    return items.reduce((acc, currValue) => acc + currValue.productPure, 0);
  };


  const calculateClosing = (balRows) => {
    return balRows.reduce((acc, currValue) => acc + currValue.pure, 0);
  };

  const handleBalanceRow = () => {
    if (!selectedCustomer) {
      toast.warning("Select Customer Name", { autoClose: 2000 });
      return;
    }
    if (!selectedProduct) {
      toast.warning("Select Jewel Name", { autoClose: 2000 });
      return;
    }
    if (billItems.length === 0) {
      toast.warning("Add Order Items first!", { autoClose: 2000 });
      return;
    }

    const tempRow = [
      ...balanceRow,
      {
        customer_id: selectedCustomer.customer_id,
        givenGold: "", 
        touch: "", 
        pure: 0,
      },
    ];
    setBalanceRow(tempRow);
  };

  const handleBalanceInputChange = (index, field, value) => {
    const updatedRows = [...balanceRow];
    updatedRows[index][field] = value;

    const givenGold = parseFloat(updatedRows[index]["givenGold"]);
    const touch = parseFloat(updatedRows[index]["touch"]);

    if (!isNaN(givenGold) && !isNaN(touch)) {
      updatedRows[index]["pure"] = (givenGold * touch) / 100;
    } else {
      updatedRows[index]["pure"] = 0; 
    }

    setBalanceRow(updatedRows);
  };

  const handleRemoveBalanceRow = (index) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this balance row?"
    );

    if (confirmDelete) {
      const tempBalRow = [...balanceRow];
      tempBalRow.splice(index, 1);
      setBalanceRow(tempBalRow);
    }
  };

  const handleChangePercentage = (itemIndex, value) => {
    const tempBill = [...billItems];
    const itemToUpdate = tempBill[itemIndex];

    const newPercentage = parseInt(value);
    if (isNaN(newPercentage)) {
    
      itemToUpdate.productPercentage = ""; 
      itemToUpdate.productPure = (itemToUpdate.productTouch * itemToUpdate.productWeight) / 100; 
    } else {
      itemToUpdate.productPercentage = newPercentage;
      itemToUpdate.productPure =
        ((itemToUpdate.productTouch + newPercentage) * itemToUpdate.productWeight) / 100;
    }

    setBillItems([...tempBill]);
  };

  const handleRemoveOrder = (index, item_name, touchValue, value, stock_id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this order item?"
    );

    if (confirmDelete) {
      const tempBill = [...billItems];
      tempBill.splice(index, 1);
      setBillItems(tempBill);

      const tempProduct = [...productWeight];
      tempProduct.push({ item_name, stock_id, touchValue, value });
      setProductWeight(tempProduct); 
    }
  };

  const handleAddRow = () => {
    setRows([
      ...rows,
      {
        date: "",
        goldRate: "",
        givenGold: "",
        touch: "",
        purityWeight: "",
        amount: "",
        hallmark: "",
      },
    ]);
  };

  const handleDeleteRow = (index) => {
    const updatedRows = [...rows];
    updatedRows.splice(index, 1);
    setRows(updatedRows);
  };

  const handleRowChange = (index, field, value) => {
    const updatedRows = [...rows];
    updatedRows[index][field] = value;

    if (field === "givenGold" || field === "touch") {
      const givenGold = parseFloat(updatedRows[index]["givenGold"]);
      const touch = parseFloat(updatedRows[index]["touch"]);
      if (!isNaN(givenGold) && !isNaN(touch)) {
        updatedRows[index]["purityWeight"] = (
          (givenGold * touch) /
          100
        ).toFixed(3);
      } else {
        updatedRows[index]["purityWeight"] = "";
      }
    }
    setRows(updatedRows);
  };

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BACKEND_SERVER_URL}/api/customer/getCustomerValueWithPercentage`
        );
        setCustomers(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        toast.error("Error fetching customers!", { containerId: "custom-toast" });
        console.error("Error:", error);
      }
    };

    const fetchJewelItem = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BACKEND_SERVER_URL}/api/jewelType/getJewelType`
        );
        setProducts(
          Array.isArray(response.data.allJewel) ? response.data.allJewel : []
        );
      } catch (error) {
        toast.error("Error fetching jewel types!", { containerId: "custom-toast" });
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
    if (balanceRow.length === 0) {
      setClosing(totalBillAmount);
      setPure(0); 
    } else {
      const calculatedPure = calculateClosing(balanceRow);
      setPure(calculatedPure);
      setClosing(totalBillAmount - calculatedPure);
    }
  }, [balanceRow, totalBillAmount]);

  useEffect(() => {
    setTotalPrice(calculateTotal(billItems));
    setTotalBillAmount(Number(calculateTotal(billItems)) + Number(customerClosing));
  }, [billItems, customerClosing]);

  useEffect(() => {
    if (selectedProduct) {
      const fetchWeight = async () => {
        try {
          const productsWeight = await axios.get(
            `${process.env.REACT_APP_BACKEND_SERVER_URL}/api/jewelType/getProductWeight/${selectedProduct.master_jewel_id}`
          );
          setProductWeight(productsWeight.data.productsWeight);
        } catch (err) {
          if (err.response && err.response.status === 400) {
            setProductWeight([]);
            toast.info("No products found for this jewel type.", { autoClose: 2000 });
          } else if (err.response && err.response.status === 500) {
            toast.error("Server error while fetching product weights.", { autoClose: 3000 });
          } else {
            toast.error("Error fetching product weights.", { autoClose: 3000 });
          }
          console.error("Error fetching product weights:", err);
        }
      };
      fetchWeight();
    } else {
      setProductWeight([]); 
    }
  }, [selectedProduct]);

  useEffect(() => {
    const fetchClosingBalance = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BACKEND_SERVER_URL}/api/customer/closing/${selectedCustomer.customer_id}`
        );
        setCustomerClosing(response.data.closingBalance);
      } catch (err) {
        toast.error(`Error fetching customer closing balance: ${err.message}`, { autoClose: 3000 });
        console.error("Error fetching closing balance:", err);
        setCustomerClosing(0); 
      }
    };
    if (selectedCustomer) {
      fetchClosingBalance();
    } else {
      setCustomerClosing(0); 
    }
  }, [selectedCustomer]);

  useEffect(() => {
    setBillItems([]);
    setRows([]);
    setBalanceRow([]);

    if (selectedProduct && selectedCustomer) {
      const fetchWeightOnCustomerProductChange = async () => {
        try {
          const productsWeight = await axios.get(
            `${process.env.REACT_APP_BACKEND_SERVER_URL}/api/jewelType/getProductWeight/${selectedProduct.master_jewel_id}`
          );
          setProductWeight(productsWeight.data.productsWeight);
        } catch (err) {
          if (err.response && err.response.status === 400) {
            setProductWeight([]);
          } else if (err.response && err.response.status === 500) {
            toast.error("Server Error: Could not fetch product weights on change.", { autoClose: 3000 });
          } else {
            toast.error("Error fetching products on customer/product change.", { autoClose: 3000 });
          }
          console.error("Error fetching product weights on change:", err);
        }
      };
      fetchWeightOnCustomerProductChange();
    } else {
      setProductWeight([]); 
    }
  }, [selectedCustomer, selectedProduct]);

  return (
    <Box className="billing-wrapper" ref={billRef}>
      <Box className="left-panel">
        <h1 className="heading">Estimate Only</h1>
        <Box className="bill-header">
          <Box className="bill-number">
            <p >
              <strong>Bill No:</strong> {billId}
            </p>
          </Box>
          <Box className="bill-info">
            <p>
              <strong>Date:</strong> {date}
          <br></br>
          <br></br>
              <strong>Time:</strong> {time}
            </p>
          </Box>
        </Box>

        <Box className="search-section no-print">
          <Autocomplete
            options={customers}
            getOptionLabel={(option) => option.customer_name || ""}
            onChange={(event, newValue) => setSelectedCustomer(newValue)}
            value={selectedCustomer}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Select Customer"
                variant="outlined"
                size="small"
              />
            )}
            className="small-autocomplete"
          />

          <Autocomplete
            options={products}
            getOptionLabel={(option) => option.jewel_name || ""}
            onChange={(event, newValue) => setSelectedProduct(newValue)}
            value={selectedProduct}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Search Product Name"
                variant="outlined"
                size="small"
              />
            )}
            className="small-autocomplete"
          />
        </Box>
        {selectedCustomer && (
          <Box className="customer-details">
            <h3 className="no-print">Customer Details:</h3>
            <p>
              <strong>Name:</strong> {selectedCustomer.customer_name}
            </p>
          </Box>
        )}
        <Box className="items-section">
          <h3 className="no-print">Bill Details:</h3>
          <table className="table">
            <thead>
              <tr>
                <th className="th">Description</th>
                <th className="th">Touch</th>
                <th className="th no-print">%</th>
                <th className="th">Weight</th>
                <th className="th">Pure</th>
                <th className="th no-print">Action</th>
              </tr>
            </thead>
            <tbody>
              {billItems.length > 0 ? (
                billItems.map((item, index) => (
                  <tr key={index}>
                    <td className="td">{item.productName}</td>
                    <td className="td">{item.productTouch}</td>
                    <td className="td no-print">
                      <input
                        value={item.productPercentage}
                        type="number"
                        onChange={(e) => handleChangePercentage(index, e.target.value)}
                      />
                    </td>
                    <td className="td">{item.productWeight}</td>
                    <td className="td">{item.productPure.toFixed(3)}</td>
                    <td className="td no-print">
                      <Button
                        onClick={() =>
                          handleRemoveOrder(
                            index,
                            item.productName,
                            item.productTouch,
                            item.productWeight,
                            item.stockId
                          )
                        }
                      >
                        <FaTrash />
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="no-products-message">
                    No products selected
                  </td>
                </tr>
              )}
              <tr>
                <td colSpan={4} className="td merge-cell">
                  <strong>Bill Total</strong>
                </td>
                <td className="td">{totalPrice.toFixed(3)}</td>
                <td className="no-print"></td>
              </tr>
              {selectedCustomer && (
                <tr>
                  <td colSpan={4} className="td merge-cell">
                    <strong>Old Balance</strong>
                  </td>
                  <td className="td">{customerClosing.toFixed(3)}</td>
                  <td className="no-print"></td>
                </tr>
              )}
              <tr>
                <td colSpan={4} className="td merge-cell">
                  <strong>Total Amount</strong>
                </td>
                <td className="td">{totalBillAmount.toFixed(3)}</td>
                <td className="no-print"></td>
              </tr>
              {balanceRow.map((row, index) => (
                <tr key={`balance-${index}`}>
                  <td className="td">Given Gold</td>
                  <td className="td">
                    <input
                      type="number"
                      value={row.givenGold}
                      onChange={(e) => handleBalanceInputChange(index, "givenGold", e.target.value)}
                    />
                  </td>
                  <td className="td">
                    <input
                      type="number"
                      value={row.touch}
                      onChange={(e) => handleBalanceInputChange(index, "touch", e.target.value)}
                    />
                  </td>
                  <td className="td"></td> 
                  <td className="td">{row.pure.toFixed(3)}</td>
                  <td className="td no-print">
                    <Button onClick={() => handleRemoveBalanceRow(index)}>
                      <FaTrash />
                    </Button>
                  </td>
                </tr>
              ))}
              <tr>
                <td colSpan={6} className="no-print" style={{ textAlign: 'right' }}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleBalanceRow}
                    className="balance-button"
                  >
                    + Add Given Gold
                  </Button>
                </td>
              </tr>
            </tbody>
          </table>
          <Box className="items-section no-print">
            <div className="add">
              <h3>Received Details:</h3>
              <p className="add-icon-wrapper">
                <IconButton size="small" onClick={handleAddRow} className="add-circle-icon">
                  <AddCircleOutlineIcon />
                </IconButton>
              </p>
            </div>

            <table className="table received-details-table"> 
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
                  <th className="th">Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.length > 0 ? (
                  rows.map((row, index) => (
                    <tr key={index}>
                      <td className="td">{index + 1}</td>
                      <td className="td">
                        <TextField
                          className="date-field"
                          size="small"
                          type="date"
                          value={row.date}
                          onChange={(e) => handleRowChange(index, "date", e.target.value)}                       
                          InputProps={{ disableUnderline: true }} 
                        />
                      </td>
                      <td className="td">
                        <TextField
                          size="small"
                          value={row.goldRate}
                          onChange={(e) => handleRowChange(index, "goldRate", e.target.value)}
                          type="number"
                          InputProps={{ disableUnderline: true }}
                        />
                      </td>
                      <td className="td">
                        <TextField
                          size="small"
                          value={row.givenGold}
                          onChange={(e) => handleRowChange(index, "givenGold", e.target.value)}
                          type="number"
                          InputProps={{ disableUnderline: true }}
                        />
                      </td>
                      <td className="td">
                        <TextField
                          size="small"
                          value={row.touch}
                          onChange={(e) => handleRowChange(index, "touch", e.target.value)}
                          type="number"
                          InputProps={{ disableUnderline: true }}
                        />
                      </td>
                      <td className="td">
                        <TextField
                          size="small"
                          value={row.purityWeight}
                          InputProps={{ readOnly: true, disableUnderline: true }}
                        />
                      </td>
                      <td className="td">
                        <TextField
                          size="small"
                          value={row.amount}
                          onChange={(e) => handleRowChange(index, "amount", e.target.value)}
                          type="number"
                          InputProps={{ disableUnderline: true }}
                        />
                      </td>
                      <td className="td">
                        <TextField
                          size="small"
                          value={row.hallmark}
                          onChange={(e) => handleRowChange(index, "hallmark", e.target.value)}
                          type="number"
                          InputProps={{ disableUnderline: true }}
                        />
                      </td>
                      <td className="td">
                        {(!viewMode || index >= (selectedBill?.receivedDetails?.length || 0)) && (
                          <IconButton onClick={() => handleDeleteRow(index)}>
                            <MdDeleteForever />
                          </IconButton>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="no-products-message">
                      No received details added
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </Box>
        </Box>
        <Box className="closing-box">
          <p className="closing-line">
            <span>Received</span>
            <span>{pure.toFixed(3)}</span>
          </p>
          <p className="closing-line">
            <span>Closing</span>
            <span>{(balanceRow.length === 0 ? totalBillAmount : closing).toFixed(3)}</span>
          </p>
        </Box>
        <br></br>

        <Button
          variant="contained"
          color="primary"
          onClick={handleSaveBill}
          className="save-button no-print"
        >
          Save
        </Button>
      </Box>

     
      <Box className="right-panel no-print">
        <h3 className="heading" style={{fontSize: '20px', marginBottom: '15px'}}>Available Product Weights</h3>
        <Table className="table">
          <TableHead>
            <TableRow>
              <TableCell className="th">S.No</TableCell>
              <TableCell className="th">Product Finish Weight</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {productWeight.length > 0 ? (
              productWeight.map((product, index) => (
                <TableRow
                  key={index}
                  onClick={() => handleProductSelect(index, product.stock_id)}
                  className="product-weight-row"
                >
                  <TableCell className="td">{index + 1}</TableCell>
                  <TableCell className="td">{product.value}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell className="td no-product-weight-message" colSpan={2}>
                  No product weight data
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <ToastContainer />
      </Box>
    </Box>
  );
};

export default Billing;