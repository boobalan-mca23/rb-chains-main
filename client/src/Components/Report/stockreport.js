// import React, { useState, useEffect, use } from "react";
// import axios from "axios";
// import {
//     TextField,
//     MenuItem,
//     Select,
//     FormControl,
//     InputLabel,
//     Table,
//     TableBody,
//     TableCell,
//     TableContainer,
//     TableHead,
//     TableRow,
//     Paper,
//     Typography,
//     Autocomplete,
//     Box,
//     Button,
// } from "@mui/material";
// function StockReport() {
//     const [stock, setStock] = useState([])
//     const [tempstock, setTempStock] = useState([])

//     useEffect(() => {
//         const fetchStock = async () => {
//             try {
//                 const response = await axios.get(`${process.env.REACT_APP_BACKEND_SERVER_URL}/api/stock/getStock`)
//                 console.log('stock response', response)
//                 setStock(response.data.data)
//                 setTempStock(response.data.data)

//             } catch (err) {

//             }
//         }
//         fetchStock()
//     }, [])
//     const handleStatus = (status) => {
//         if (status !== 'all') {
//             const stockTemp = [...stock]
//             const filterStock = stockTemp.filter((item, index) => item.product_status === status)
//             setTempStock(filterStock)
//         } else {
//             setTempStock(stock)
//         }
//     }
//     return (
//         <>

//             <Box sx={{
//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent: 'flex-end',
//                 flexWrap: "wrap",
//                 gap: 2,
//                 marginBottom: 3,

//             }}>
//                 <button onClick={() => { handleStatus('all') }}>All</button>
//                 <button onClick={() => { handleStatus('active') }}>Active</button>
//                 <button onClick={() => { handleStatus('sold') }}>Sold</button>
//             </Box>
//             <TableContainer component={Paper} style={{ marginTop: "20px" }}>
//                 <Table>
//                     <TableHead style={{ backgroundColor: "aliceblue" }}>
//                         <TableRow>
//                             {["S.NO", "Date", "Item Name", "Touch", "Weight", "Pure", "Status"].map((label, idx) => (
//                                 <TableCell
//                                     key={idx}
//                                     align="center"
//                                     sx={{
//                                         color: "black",
//                                         fontWeight: "bold",
//                                         border: "1px solid rgba(224, 224, 224, 1)",
//                                     }}
//                                 >
//                                     {label}
//                                 </TableCell>
//                             ))}
//                         </TableRow>
//                     </TableHead>

//                     <TableBody>
//                         {tempstock.length > 0 ? (
//                             tempstock.map((item, index) => (
//                                 <TableRow key={item.id}>
//                                     <TableCell align="center" sx={{ border: "1px solid rgba(224, 224, 224, 1)" }}>
//                                         {index + 1}
//                                     </TableCell>
//                                     <TableCell align="center" sx={{ border: "1px solid rgba(224, 224, 224, 1)" }}>
//                                         {(() => {
//                                             const date = new Date(item.created_at);
//                                             const day = date.getDate().toString().padStart(2, '0');
//                                             const month = (date.getMonth() + 1).toString().padStart(2, '0');
//                                             const year = date.getFullYear();
//                                             return `${day}/${month}/${year}`;
//                                         })()}
//                                     </TableCell>
//                                     <TableCell align="center" sx={{ border: "1px solid rgba(224, 224, 224, 1)" }}>
//                                         {item.itemDetail.itemName}
//                                     </TableCell>
//                                     <TableCell align="center" sx={{ border: "1px solid rgba(224, 224, 224, 1)" }}>
//                                         {item.itemDetail.touch}
//                                     </TableCell>
//                                     <TableCell align="center" sx={{ border: "1px solid rgba(224, 224, 224, 1)" }}>
//                                         {item.itemDetail.weight}
//                                     </TableCell>
//                                     <TableCell align="center" sx={{ border: "1px solid rgba(224, 224, 224, 1)" }}>
//                                         {item.itemDetail.pure.toFixed(3)}
//                                     </TableCell>
//                                     <TableCell align="center" sx={{ border: "1px solid rgba(224, 224, 224, 1)" }}>
//                                         {item.product_status}
//                                     </TableCell>
//                                 </TableRow>
//                             ))
//                         ) : (
//                             <TableRow>
//                                 <TableCell colSpan={7} align="center" sx={{ border: "1px solid rgba(224, 224, 224, 1)" }}>
//                                     No data found
//                                 </TableCell>
//                             </TableRow>
//                         )}
//                     </TableBody>
//                 </Table>
//             </TableContainer>

