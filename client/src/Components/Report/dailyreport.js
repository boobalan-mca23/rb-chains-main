import React, { useState, useEffect,useRef} from "react";
import { REACT_APP_BACKEND_SERVER_URL } from '../../config/config'
import axios from 'axios'
import { styled } from "@mui/material/styles";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField, Button, Box, Modal, Typography, colors, TableFooter, Autocomplete, Hidden, Grid } from "@mui/material";
import {getLotDatewise} from "../../Api/processTableApi";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import './dailyReport.css'
function DailyReport() {
  const printRef=useRef()
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [items, setItems] = useState([])
  const processes = ["Melting", "Wire", "Machine", "Soldrine", "Joint", "Cutting", "Finishing"];
  const [calculation, setCalculation] = useState([
    { rawGold: 0 },
    { touchValue: 0 },
    {
      process: [
        { processName: "Melting", Weight: [{ bw: 0 }, { aw: 0 }, { sw: 0 }, { lw: 0 }] },
        { processName: "Wire", Weight: [{ bw: 0 }, { aw: 0 }, { sw: 0 }, { lw: 0 }] },
        { processName: "Machine", Weight: [{ bw: 0 }, { aw: 0 }, { lw: 0 }] },
        { processName: "Soldrine", Weight: [{ bw: 0 }, { aw: 0 }, { sw: 0 }, { lw: 0 }] },
        { processName: "Joint", Weight: [{ bw: 0 }, { aw: 0 }, { sw: 0 }, { lw: 0 }] },
        { processName: "Cutting", Weight: [{ bw: 0 }, { aw: 0 }, { sw: 0 }, { lw: 0 }, { pw: 0 }] },
        { processName: "Finishing", Weight: [{ bw: 0 }, { aw: 0 }, { sw: 0 }, { lw: 0 }] },
      ],
    },
    {
      lotTotal: 0
    }
  ]);
  const StyledTableCell = styled(TableCell)({ border: "1px solid #ccc", textAlign: "center", padding: "6px", });
  const StyledTableContainer = styled(TableContainer)({ margin: "20px auto", maxWidth: "100%", border: "1px solid #ccc" });
  const StyledInput = styled(TextField)({ "& .MuiOutlinedInput-notchedOutline": { border: "none" }, "& .MuiInputBase-input": { textAlign: "center", padding: "5px" }, width: "80px" });


  const handleTotal = (lotid, lotProcessId, processId) => {
    const tempData = [...items];
    const lotData = tempData.filter((item, index) => item.lotid === lotid);

    const totalValue = lotData[0]?.data[lotProcessId]?.ProcessSteps[processId]?.AttributeValues.reduce(
      (acc, item) => acc + item.value,
      0
    );

    return totalValue;
  }

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

    pdf.save("Daily-Report.pdf");
  };


   
  const docalculation = (arrayItems) => {
    // Calculation
    const tempData = [...arrayItems];
    let lotTotal = tempData.reduce((acc, item) => {
      if (item.data && item.data[0]?.ProcessSteps[0]?.AttributeValues[0]?.value) {
        return acc + item.data[0].ProcessSteps[0].AttributeValues[0].value;
      }
      return acc; // skip this item, don't add anything
    }, 0);
    const tempCalculation = [...calculation];//over lot all raw gold total
    tempCalculation[0].rawGold = lotTotal;

    let finishTotal = 0;
    tempData.forEach((lotData) => {
      if (
        lotData.data &&
        lotData.data[7]?.ProcessSteps?.[1]?.AttributeValues &&
        lotData.data[7].ProcessSteps[1].AttributeValues.length !== 0
      ) {
        lotData.data[7].ProcessSteps[1].AttributeValues.forEach((arrItem) => {
          if (arrItem?.value) {
            finishTotal += arrItem.value;
          }
        });
      }
    });

    tempCalculation[2].process[6].Weight[1].aw = Number(finishTotal)
    console.log('finishTotal', finishTotal)

    let finsihAfterValue = 0;
    let lotFinishValue = 0;
    tempData.forEach((lotData, lotIndex) => {// this calculation for lotDifferent Total
      if (lotData.data) {
        if (lotData.data[7].ProcessSteps[1].AttributeValues.length === 0) {
          finsihAfterValue = 0;
        } else {
          lotData.data[7].ProcessSteps[1].AttributeValues.forEach((arrItem, arrIndex) => {
            finsihAfterValue += arrItem.value
          })
          lotFinishValue += lotData.data[0].ProcessSteps[0].AttributeValues[0].value - finsihAfterValue
          finsihAfterValue = 0;
        }
      }

    })
    tempCalculation[3].lotTotal = lotFinishValue
    //calculation for total scarp value and loss total
    for (let i = 1; i <= 7; i++) {
      let scarpTotal = 0, lossTotal = 0, pureTotal = 0;
      let innerScarp = 0, innerLoss = 0, innerPure = 0;
      for (let j = 0; j < tempData.length; j++) {
        const dataItem = tempData[j]?.data?.[i];
        const processSteps = dataItem?.ProcessSteps;
        const attrValues = processSteps?.[2]?.AttributeValues;

        if (attrValues && attrValues.length !== 0) {
          attrValues.forEach((attrItem, attrIndex) => {
            if (i === 6) {
              const pureValue = processSteps?.[4]?.AttributeValues?.[attrIndex]?.value || 0;
              innerPure += Number(pureValue);
            }
            if (i !== 3) {
              const scrapValue = processSteps?.[2]?.AttributeValues?.[attrIndex]?.value || 0;
              const lossValue = processSteps?.[3]?.AttributeValues?.[attrIndex]?.value || 0;
              innerScarp += Number(scrapValue);
              innerLoss += Number(lossValue);
            }
          });
        }
      }

      scarpTotal += innerScarp;
      lossTotal += innerLoss;
      pureTotal += innerPure;

      if (i !== 3) {
        tempCalculation[2].process[i - 1].Weight[2].sw = scarpTotal
        tempCalculation[2].process[i - 1].Weight[3].lw = lossTotal
      }

      if (i === 6) {
        tempCalculation[2].process[i - 1].Weight[4].pw = pureTotal
      }
      console.log('tempCalculation for scw,losw', tempCalculation)
    }
    return tempCalculation
  }



  const handleDateWiseFilter = async () => {
      try {
        console.log('fromDate', fromDate);
        console.log('toDate', toDate);

        if (fromDate > toDate) {
          alert('Your Date Order was Wrong');
          return;
        }
        setItems([])
        const res = await getLotDatewise(fromDate, toDate);
        console.log('DateWiseFilter', res.data.data);
        setItems(res.data.data)
        setCalculation(docalculation(res.data.data))
        handleMachineCalculate(items, calculation)
        console.log('itemsAfterDateWiseFilter', items);
      } catch (error) {
        console.error('Error fetching data by date:', error.message);
        alert('Select Date First.');
      }
    };
    

  const handleMachineCalculate = (response, calculation) => {
    const tempData = response;
    const tempCal = [...calculation]
    let total = 0;
    for (const lot of tempData) {
      if (lot.scarpValue) {
        total += lot.scarpValue.totalScarp
      }
    }
    tempCal[2].process[2].Weight[2].lw = total
    setCalculation(tempCal)

  }
