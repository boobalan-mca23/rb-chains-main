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
    const [tempstock, setTempStock] = useState([])

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
    const handleStatus = (status) => {
        if (status !== 'all') {
            const stockTemp = [...stock]
            const filterStock = stockTemp.filter((item, index) => item.product_status === status)
            setTempStock(filterStock)
        } else {
            setTempStock(stock)
        }
    }
    return (
        <>

            <Box sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: 'flex-end',
                flexWrap: "wrap",
                gap: 2,
                marginBottom: 3,

            }}>
                <button onClick={() => { handleStatus('all') }}>All</button>
                <button onClick={() => { handleStatus('active') }}>Active</button>
                <button onClick={() => { handleStatus('sold') }}>Sold</button>
            </Box>
            <TableContainer component={Paper} style={{ marginTop: "20px" }}>
                <Table>
                    <TableHead style={{ backgroundColor: "aliceblue" }}>
                        <TableRow>
                            {["S.NO", "Date", "Item Name", "Touch", "Weight", "Pure", "Status"].map((label, idx) => (
                                <TableCell
                                    key={idx}
                                    align="center"
                                    sx={{
                                        color: "black",
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
                                    <TableCell align="center" sx={{ border: "1px solid rgba(224, 224, 224, 1)" }}>
                                        {index + 1}
                                    </TableCell>
                                    <TableCell align="center" sx={{ border: "1px solid rgba(224, 224, 224, 1)" }}>
                                        {(() => {
                                            const date = new Date(item.created_at);
                                            const day = date.getDate().toString().padStart(2, '0');
                                            const month = (date.getMonth() + 1).toString().padStart(2, '0');
                                            const year = date.getFullYear();
                                            return `${day}/${month}/${year}`;
                                        })()}
                                    </TableCell>
                                    <TableCell align="center" sx={{ border: "1px solid rgba(224, 224, 224, 1)" }}>
                                        {item.itemDetail.itemName}
                                    </TableCell>
                                    <TableCell align="center" sx={{ border: "1px solid rgba(224, 224, 224, 1)" }}>
                                        {item.itemDetail.touch}
                                    </TableCell>
                                    <TableCell align="center" sx={{ border: "1px solid rgba(224, 224, 224, 1)" }}>
                                        {item.itemDetail.weight}
                                    </TableCell>
                                    <TableCell align="center" sx={{ border: "1px solid rgba(224, 224, 224, 1)" }}>
                                        {item.itemDetail.pure.toFixed(3)}
                                    </TableCell>
                                    <TableCell align="center" sx={{ border: "1px solid rgba(224, 224, 224, 1)" }}>
                                        {item.product_status}
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={7} align="center" sx={{ border: "1px solid rgba(224, 224, 224, 1)" }}>
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