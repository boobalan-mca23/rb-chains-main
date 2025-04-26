import React, { useState, useEffect, use } from "react";
import axios from "axios";
import {
    TextField,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Typography,
    Autocomplete,
    Box,
    Button,
} from "@mui/material";
function StockReport() {
    const [stock, setStock] = useState([])
    const [tempstock,setTempStock]=useState([])

    useEffect(() => {
        const fetchStock = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_BACKEND_SERVER_URL}/api/stock/getStock`)
                console.log('stock response', response)
                setStock(response.data.data)
                setTempStock(response.data.data)

            } catch (err) {

            }
        }
        fetchStock()
    }, [])
    const handleStatus=(status)=>{
       if(status!=='all'){
        const stockTemp=[...stock]
        const filterStock=stockTemp.filter((item,index)=>item.product_status===status)
         setTempStock(filterStock)
       }else{
        setTempStock(stock)
       }
    }
    return (
        <>
           
            <Box  sx={{
            display: "flex",
            alignItems: "center",
            justifyContent:'flex-end',
            flexWrap: "wrap",
            gap: 2,
            marginBottom: 3,
            
          }}>
                <button onClick={()=>{handleStatus('all')}}>All</button>
                <button onClick={()=>{handleStatus('active')}}>Active</button>
                <button onClick={()=>{handleStatus('sold')}}>Sold</button>
            </Box>
            <TableContainer component={Paper} style={{ marginTop: "20px" }}>
                <Table>
                    <TableHead style={{ backgroundColor: "aliceblue" }}>
                        <TableRow>
                            <TableCell style={{ color: "black", fontWeight: "bold" }}>
                                S.NO
                            </TableCell>
                            <TableCell style={{ color: "black", fontWeight: "bold" }}>
                                Date
                            </TableCell>
                            <TableCell style={{ color: "black", fontWeight: "bold" }}>
                                ItemName
                            </TableCell>
                            <TableCell style={{ color: "black", fontWeight: "bold" }}>
                                Touch
                            </TableCell>
                            <TableCell style={{ color: "black", fontWeight: "bold" }}>
                                weight
                            </TableCell>
                            <TableCell style={{ color: "black", fontWeight: "bold" }}>
                                pure
                            </TableCell>
                            <TableCell style={{ color: "black", fontWeight: "bold" }}>
                                status
                            </TableCell>

                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {tempstock.length > 0 ? (
                            tempstock.map((item, index) => (
                                <TableRow key={item.id}>
                                    <TableCell>{index + 1}</TableCell>

                                    <TableCell>
                                        {(() => {
                                            const date = new Date(item.created_at);
                                            const day = date.getDate().toString().padStart(2, '0');
                                            const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are 0-based
                                            const year = date.getFullYear();
                                            return `${day}/${month}/${year}`;
                                        })()}
                                    </TableCell>

                                    <TableCell>{item.itemDetail.itemName}</TableCell>
                                    <TableCell>{item.itemDetail.touch}</TableCell>
                                    <TableCell>{item.itemDetail.weight}</TableCell>
                                    <TableCell>{item.itemDetail.pure}</TableCell>
                                    <TableCell>{item.product_status}</TableCell>

                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6} style={{ textAlign: "center" }}>
                                    No data found
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </>
    )
}

export default StockReport;