useEffect(() => {
  const fectchLotDetails = async () => {
    try {
      const res = await axios.get(`${REACT_APP_BACKEND_SERVER_URL}/api/process/processes`);
      console.log(res.data.data);
      setItems(res.data.data);
      const calculated = docalculation(res.data.data);
      setCalculation(calculated);
      handleMachineCalculate(res.data.data, calculated);
    } catch (error) {
      console.error("Error fetching lot details:", error);
     
    }
  };

  fectchLotDetails();
}, []);


  //set today Data
   useEffect(() => {
      // Get current date in UTC
      const today = new Date();
  
      // Convert to Indian Standard Time (IST)
      const offset = 5.5 * 60; // IST is UTC +5:30
      const indiaTime = new Date(today.getTime() + offset * 60000); // Adjust the time by the offset
  
      // Extract date parts (year, month, day)
      const year = indiaTime.getFullYear();
      const month = String(indiaTime.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
      const day = String(indiaTime.getDate()).padStart(2, '0');
  
      // Format the date as YYYY-MM-DD
      const currentDate = `${year}-${month}-${day}`;
  
      console.log('currentDate in IST:', currentDate);
  
      setFromDate(currentDate);
      setToDate(currentDate);
    }, []);
  return (
    <>
      {/* <Typography
        variant="h5"
        style={{
          fontWeight: "bold",
          color: "black",
          marginBottom: 20,
          textAlign: "center"

        }}
      >
        Daily Lot Report
      </Typography> */}
      <div style={{ padding: 20 }}>
       
        <div style={{ display: "flex", gap: "10px", marginBottom: 20 }}>
          <TextField
            label="From Date"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
          <TextField
            label="To Date"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
          <Button variant="contained" onClick={()=>{handleDateWiseFilter()}}>Filter</Button>
           
        </div>
         <div>
          <Button variant="contained" onClick={handlePrintPDF}>
                    Print 
         </Button>
        </div>
      </div>
      
         
        <div  style={{ position: 'relative', overflow: 'auto', maxHeight: '57vh', padding: "10px", margin: "auto"}} className="overflow-auto hidescrollbar">
          <h3 style={{textAlign:"center"}}>Daily Lot Report</h3>
          {/* <Table> */}
            
          <Table ref={printRef}>
             
            <TableHead style={{ position: 'sticky', top: "0px", zIndex: 10, backgroundColor: '#d8e3e6' }}  >
                     
              <TableRow>
                <StyledTableCell >
                  <b>Raw Gold</b>
                </StyledTableCell>
                <StyledTableCell >
                  <b>Touch</b>
                </StyledTableCell >
                {processes.map((process) => {
                  let colSpanValue = 4;

                  if (process === "Cutting") {
                    colSpanValue = 5;
                  }
                  if (process === "Wire") {
                    colSpanValue = 5
                  }
                  else if (process === "Machine") {
                    colSpanValue = 3;
                  }

                  return (
                    <StyledTableCell key={process} colSpan={colSpanValue}  >
                      <b>{process}</b>
                    </StyledTableCell>
                  );
                })}
                <StyledTableCell   >
                  <b>Item Diffrent</b>
                </StyledTableCell>
                <StyledTableCell   >
                  <b>Total Diffrent</b>
                </StyledTableCell >
              </TableRow>
              <TableRow>
                <StyledTableCell colSpan={2} />
                {processes.map((process) => (

                  <React.Fragment key={process}>
                    <StyledTableCell  >
                      <b style={{fontSize:"11px"}}>Before</b>
                    </StyledTableCell>
                    {process === "Wire" ? (
                      <StyledTableCell colSpan={2}   >
                        <b style={{fontSize:"11px"}}>After</b>
                      </StyledTableCell>) :
                      (<StyledTableCell  >
                        <b style={{fontSize:"11px"}}>After</b>
                      </StyledTableCell>)}


                    {process !== "Machine" ?
                      (<StyledTableCell   >
                        <b style={{fontSize:"11px"}}>Scarp</b>
                      </StyledTableCell>) : ("")}
                    {process !== "Soldrine" ? (
                      <StyledTableCell  >
                        <b style={{fontSize:"11px"}}>Loss</b>
                      </StyledTableCell>) : (
                      <StyledTableCell>
                        <b style={{fontSize:"11px"}}>+</b>
                      </StyledTableCell>)}

                    {
                      process === "Cutting" && (
                        <StyledTableCell   >
                          <b style={{fontSize:"11px"}}>ScarpTotal</b>
                        </StyledTableCell>
                      )
                    }



                  </React.Fragment>
                ))}
                <StyledTableCell />
                <StyledTableCell />

              </TableRow>
            </TableHead>
            <TableBody >
              {
                items.map((lotItem, lotIndex) => (
                  lotItem.data ? (
                    <React.Fragment key={lotIndex} >
                      <TableRow >
                        <StyledTableCell>


                          {//RawGold Input Box
                            typeof lotItem.data[0].ProcessSteps[0].AttributeValues[0].value === "number"
                              ? lotItem.data[0].ProcessSteps[0].AttributeValues[0].value
                              : ""
                          }


                        </StyledTableCell>
                        <StyledTableCell>
                          {lotItem.data[0].ProcessSteps[0].AttributeValues[0].touchValue || " "}
                        </StyledTableCell>

                        {lotItem.data.map((lotArr, lotArrIndex) =>
                          lotItem.data[lotArrIndex + 1] && lotItem.data[lotArrIndex + 1].ProcessSteps ? (
                            lotArrIndex === 0 ? (
                              <React.Fragment key={lotArrIndex}>
                                <StyledTableCell>
                                  {//Melting Before weight
                                    typeof lotItem.data[lotArrIndex + 1]?.ProcessSteps[0]?.AttributeValues[0]?.value === "number"
                                      ? lotItem.data[lotArrIndex + 1].ProcessSteps[0].AttributeValues[0].value.toFixed(3)
                                      : ""
                                  }
                                </StyledTableCell>

                                <StyledTableCell >

                                  {//Melting After weight
                                    lotItem.data[lotArrIndex + 1]?.ProcessSteps[1]?.AttributeValues[0]?.value
                                  }
                                </StyledTableCell>

                                {lotItem.data[lotArrIndex + 1].process_name !== "mechine" ? (
                                  <StyledTableCell>
                                    {// Scrap weight Input Box
                                      lotItem.data[lotArrIndex + 1]?.ProcessSteps[2]?.AttributeValues[0]?.value || ''
                                    }
                                  </StyledTableCell>) : ("")}

                                <StyledTableCell>
                                  {//loss Weight
                                    typeof lotItem.data[lotArrIndex + 1]?.ProcessSteps[3]?.AttributeValues[0]?.value === "number"
                                      ? lotItem.data[lotArrIndex + 1].ProcessSteps[3].AttributeValues[0].value.toFixed(3)
                                      : ""
                                  }
                                </StyledTableCell>

                              </React.Fragment>) : (" ")
                          ) : null

                        )}
                        {
                          <React.Fragment>

                            <StyledTableCell>
                              {// Wire Before Weight
                                typeof lotItem.data[2]?.ProcessSteps[0]?.AttributeValues[0]?.value === "number"
                                  ? lotItem.data[2].ProcessSteps[0].AttributeValues[0].value.toFixed(3)
                                  : ""
                              }
                            </StyledTableCell>
                            <StyledTableCell colSpan={25} />

                          </React.Fragment>

                        }

                        {
                          lotItem.data[7]?.ProcessSteps[1]?.AttributeValues.length >= 1 ? (
                            <StyledTableCell>
                              <b>{lotItem.data[0].ProcessSteps[0].AttributeValues[0].value - handleTotal(lotItem.lotid, 7, 1)}</b>
                            </StyledTableCell>
                          ) : (<StyledTableCell></StyledTableCell>)
                        }

                      </TableRow>


                      {
                        lotItem.data[2].ProcessSteps[1].AttributeValues.map((item, key) => ( //wire process Item Name
                          //
                          <TableRow key={key} >
                            <StyledTableCell colSpan={7}></StyledTableCell>
                            <StyledTableCell>
                              {lotItem.data[3]?.ProcessSteps[1]?.AttributeValues[key].item_name || ""}
                            </StyledTableCell>

                            <StyledTableCell>
                              {lotItem.data[2]?.ProcessSteps[1]?.AttributeValues[key].value}
                            </StyledTableCell>

                            {key === 0 && (
                              <>
                                <StyledTableCell rowSpan={lotItem.data[2].ProcessSteps[1].AttributeValues.length}>
                                  {
                                    lotItem.data[2]?.ProcessSteps[2]?.AttributeValues[0]?.value
                                  }
                                </StyledTableCell>
                                <StyledTableCell rowSpan={lotItem.data[2].ProcessSteps[1].AttributeValues.length} >
                                  {
                                    typeof lotItem.data[2]?.ProcessSteps[3]?.AttributeValues[0]?.value === "number"
                                      ? lotItem.data[2].ProcessSteps[3].AttributeValues[0].value.toFixed(3)
                                      : ""
                                  }
                                </StyledTableCell>
                              </>
                            )}
                            {
                              lotItem.data.map((lotArr, lotArrIndex) => (
                                lotArrIndex >= 3 ? (
                                  <React.Fragment key={key}>

                                    <StyledTableCell>
                                      {
                                        (lotItem.data[lotArrIndex].ProcessSteps[0].AttributeValues[key].value).toFixed(3)
                                      }
                                    </StyledTableCell>

                                    <StyledTableCell>
                                      {(lotItem.data[lotArrIndex]?.ProcessSteps[1]?.AttributeValues[key]?.value).toFixed(3)}
                                    </StyledTableCell>
                                    {lotItem.data[lotArrIndex]?.process_name !== "mechine" ? (
                                      <StyledTableCell >
                                        {(lotItem.data[lotArrIndex]?.ProcessSteps[2]?.AttributeValues[key]?.value)}
                                      </StyledTableCell>) : null}

                                    <StyledTableCell >
                                      {lotItem.data[lotArrIndex]?.process_name === "mechine" ? (

                                        <p> {//loss Weight Mechine
                                          typeof lotItem.data[lotArrIndex]?.ProcessSteps[2]?.AttributeValues[key]?.value === "number"
                                            ? lotItem.data[lotArrIndex].ProcessSteps[2].AttributeValues[key].value.toFixed(3)
                                            : ""
                                        }</p>

                                      ) : (
                                        <p>
                                          {//loss Weight Other

                                            typeof lotItem.data[lotArrIndex]?.ProcessSteps[3]?.AttributeValues[key]?.value === "number"
                                              ? lotItem.data[lotArrIndex].ProcessSteps[3].AttributeValues[key].value.toFixed(3)
                                              : ""
                                          }</p>

                                      )}

                                    </StyledTableCell>

                                    {lotArrIndex === 6 ? (
                                      <StyledTableCell>

                                        {
                                          typeof lotItem.data[lotArrIndex]?.ProcessSteps[4]?.AttributeValues[key]?.value === "number"
                                            ? lotItem.data[lotArrIndex].ProcessSteps[4].AttributeValues[key].value.toFixed(3)
                                            : ""
                                        }

                                      </StyledTableCell>
                                    ) : (" ")
                                    }

                                  </React.Fragment>
                                ) : (" ")
                              ))
                            }
                            {
                              //Item Different
                              lotItem.data[7]?.ProcessSteps[1]?.AttributeValues[key]?.value ?
                                (<StyledTableCell>
                                  <p style={{ fontSize: "15px" }}>{lotItem.data[2]?.ProcessSteps[1]?.AttributeValues[key]?.value - (lotItem.data[7]?.ProcessSteps[1]?.AttributeValues[key].value).toFixed(3)}</p>
                                </StyledTableCell>)
                                : (<StyledTableCell></StyledTableCell>)
                            }
                            <StyledTableCell style={{ borderTop: "2px solid white" }}></StyledTableCell>



                          </TableRow>

                        ))
                      }

                      <TableRow >
                        <StyledTableCell colSpan={7}></StyledTableCell>

                        <StyledTableCell>-</StyledTableCell>
                        {
                          lotItem.data[2].ProcessSteps[1].AttributeValues.length !== 0 ? ( //weight total
                            <StyledTableCell>{"Total:" + handleTotal(lotItem.lotid, 2, 1)}</StyledTableCell>
                          ) : (<StyledTableCell>Total:0</StyledTableCell>)
                        }
                        <StyledTableCell></StyledTableCell>
                        <StyledTableCell></StyledTableCell>


                        {
                          lotItem.data.map((item, index) => (
                            index >= 3 && index <= 7 ? (
                              <React.Fragment>
                                <StyledTableCell></StyledTableCell>

                                <StyledTableCell>
                                  {
                                    index === 7 ? (lotItem.data[7].ProcessSteps[1].AttributeValues.length !== 0 ? (
                                      "Total:" + handleTotal(lotItem.lotid, 7, 1)
                                    ) : ("")) : ("")

                                  }
                                </StyledTableCell>
                                {
                                  index !== 3 ? (<StyledTableCell></StyledTableCell>) : ("")
                                }
                                <StyledTableCell></StyledTableCell>
                                {
                                  index === 6 ? (<StyledTableCell></StyledTableCell>) : ("")
                                }

                              </React.Fragment>
                            ) : (" ")

                          ))
                        }
                        <StyledTableCell></StyledTableCell>
                        <StyledTableCell></StyledTableCell>
                      </TableRow>
                    </React.Fragment>) :
                    (
                      <React.Fragment>
                        <TableRow>
                          <StyledTableCell colSpan={11}></StyledTableCell>
                          <StyledTableCell colSpan={3} >
                            <Grid container spacing={1}>

                              <Grid container item spacing={1} >
                                <Grid item xs={6} display="flex" alignItems="center" width={200}>
                                  <TextField
                                    label="Date"
                                    value={lotItem.scarpValue.scarpDate}
                                    InputProps={{
                                      style: { fontSize: "12px" }, // this controls the input value font
                                    }}
                                    InputLabelProps={{
                                      style: { fontSize: "15px" }, // this controls the label font
                                    }}
                                    
                                  >

                                  </TextField>
                                </Grid>
                                <Grid item xs={6} >
                                  <TextField fullWidth label="ItemTotal"
                                    value={lotItem.scarpValue.itemTotal}
                                    InputProps={{
                                      style: { fontSize: "12px" }, // this controls the input value font
                                    }}
                                    InputLabelProps={{
                                      style: { fontSize: "15px" }, // this controls the label font
                                    }}

                                  />
                                </Grid>
                              </Grid>


                              <Grid container item spacing={1}>
                                <Grid item xs={6}>
                                  <TextField fullWidth value={lotItem.scarpValue?.scarp} label="Scarp" InputProps={{
                                    style: { fontSize: "12px" },
                                    // this controls the input value font
                                  }}
                                    InputLabelProps={{
                                      style: { fontSize: "15px" }, // this controls the label font
                                    }} />
                                </Grid>
                                <Grid item xs={6}>
                                  <TextField fullWidth label="Loss" value={(lotItem.scarpValue?.totalScarp).toFixed(3)} InputProps={{
                                    style: { fontSize: "12px" }, // this controls the input value font
                                  }}
                                    InputLabelProps={{
                                      style: { fontSize: "15px" }, // this controls the label font
                                    }} />
                                </Grid>
                              </Grid>
                            </Grid>
                          </StyledTableCell>
                          <StyledTableCell colSpan={19}></StyledTableCell>
                        </TableRow>
                      </React.Fragment>


                    )

                ))
              }





            </TableBody>
            <TableFooter>
              <StyledTableCell><p style={{ fontSize: "14px", fontWeight: "bold", color: "black" }}>RawGold:{calculation[0].rawGold}</p></StyledTableCell>
              <StyledTableCell><p ></p></StyledTableCell>
              {
                calculation[2].process.map((item, key) => (
                  <>

                    <StyledTableCell></StyledTableCell>

                    <StyledTableCell>
                      <p style={{ fontSize: "14px", fontWeight: "bold", color: "black" }}>
                        {item.processName === 'Finishing' ? `${(item.Weight[1].aw).toFixed(3)}` : ""}
                      </p>
                    </StyledTableCell>
                    {item.processName === 'Wire' ? (
                      <>
                        <StyledTableCell></StyledTableCell>

                      </>) : ("")}
                    {
                      item.processName !== "Machine" ? (<StyledTableCell><p style={{ fontSize: "14px", fontWeight: "bold", color: "black" }}>{(item.Weight[2].sw).toFixed(3)}</p></StyledTableCell>) : ("")
                    }
                    <StyledTableCell><p style={{ fontSize: "14px", fontWeight: "bold", color: "black" }}>{item.processName === "Machine" ? (item.Weight[2].lw).toFixed(3) : (item.Weight[3].lw).toFixed(3)}</p></StyledTableCell>
                    {
                      item.processName === "Cutting" ? (<StyledTableCell><p style={{ fontSize: "14px", fontWeight: "bold", color: "black" }}>{(item.Weight[4].pw).toFixed(3)}</p></StyledTableCell>) : ("")
                    }



                  </>
                ))
              }
              <StyledTableCell></StyledTableCell>
              <StyledTableCell><p style={{ fontSize: "14px", fontWeight: "bold", color: "black" }}>{(calculation[3].lotTotal).toFixed(3)}</p></StyledTableCell>
            </TableFooter>
          </Table>

        </div>
  
      


    </>
  );
}

export default DailyReport;