//         </>
//     )
// }

// export default StockReport;

import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Button,
} from "@mui/material";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

function StockReport() {
  const [stock, setStock] = useState([]);
  const [tempstock, setTempStock] = useState([]);
  const printRef = useRef();

  useEffect(() => {
    const fetchStock = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BACKEND_SERVER_URL}/api/stock/getStock`
        );
        setStock(response.data.data);
        setTempStock(response.data.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchStock();
  }, []);

  const handleStatus = (status) => {
    if (status !== "all") {
      const filtered = stock.filter((item) => item.product_status === status);
      setTempStock(filtered);
    } else {
      setTempStock(stock);
    }
  };

  const handlePrintPDF = async () => {
    const input = printRef.current;

    const canvas = await html2canvas(input, {
      scale: 2,
      useCORS: true,
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = 210; // A4 width in mm
    const pdfHeight = 297; // A4 height in mm

    const imgProps = pdf.getImageProperties(imgData);
    const imgWidth = pdfWidth;
    const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pdfHeight;

    while (heightLeft > 0) {
      position = position - pdfHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;
    }

    pdf.save("Stock-Report.pdf");
  };

  return (
    <>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          mb: 2,
        }}
      >
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button variant="outlined" onClick={() => handleStatus("all")}>
            All
          </Button>
          <Button variant="outlined" onClick={() => handleStatus("active")}>
            Active
          </Button>
          <Button variant="outlined" onClick={() => handleStatus("sold")}>
            Sold
          </Button>
        </Box>
        
      </Box>
      <Button variant="contained" onClick={handlePrintPDF}>
          Print 
        </Button>

      <div ref={printRef}
    style={{
    padding: "30px",
    margin: "auto",
    boxSizing: "border-box",
  }}>
        <TableContainer component={Paper}>
              <h3 style={{textAlign:"center"}}>Stock Report</h3>
          <Table size="small">
            <TableHead style={{ backgroundColor: "aliceblue" }}>
              <TableRow>
                {[
                  "S.NO",
                  "Date",
                  "Item Name",
                  "Touch",
                  "Weight",
                  "Pure",
                  "Status",
                ].map((label, idx) => (
                  <TableCell
                    key={idx}
                    align="center"
                    sx={{
                      fontWeight: "bold",
                      border: "1px solid rgba(224, 224, 224, 1)",
                    }}
                  >
                    {label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {tempstock.length > 0 ? (
                tempstock.map((item, index) => (
                  <TableRow key={item.id}>
                    <TableCell align="center">{index + 1}</TableCell>
                    <TableCell align="center">
                      {(() => {
                        const date = new Date(item.created_at);
                        const d = String(date.getDate()).padStart(2, "0");
                        const m = String(date.getMonth() + 1).padStart(2, "0");
                        const y = date.getFullYear();
                        return `${d}/${m}/${y}`;
                      })()}
                    </TableCell>
                    <TableCell align="center">
                      {item.itemDetail.itemName}
                    </TableCell>
                    <TableCell align="center">
                      {item.itemDetail.touch}
                    </TableCell>
                    <TableCell align="center">
                      {item.itemDetail.weight}
                    </TableCell>
                    <TableCell align="center">
                      {item.itemDetail.pure.toFixed(3)}
                    </TableCell>
                    <TableCell align="center">
                      {item.product_status}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No data found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </>
  );
}

export default StockReport;





