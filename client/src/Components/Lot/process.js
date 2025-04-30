import React, { useState, useEffect, use } from "react";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField, Button, Box, Modal, Typography, colors, TableFooter, Autocomplete } from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { createLot, getAllLot, saveLot, getLotDatewise, getProductName } from "../../Api/processTableApi";
import { styled } from "@mui/material/styles";
import { processStepId } from "../../ProcessStepId/processStepId";
import { useRef } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { DownloadTableExcel } from 'react-export-table-to-excel';
import autoTable from "jspdf-autotable";
import "jspdf-autotable";

const processes = ["Melting", "Kambi", "Wire", "Machine", "Soldrine", "Joint", "Cutting", "Finishing",];
const StyledTableCell = styled(TableCell)({ border: "1px solid #ccc", textAlign: "center", padding: "8px" });
const StyledTableContainer = styled(TableContainer)({ margin: "20px auto", maxWidth: "100%", border: "1px solid #ccc" });
const StyledInput = styled(TextField)({ "& .MuiOutlinedInput-notchedOutline": { border: "none" }, "& .MuiInputBase-input": { textAlign: "center", padding: "5px" }, width: "80px" });

const ProcessTable = () => {
  const [data, setData] = useState([]);
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [initialWeight, setInitialWeight] = useState("");
  const [touchValue, setTouchValue] = useState("");
  const [isLotCreated, setIsLotCreated] = useState(false);
  const [fromDate, setFromDate] = useState("")
  const [toDate, setToDate] = useState("")
  const [calculation, setCalculation] = useState([
    { rawGold: 0 },
    { touchValue: 0 },
    {
      process: [
        { processName: "Melting", Weight: [{ bw: 0 }, { aw: 0 }, { sw: 0 }, { lw: 0 }] },
        { processName: "Kambi", Weight: [{ bw: 0 }, { aw: 0 }, { sw: 0 }, { lw: 0 }] },
        { processName: "Wire", Weight: [{ bw: 0 }, { aw: 0 }, { sw: 0 }, { lw: 0 }] },
        { processName: "Machine", Weight: [{ bw: 0 }, { aw: 0 }, { sw: 0 }, { lw: 0 }] },
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
  const [productName, setProductName] = useState([])

  const docalculation = (arrayItems) => {
    // Calculation
    const tempData = [...arrayItems];
    let lotTotal = tempData.reduce((acc, item) => acc + item.data[0].ProcessSteps[0].AttributeValues[0].value, 0)
    const tempCalculation = [...calculation];//over lot all raw gold total
    tempCalculation[0].rawGold = lotTotal;

    let finishTotal = 0;
    tempData.forEach((lotData, lotIndex) => {// lot wise finishing(After weight on finishing process) total
      if (lotData.data[8].ProcessSteps[1].AttributeValues.length != 0) {
        lotData.data[8].ProcessSteps[1].AttributeValues.forEach((arrItem, arrIndex) => {
          finishTotal += arrItem.value
        })
      }
    })
    tempCalculation[2].process[7].Weight[1].aw = finishTotal
    console.log('finishTotal', finishTotal)

    let finsihAfterValue = 0;
    let lotFinishValue = 0;
    tempData.forEach((lotData, lotIndex) => {// this calculation for lotDifferent Total

      if (lotData.data[8].ProcessSteps[1].AttributeValues.length === 0) {
        finsihAfterValue = 0;
      } else {
        lotData.data[8].ProcessSteps[1].AttributeValues.forEach((arrItem, arrIndex) => {
          finsihAfterValue += arrItem.value

        })
        lotFinishValue += lotData.data[0].ProcessSteps[0].AttributeValues[0].value - finsihAfterValue
        finsihAfterValue = 0;
      }
    })
    tempCalculation[3].lotTotal = lotFinishValue

    //calculation for total scarp value and loss total
    for (let i = 1; i <= 8; i++) {
      let scarpTotal = 0, lossTotal = 0, pureTotal = 0;
      let innerScarp = 0, innerLoss = 0, innerPure = 0;
      for (let j = 0; j < tempData.length; j++) {
        if (tempData[j].data[i].ProcessSteps[2].AttributeValues.length !== 0) {

          tempData[j].data[i].ProcessSteps[2].AttributeValues.forEach((attrItem, attrIndex) => {
            if (i == 7) {
              innerPure += tempData[j].data[i].ProcessSteps[4].AttributeValues[attrIndex].value
            }
            innerScarp += tempData[j].data[i].ProcessSteps[2].AttributeValues[attrIndex].value
            innerLoss += tempData[j].data[i].ProcessSteps[3].AttributeValues[attrIndex].value
          })
        }
      }
      scarpTotal += innerScarp;
      lossTotal += innerLoss;
      pureTotal += innerPure;

      tempCalculation[2].process[i - 1].Weight[2].sw = scarpTotal
      tempCalculation[2].process[i - 1].Weight[3].lw = lossTotal
      if (i === 7) {
        tempCalculation[2].process[6].Weight[4].pw = pureTotal
      }
      console.log('tempCalculation for scw,losw', tempCalculation)
    }
    return tempCalculation
  }

  const handleWeightChange = (index, process, field, value) => {
    const updatedItems = [...items];
    if (!updatedItems[index].data[process]) {
      updatedItems[index].data[process] = { beforeWeight: "", afterWeight: "" };
    }
    updatedItems[index].data[process][field] = value;
    setItems(updatedItems);
  };

  const handleInitialChange = (lotid, index, value) => {
    console.log(value)
    const tempData = [...items];
    const lotData = tempData.filter((item, index) => item.lotid === lotid);
    console.log('touch', lotData[0].data[0].ProcessSteps[0].AttributeValues[0].value)
    lotData[0].data[0].ProcessSteps[0].AttributeValues[0].value = parseFloat(value);
    lotData[0].data[1].ProcessSteps[0].AttributeValues[0].value = parseFloat(value);
    tempData.splice(index, 1, lotData[0]);
    setItems(tempData)
    console.log('itemsData', items)
  }

  const handleTouchChange = (lotid, index, value) => {
    console.log(value)
    const tempData = [...items];
    const lotData = tempData.filter((item, index) => item.lotid === lotid);
    console.log('lotData from function', lotData)
    console.log('touch', lotData[0].data[0].ProcessSteps[0].AttributeValues[0].touchValue);
    lotData[0].data[0].ProcessSteps[0].AttributeValues[0].touchValue = parseFloat(value);
    //when user change touch value that time also we need to change pure weight
    if (lotData[0].data[7].ProcessSteps[2].AttributeValues.length != 0) {
      lotData[0].data[7].ProcessSteps[2].AttributeValues.forEach((item, index) => {
        lotData[0].data[7].ProcessSteps[4].AttributeValues[index].value = lotData[0].data[0].ProcessSteps[0].AttributeValues[0].touchValue * lotData[0].data[7].ProcessSteps[2].AttributeValues[index].value / 100
      })
    }
    tempData.splice(index, 1, lotData[0]);
    setItems(tempData)
    console.log('itemsData', items)

  };
  const findProcessStep = (process_id, attribute_id) => {
    for (let i = 0; i < processStepId.length; i++) {
      for (let j = 0; j < processStepId[i].length; j++) {
        if (processStepId[i][j].process_id === process_id && processStepId[i][j].attribute_id === attribute_id) {
          return processStepId[i][j].process_step_id;
        }
      }
    }
    return null; // Return null if no match is found
  };


  const handleSingleItem = (index, lotid, process_id, attribute_id, value, lotIndex) => {
    const tempData = [...items];
    const lotData = tempData.filter((item, index) => item.lotid === lotid);
    console.log('handelSingleItem', index + 1, lotid, process_id, attribute_id, value);

    if (process_id === 2) { //Melting Processs
      if (attribute_id === 3) {
        const obj = {
          lot_id: lotid,
          process_step_id: findProcessStep(process_id, attribute_id),
          // item_name: lotData.data[index].ProcessSteps[0].AttributeValues[0].item_name,
          attribute_id: attribute_id,
          items_id: lotData[0].data[0].ProcessSteps[0].AttributeValues[0].items_id,
          value: parseFloat(value)
        }
        if (lotData[0].data[index + 1].ProcessSteps[1].AttributeValues.length === 0) {
          lotData[0].data[index + 1].ProcessSteps[1].AttributeValues.push(obj);
          const nextProcessObj = {
            lot_id: lotid,
            process_step_id: 6,
            items_id: lotData[0].data[0].ProcessSteps[0].AttributeValues[0].items_id,
            // item_name:lotData.data[index].ProcessSteps[0].AttributeValues[0].item_name,
            attribute_id: 2,
            value: parseFloat(value)
          }
          lotData[0].data[2].ProcessSteps[0].AttributeValues.push(nextProcessObj);

          tempData.splice(lotIndex, 1, lotData[0]);
          setItems(tempData)
        } else { //Melting Process After Weight Update
          lotData[0].data[index + 1].ProcessSteps[1].AttributeValues[0].value = parseFloat(value);
          lotData[0].data[2].ProcessSteps[0].AttributeValues[0].value = parseFloat(value);
          tempData.splice(lotIndex, 1, lotData[0]);
          setItems(tempData)
        }
      }
      else if (attribute_id === 4) {// Melting Process Scrap Value Insert
        const obj = {
          lot_id: lotid,
          process_step_id: findProcessStep(process_id, attribute_id),
          // item_name: lotData.data[index].ProcessSteps[0].AttributeValues[0].item_name,
          attribute_id: attribute_id,
          items_id: lotData[0].data[0].ProcessSteps[0].AttributeValues[0].items_id,
          value: value
        }


        if (lotData[0].data[index + 1].ProcessSteps[2].AttributeValues.length === 0) {
          lotData[0].data[index + 1].ProcessSteps[2].AttributeValues.push(obj);
          const lossObj = {
            lot_id: lotid,
            process_step_id: 5,
            items_id: lotData[0].data[0].ProcessSteps[0].AttributeValues[0].items_id,
            attribute_id: 2,
            value: lotData[0].data[index + 1].ProcessSteps[0].AttributeValues.length === 1 && lotData[0].data[index + 1].ProcessSteps[1].AttributeValues.length === 1 ? (lotData[0].data[index + 1].ProcessSteps[0].AttributeValues[0].value - lotData[0].data[index + 1].ProcessSteps[1].AttributeValues[0].value) - value : 0
          }
          lotData[0].data[index + 1].ProcessSteps[3].AttributeValues.push(lossObj);
          tempData.splice(lotIndex, 1, lotData[0]);
          setItems(tempData)
        } else {// Melting Process ScrapValue Update
          lotData[0].data[index + 1].ProcessSteps[2].AttributeValues[0].value = parseFloat(value);
          if (lotData[0].data[index + 1].ProcessSteps[0].AttributeValues.length === 1 && lotData[0].data[index + 1].ProcessSteps[1].AttributeValues.length === 1) {
            lotData[0].data[index + 1].ProcessSteps[3].AttributeValues[0].value = (lotData[0].data[index + 1].ProcessSteps[0].AttributeValues[0].value - lotData[0].data[index + 1].ProcessSteps[1].AttributeValues[0].value) - parseFloat(value)
          }

          tempData.splice(lotIndex, 1, lotData[0]);
          setItems(tempData)
        }
      }
    }//Melting ProcessEnd
    else {
      //Kambi Process Start
      if (attribute_id === 3) {//Kambi Process Insert Value
        const obj = {
          lot_id: lotid,
          process_step_id: findProcessStep(process_id, attribute_id),
          items_id: lotData[0].data[0].ProcessSteps[0].AttributeValues[0].items_id,
          // item_name: lotData.data[index].ProcessSteps[0].AttributeValues[0].item_name,
          attribute_id: attribute_id,
          value: value
        }
        if (lotData[0].data[index + 1].ProcessSteps[1].AttributeValues.length === 0) {
          lotData[0].data[index + 1].ProcessSteps[1].AttributeValues.push(obj);
          tempData.splice(lotIndex, 1, lotData[0]);
          setItems(tempData)
        } else {
          lotData[0].data[index + 1].ProcessSteps[1].AttributeValues[0].value = parseFloat(value);
          tempData.splice(lotIndex, 1, lotData[0]);
          setItems(tempData)
          console.log('kambi', items)
        }//Kambi Process End
      } else if (attribute_id === 4) {// Kambi Process Scrap Value Insert
        const obj = {
          lot_id: lotid,
          process_step_id: findProcessStep(process_id, attribute_id),
          // item_name: lotData.data[index].ProcessSteps[0].AttributeValues[0].item_name,
          attribute_id: attribute_id,
          items_id: lotData[0].data[0].ProcessSteps[0].AttributeValues[0].items_id,
          value: value
        }
        if (lotData[0].data[index + 1].ProcessSteps[2].AttributeValues.length === 0) {
          lotData[0].data[index + 1].ProcessSteps[2].AttributeValues.push(obj);
          const lossObj = {
            lot_id: lotid,
            process_step_id: 9,
            items_id: lotData[0].data[0].ProcessSteps[0].AttributeValues[0].items_id,
            attribute_id: 2,
            value: lotData[0].data[index + 1].ProcessSteps[0].AttributeValues.length === 1 && lotData[0].data[index + 1].ProcessSteps[1].AttributeValues.length === 1 ? (lotData[0].data[index + 1].ProcessSteps[0].AttributeValues[0].value - lotData[0].data[index + 1].ProcessSteps[1].AttributeValues[0].value) - value : 0
          }
          lotData[0].data[index + 1].ProcessSteps[3].AttributeValues.push(lossObj);

          tempData.splice(lotIndex, 1, lotData[0]);
          setItems(tempData)
        } else {// Kambi Process ScrapValue Update
          lotData[0].data[index + 1].ProcessSteps[2].AttributeValues[0].value = parseFloat(value);
          if (lotData[0].data[index + 1].ProcessSteps[0].AttributeValues.length === 1 && lotData[0].data[index + 1].ProcessSteps[1].AttributeValues.length === 1) {
            lotData[0].data[index + 1].ProcessSteps[3].AttributeValues[0].value = (lotData[0].data[index + 1].ProcessSteps[0].AttributeValues[0].value - lotData[0].data[index + 1].ProcessSteps[1].AttributeValues[0].value) - parseFloat(value)
          }
          tempData.splice(lotIndex, 1, lotData[0]);
          setItems(tempData)
        }
      }
    }
  }

  const handleAddItemColumns = (lotid, index) => {
    console.log('lotid', lotid);
    const tempData = [...items];
    const lotData = tempData.filter((item, index) => item.lotid === lotid);
    let processstepid = 10;
    for (let i = 3; i <= 8; i++) {
      for (let j = 1; j <= 4; j++) {
        if (processstepid === 30) {
          ++processstepid;//its used For CuttingProcessPureWeight
        }
        const obj = {
          lot_id: lotid,
          process_step_id: processstepid,
          item_name: " ",
          items_id: null,
          attribute_id: j + 1,
          value: null,
          touchValue: null,
          index: null,
          master_jewel_id: null
        }
        lotData[0].data[i].ProcessSteps[j - 1].AttributeValues.push(obj)
        ++processstepid;
      }

    }
    processstepid = 10

    const obj = {
      lot_id: lotid,
      process_step_id: 30,
      item_name: " ",
      items_id: null,
      attribute_id: 6,
      touchValue: null,
      value: null,
      index: null,
      master_jewel_id: null
    }
    lotData[0].data[7].ProcessSteps[4].AttributeValues.push(obj)

    tempData.splice(index, 1, lotData[0]);
    console.log('tempDate Data Push', tempData);
    setItems(tempData);
    console.log('items', items);
  };
  const handleChildItemName = (lotid, childIndex, itemName, lotIndex, master_jewel_id, touchValue) => {

    const tempData = [...items];
    const lotData = tempData.filter((item, index) => item.lotid === lotid);

    for (let i = 3; i <= 8; i++) {//this create childItem name Each Process and store jewelItem also
      for (let j = 0; j <= 3; j++) {
        lotData[0].data[i].ProcessSteps[j].AttributeValues[childIndex].item_name = String(itemName);
        lotData[0].data[i].ProcessSteps[j].AttributeValues[childIndex].master_jewel_id = master_jewel_id;
        lotData[0].data[i].ProcessSteps[j].AttributeValues[childIndex].touchValue = touchValue;
      }
    }
    //Store Item name and Item id to PureWeight
    lotData[0].data[7].ProcessSteps[4].AttributeValues[childIndex].item_name = String(itemName);
    lotData[0].data[7].ProcessSteps[4].AttributeValues[childIndex].master_jewel_id = master_jewel_id;
    lotData[0].data[7].ProcessSteps[4].AttributeValues[childIndex].touchValue = touchValue;
    for (let i = 3; i <= 8; i++) {//this create Index  Each Process
      if (i === 7) {
        lotData[0].data[i].ProcessSteps[4].AttributeValues[childIndex].index = childIndex
      }
      for (let j = 0; j <= 3; j++) {
        lotData[0].data[i].ProcessSteps[j].AttributeValues[childIndex].index = childIndex
      }
    }

    tempData.splice(lotIndex, 1, lotData[0]);
    setItems(tempData);
    console.log('items', items);
  }

  const handleChildItemWeight = (lotid, childIndex, itemWeight, lotIndex) => {
    const tempData = [...items];
    const lotData = tempData.filter((item, index) => item.lotid === lotid);
    lotData[0].data[3].ProcessSteps[0].AttributeValues[childIndex].value = parseFloat(itemWeight);
    lotData[0].data[3].ProcessSteps[0].AttributeValues[childIndex].index = childIndex

    tempData.splice(lotIndex, 1, lotData[0]);
    setItems(tempData);
    console.log('items', items);
  }

  const handleCreateLot = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSave = async () => {
    try {
      const response = await createLot(initialWeight, touchValue); // Response is an object
      console.log("API Response:", response); // Check structure
      setItems((prevItems) => [...prevItems, response]); // Ensure prevItems is an array
      setInitialWeight("");
      setTouchValue("");// Clear input field
      setOpen(false);
      setIsLotCreated(true);
      toast.success("Lot Created", { autoClose: 2000 });
    } catch (error) {
      console.error("Error creating lot:", error);
    }
  };

  const calculateTotal = (items, process, field) => {
    return items
      .reduce((total, item) => {
        const value = parseFloat(item.data[process]?.[field] || 0);
        return total + (isNaN(value) ? 0 : value);
      }, 0)
      .toFixed(2);
  };
  // console.log("Processes:", processes);

  const handleSaveData = async () => {
    console.log('handleSaveData', items);
    const res = await saveLot(items);
    console.log('res from save function', res.data.data)
    setItems(res.data.data)
    setCalculation(docalculation(res.data.data))
    toast.success("Lot Saved", { autoClose: 2000 });

  }
  const allData = async () => {
    const res = await getAllLot();
    console.log('useEffect data', res);
    setItems(res)
    setCalculation(docalculation(res))
    console.log('after calculation', calculation);
  }
  const getProduct = async () => {
    const res = await getProductName();
    console.log('getProductName', res);
    setProductName(res)

  }
  const handleChildItems = (lotIndex, lotid, attribute_id, value, key, process_id, lotArrIndex) => {
    const tempData = [...items];
    const lotData = tempData.filter((item, index) => item.lotid === lotid);
    console.log('child fun', lotIndex, lotid, attribute_id, value, key, process_id)
    if (process_id <= 8) {


      // child Items Value Carry Forward here!!!
      if (attribute_id === 3) { //child item After weight Update
        lotData[0].data[lotArrIndex].ProcessSteps[1].AttributeValues[key].value = parseFloat(value);
        lotData[0].data[lotArrIndex].ProcessSteps[1].AttributeValues[key].index = key
        lotData[0].data[lotArrIndex + 1].ProcessSteps[0].AttributeValues[key].value = parseFloat(value);
        lotData[0].data[lotArrIndex + 1].ProcessSteps[0].AttributeValues[key].index = key

        tempData.splice(lotIndex, 1, lotData[0]);
        setItems(tempData);
        console.log('items', items);
      } else if (attribute_id === 4) {//child item Scarp weight Update
        lotData[0].data[lotArrIndex].ProcessSteps[2].AttributeValues[key].value = parseFloat(value);
        lotData[0].data[lotArrIndex].ProcessSteps[2].AttributeValues[key].index = key;
        lotData[0].data[lotArrIndex].ProcessSteps[3].AttributeValues[key].value = (lotData[0].data[lotArrIndex].ProcessSteps[0].AttributeValues[key].value - lotData[0].data[lotArrIndex].ProcessSteps[1].AttributeValues[key].value) - value
        lotData[0].data[lotArrIndex].ProcessSteps[3].AttributeValues[key].index = key;
        if (process_id === 8) {//Pure Weight Calculation
          if (lotData[0].data[lotArrIndex].ProcessSteps[2].AttributeValues[key].value) {
            lotData[0].data[lotArrIndex].ProcessSteps[4].AttributeValues[key].value = lotData[0].data[0].ProcessSteps[0].AttributeValues[0].touchValue * lotData[0].data[lotArrIndex].ProcessSteps[2].AttributeValues[key].value / 100
            lotData[0].data[lotArrIndex].ProcessSteps[4].AttributeValues[key].index = key
          }
        }
        tempData.splice(lotIndex, 1, lotData[0]);
        console.log('lossCalculation', tempData);
        setItems(tempData);
      }

    } else { //last process after weight
      if (process_id === 9) {

        if (attribute_id === 3) {
          lotData[0].data[lotArrIndex].ProcessSteps[1].AttributeValues[key].value = parseFloat(value);
          lotData[0].data[lotArrIndex].ProcessSteps[1].AttributeValues[key].index = key

          tempData.splice(lotIndex, 1, lotData[0]);
          setItems(tempData);
          console.log('items', items);
        } else if (attribute_id === 4) {
          lotData[0].data[lotArrIndex].ProcessSteps[2].AttributeValues[key].value = parseFloat(value);
          lotData[0].data[lotArrIndex].ProcessSteps[2].AttributeValues[key].index = key;
          lotData[0].data[lotArrIndex].ProcessSteps[3].AttributeValues[key].value = (lotData[0].data[lotArrIndex].ProcessSteps[0].AttributeValues[key].value - lotData[0].data[lotArrIndex].ProcessSteps[1].AttributeValues[key].value) - value
          lotData[0].data[lotArrIndex].ProcessSteps[3].AttributeValues[key].index = key;
          tempData.splice(lotIndex, 1, lotData[0]);
          setItems(tempData);
        }
      }
    }

  }

  const handleTotal = (lotid, lotProcessId, processId) => {
    const tempData = [...items];
    const lotData = tempData.filter((item, index) => item.lotid === lotid);

    const totalValue = lotData[0]?.data[lotProcessId]?.ProcessSteps[processId]?.AttributeValues.reduce(
      (acc, item) => acc + item.value,
      0
    );

    return totalValue;
  }
  const handleChildItemTotal = (name, key, processid) => {

    const tempData = [...items];
    let finalTotal = 0;

    tempData.forEach((lotItem, lotItemIndex) => {
      if (lotItem.data[key + 1].ProcessSteps[processid].AttributeValues.length === 0) {
        finalTotal += 0
      } else {
        lotItem.data[key + 1].ProcessSteps[processid].AttributeValues.forEach((arrItem, arrIndex) => {
          finalTotal += arrItem.value;
        })
      }
    })
    const tempCalculation = [...calculation];
    let process = tempCalculation[2].process.filter((item) => item.processName === name);
    process[0].Weight[processid] = finalTotal;

  }
  const handleTotalFinsh = () => {
    let tempData = [...items]
    let finishTotal = 0;
    tempData.forEach((lotData, lotIndex) => {
      if (lotData.data[8].ProcessSteps[1].AttributeValues.length === 0) {
        return finishTotal;
      } else {
        lotData.data[8].ProcessSteps[1].AttributeValues.forEach((arrItem, arrIndex) => {
          finishTotal += arrItem.value
        })
      }
    })
    return finishTotal

  }
  const handleTotalLot = () => {
    let tempData = [...items]
    let finishTotal = 0;
    let lotTotal = 0;

    tempData.forEach((lotData, lotIndex) => {
      if (lotData.data[8].ProcessSteps[1].AttributeValues.length === 0) {
        return finishTotal;
      } else {
        lotData.data[8].ProcessSteps[1].AttributeValues.forEach((arrItem, arrIndex) => {
          finishTotal += arrItem.value

        })
        lotTotal += lotData.data[0].ProcessSteps[0].AttributeValues[0].value - finishTotal
        finishTotal = 0;
      }
    })
    return lotTotal

  }
  const handleDifference = (kambiWeight, lotid, lotProcessId, processId) => {
    const tempData = [...items];
    const lotData = tempData.filter((item, index) => item.lotid === lotid);

    const totalValue = lotData[0]?.data[lotProcessId]?.ProcessSteps[processId]?.AttributeValues.reduce(
      (acc, item) => acc + item.value,
      0
    );
    const differValue = kambiWeight - totalValue;

    return differValue;


  }
  const handleLotTotal = () => {
    const tempData = [...items];
    let lotTotal = tempData.reduce((acc, item) => acc + item.data[0].ProcessSteps[0].AttributeValues[0].value, 0)
    return lotTotal;
  }

  const handleDateWiseFilter = async () => {
    try {
      console.log('fromDate', fromDate);
      console.log('toDate', toDate);


      if (fromDate > toDate) {
        alert('Your Date Order was Wrong');
        return;
      }

      const res = await getLotDatewise(fromDate, toDate);
      console.log('DateWiseFilter', res.data.data);
      setItems(res.data.data)
      setCalculation(docalculation(res.data.data))
      getProduct()
      console.log('itemsAfterDateWiseFilter', items);
    } catch (error) {
      console.error('Error fetching data by date:', error.message);
      alert('Select Date First.');
    }
  };
  useEffect(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
    const day = String(today.getDate()).padStart(2, '0');
  
    const currentDate = `${year}-${month}-${day}`;
    console.log('currentDate', currentDate);
    
    setFromDate(currentDate);
    setToDate(currentDate);
  }, []);
  


  useEffect(() => {
    allData()
    getProduct()

  }, [])
  // useEffect(()=>{
  //   setCalculation(docalculation(items))
  // },[items])

  const billRef = useRef(null);

  const handleDownloadPdf = async () => {
    const input = billRef.current;

    if (!input) return;

    // Temporarily expand scrollable area
    const originalHeight = input.style.height;
    const originalOverflow = input.style.overflow;

    input.style.height = "auto";         // allow full height
    input.style.overflow = "visible";    // make all content visible

    // Give DOM time to update
    await new Promise(resolve => setTimeout(resolve, 100));

    const canvas = await html2canvas(input, {
      scale: 2,
      useCORS: true,
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    const imgProps = pdf.getImageProperties(imgData);
    const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, "PNG", 0, position, pdfWidth, imgHeight);
    heightLeft -= pdfHeight;

    while (heightLeft > 0) {
      position -= pdfHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, pdfWidth, imgHeight);
      heightLeft -= pdfHeight;
    }

    pdf.save(`Bill-Generated.pdf`);

    // Restore original styles
    input.style.height = originalHeight;
    input.style.overflow = originalOverflow;
  };


  // const exportToExcel = () => {
  //   const table = billRef.current;
  //   const workbook = XLSX.utils.table_to_book(table, { sheet: "Sheet1" });
  //   const excelBuffer = XLSX.write(workbook, {
  //     bookType: "xlsx",
  //     type: "array"
  //   });
  //   const data = new Blob([excelBuffer], { type: "application/octet-stream" });
  //   saveAs(data, "ProcessDetails.xlsx");
  // };

  const exportToExcel = () => {
    const tableElement = tableRef.current;

    if (!tableElement) {
      console.error("Table element not found");
      return;
    }

    const workbook = XLSX.utils.table_to_book(tableElement, {
      sheet: "Sheet1"
    });

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array"
    });

    const data = new Blob([excelBuffer], { type: "application/octet-stream" });

    saveAs(data, "ProcessDetails.xlsx");
  };
  const tableRef = useRef(null);

  return (
    <Box sx={{ padding: "20px" }} ref={billRef}>
      <Box sx={{ textAlign: "right", marginBottom: "10px" }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleCreateLot}
          sx={{ marginRight: "10px" }}

        >
          AddItem
        </Button>
        <Button
          variant="contained"
          color="secondary"
          onClick={handleSaveData}
          sx={{ marginRight: "10px" }}

        >
          Save
        </Button>

      </Box>
      {/* DateWiseFilter */}

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
          <Button variant="contained" onClick={() => { handleDateWiseFilter() }}>Filter</Button>
        </div>
      </div>


      <StyledTableContainer component={Paper}>
        <div ref={tableRef}>
          {/* <Table> */}
          <Table >
            <TableHead>
              <TableRow>
                <StyledTableCell>
                  <b>Raw Gold</b>
                </StyledTableCell>
                <StyledTableCell>
                  <b>Touch</b>
                </StyledTableCell>
                {processes.map((process) => {
                  let colSpanValue = 4;

                  if (process === "Kambi") {
                    colSpanValue = 8;
                  } else if (process === "Cutting") {
                    colSpanValue = 5;
                  }

                  return (
                    <StyledTableCell key={process} colSpan={colSpanValue}>
                      <b>{process}</b>
                    </StyledTableCell>
                  );
                })}


                <StyledTableCell>
                  <b>Item Diffrent</b>
                </StyledTableCell>
                <StyledTableCell>
                  <b>Total Diffrent</b>
                </StyledTableCell>


              </TableRow>
              <TableRow>
                <StyledTableCell colSpan={2} />
                {processes.map((process) => (
                  <React.Fragment key={process}>
                    <StyledTableCell>
                      <b>Before</b>
                    </StyledTableCell>
                    <StyledTableCell>
                      <b>After</b>
                    </StyledTableCell>
                    <StyledTableCell>
                      <b>Scarp</b>
                    </StyledTableCell>
                    <StyledTableCell>
                      <b>Loss</b>
                    </StyledTableCell>
                    {
                      process === "Cutting" && (
                        <StyledTableCell>
                          <b>Scarp Pure</b>
                        </StyledTableCell>
                      )
                    }

                    {process === "Kambi" && (
                      <>
                        <StyledTableCell>
                          <b>Action</b>
                        </StyledTableCell>

                      </>
                    )}
                    {process === "Kambi" && (
                      <>

                        <StyledTableCell>
                          <b>Name</b>
                        </StyledTableCell>
                        <StyledTableCell>
                          <b>Weight</b>
                        </StyledTableCell>
                        <StyledTableCell>
                          <b>Diffrent</b>
                        </StyledTableCell>
                      </>
                    )}
                  </React.Fragment>
                ))}
                <StyledTableCell />
                <StyledTableCell />


              </TableRow>
            </TableHead>
            <TableBody >
              {
                items.map((lotItem, lotIndex) => (
                  <React.Fragment key={lotIndex} >
                    <TableRow >
                      <StyledTableCell>

                        <StyledInput
                          value={//RawGold Input Box
                            typeof lotItem.data[0].ProcessSteps[0].AttributeValues[0].value === "number"
                              ? lotItem.data[0].ProcessSteps[0].AttributeValues[0].value.toFixed(3)
                              : ""
                          }
                          onChange={(e) =>
                            handleInitialChange(lotItem.lotid, lotIndex, e.target.value)
                          }
                          type="number"
                          style={{ width: "120px" }}
                        />


                      </StyledTableCell>
                      <StyledTableCell>
                        <StyledInput
                          value={lotItem.data[0].ProcessSteps[0].AttributeValues[0].touchValue || " "}
                          onChange={(e) => {
                            handleTouchChange(lotItem.lotid, lotIndex, e.target.value)
                          }}
                          type="number"
                          style={{ width: "120px" }}
                        />
                      </StyledTableCell>

                      {lotItem.data.map((lotArr, lotArrIndex) =>
                        lotItem.data[lotArrIndex + 1] && lotItem.data[lotArrIndex + 1].ProcessSteps ? (
                          lotArrIndex >= 0 && lotArrIndex <= 1 ? (
                            <React.Fragment key={lotArrIndex}>
                              <StyledTableCell>
                                <StyledInput //Before Weight
                                  value={
                                    typeof lotItem.data[lotArrIndex + 1]?.ProcessSteps[0]?.AttributeValues[0]?.value === "number"
                                      ? lotItem.data[lotArrIndex + 1].ProcessSteps[0].AttributeValues[0].value.toFixed(3)
                                      : ""
                                  }
                                  style={{ width: "120px" }}
                                />

                              </StyledTableCell>

                              <StyledTableCell >
                                <StyledInput // After weight
                                  value={
                                    lotItem.data[lotArrIndex + 1]?.ProcessSteps[1]?.AttributeValues[0]?.value || ''
                                  }
                                  onChange={(e) => handleSingleItem(lotArrIndex, lotItem.lotid,
                                    lotItem.data[lotArrIndex + 1]?.ProcessSteps[1]?.process_id,
                                    lotItem.data[lotArrIndex + 1]?.ProcessSteps[1]?.AttributeInfo.attribute_id,
                                    e.target.value, lotIndex)}
                                  type="number"

                                  style={{ width: "120px" }}
                                />
                              </StyledTableCell>


                              <StyledTableCell>
                                <StyledInput // Scrap weight Input Box
                                  value={
                                    lotItem.data[lotArrIndex + 1]?.ProcessSteps[2]?.AttributeValues[0]?.value || ''
                                  }
                                  onChange={(e) => handleSingleItem(lotArrIndex, lotItem.lotid,
                                    lotItem.data[lotArrIndex + 1]?.ProcessSteps[2]?.process_id,
                                    lotItem.data[lotArrIndex + 1]?.ProcessSteps[2]?.AttributeInfo.attribute_id,
                                    e.target.value, lotIndex)}
                                  type="number"

                                  style={{ width: "120px" }}
                                />
                              </StyledTableCell>

                              <StyledTableCell>

                                <StyledInput //loss Weight
                                  value={
                                    typeof lotItem.data[lotArrIndex + 1]?.ProcessSteps[3]?.AttributeValues[0]?.value === "number"
                                      ? lotItem.data[lotArrIndex + 1].ProcessSteps[3].AttributeValues[0].value.toFixed(3)
                                      : ""
                                  }
                                  style={{ width: "120px" }}
                                />
                              </StyledTableCell>

                              {lotItem.data[lotArrIndex + 1].process_name === "kambi" && <StyledTableCell> <Button
                                variant="contained"
                                color="secondary"
                                size="small"  // Makes the button smaller
                                onClick={() => handleAddItemColumns(lotItem.lotid, lotIndex)}
                                style={{ minWidth: "32px", padding: "4px" }} // Small button
                              >
                                <AddIcon fontSize="small" /> {/* Small-sized icon */}
                              </Button></StyledTableCell>}
                              {lotItem.data[lotArrIndex + 1].process_name === "kambi" && <StyledTableCell colSpan={28} />}

                            </React.Fragment>) : (" ")
                        ) : null

                      )}
                      <StyledTableCell></StyledTableCell>
                      {
                        lotItem.data[8]?.ProcessSteps[1]?.AttributeValues.length >= 1 ? (
                          <StyledTableCell>
                            <b>{lotItem.data[0].ProcessSteps[0].AttributeValues[0].value - handleTotal(lotItem.lotid, 8, 1)}</b>
                          </StyledTableCell>
                        ) : (<StyledTableCell></StyledTableCell>)
                      }


                    </TableRow>


                    {
                      lotItem.data[3].ProcessSteps[0].AttributeValues.map((item, key) => (
                        //
                        <TableRow key={key} >
                          <StyledTableCell colSpan={11}></StyledTableCell>
                          <Autocomplete
                            style={{ margin: "10px" }}
                            options={productName}
                            getOptionLabel={(option) => option.jewel_name || ""}
                            value={{
                              jewel_name: lotItem.data[3]?.ProcessSteps[0]?.AttributeValues[key].item_name || "",
                              master_jewel_id: lotItem.data[3]?.ProcessSteps[0]?.AttributeValues[key].master_jewel_id || "",
                            }}
                            onChange={(event, newValue) => {
                              if (newValue) {
                                handleChildItemName(
                                  lotItem.lotid,
                                  key,
                                  newValue.jewel_name,
                                  lotIndex,
                                  newValue.master_jewel_id,
                                  lotItem.data[0]?.ProcessSteps[0]?.AttributeValues[0].touchValue
                                );
                              }
                            }}
                            isOptionEqualToValue={(option, value) =>
                              option.master_jewel_id === value.master_jewel_id
                            }
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                label="Select Item"
                                size="small"
                                sx={{ width: "150px", fontSize: "14px" }}
                              />
                            )}
                          />

                          <StyledTableCell>
                            <StyledInput
                              value={lotItem.data[3]?.ProcessSteps[0]?.AttributeValues[key].value}
                              placeholder="Weight"
                              onChange={(e) => { handleChildItemWeight(lotItem.lotid, key, e.target.value, lotIndex) }}
                              type="number" style={{ width: "120px" }} />
                          </StyledTableCell>
                          <StyledTableCell>

                          </StyledTableCell>
                          {
                            lotItem.data.map((lotArr, lotArrIndex) => (
                              lotArrIndex >= 3 ? (
                                <React.Fragment key={lotArrIndex}>

                                  <StyledTableCell>
                                    <StyledInput
                                      value={
                                        lotItem.data[lotArrIndex]?.ProcessSteps[0]?.AttributeValues[key]?.value || " "
                                      }

                                      style={{ width: "120px" }}

                                    ></StyledInput>
                                  </StyledTableCell>

                                  <StyledTableCell>
                                    <StyledInput
                                      value={lotItem.data[lotArrIndex]?.ProcessSteps[1]?.AttributeValues[key]?.value || ''}
                                      onChange={(e) => {
                                        handleChildItems(lotIndex, lotItem.lotid,
                                          lotItem.data[lotArrIndex]?.ProcessSteps[1]?.AttributeInfo.attribute_id,
                                          e.target.value, key,
                                          lotItem.data[lotArrIndex]?.ProcessSteps[1].process_id,
                                          lotArrIndex

                                        )
                                      }}
                                      type="number"
                                      style={{ width: "120px" }}
                                    ></StyledInput>
                                  </StyledTableCell>

                                  <StyledTableCell>
                                    <StyledInput
                                      value={lotItem.data[lotArrIndex]?.ProcessSteps[2]?.AttributeValues[key]?.value || ''}
                                      onChange={(e) => {
                                        handleChildItems(lotIndex, lotItem.lotid,
                                          lotItem.data[lotArrIndex]?.ProcessSteps[2]?.AttributeInfo.attribute_id,
                                          e.target.value, key,
                                          lotItem.data[lotArrIndex]?.ProcessSteps[2].process_id,
                                          lotArrIndex

                                        )
                                      }}
                                      type="number"
                                      style={{ width: "120px" }}
                                    ></StyledInput>
                                  </StyledTableCell>

                                  <StyledTableCell>

                                    <StyledInput //loss Weight
                                      value={
                                        typeof lotItem.data[lotArrIndex]?.ProcessSteps[3]?.AttributeValues[key]?.value === "number"
                                          ? lotItem.data[lotArrIndex].ProcessSteps[3].AttributeValues[key].value.toFixed(3)
                                          : ""
                                      }
                                      style={{ width: "120px" }}
                                    />
                                  </StyledTableCell>

                                  {lotArrIndex === 7 ? (
                                    <StyledTableCell>
                                      <StyledInput
                                        value={
                                          typeof lotItem.data[lotArrIndex]?.ProcessSteps[4]?.AttributeValues[key]?.value === "number"
                                            ? lotItem.data[lotArrIndex].ProcessSteps[4].AttributeValues[key].value.toFixed(3)
                                            : ""
                                        }
                                        style={{ width: "120px" }}></StyledInput>
                                    </StyledTableCell>
                                  ) : (" ")
                                  }

                                </React.Fragment>
                              ) : (" ")
                            ))
                          }

                          {

                            lotItem.data[8]?.ProcessSteps[1]?.AttributeValues[key]?.value ?
                              (<StyledTableCell>
                                <p style={{ fontSize: "15px" }}>{lotItem.data[3]?.ProcessSteps[0]?.AttributeValues[key].value - lotItem.data[8]?.ProcessSteps[1]?.AttributeValues[key].value}</p>
                              </StyledTableCell>)
                              : (<StyledTableCell></StyledTableCell>)
                          }
                          <StyledTableCell style={{ borderTop: "2px solid white" }}></StyledTableCell>


                        </TableRow>

                      ))
                    }
                    <TableRow >
                      <StyledTableCell colSpan={11}></StyledTableCell>

                      <StyledTableCell>-</StyledTableCell>
                      {
                        lotItem.data[3].ProcessSteps[0].AttributeValues.length !== 0 ? ( //weight total
                          <StyledTableCell>{"Total:" + handleTotal(lotItem.lotid, 3, 0)}</StyledTableCell>
                        ) : (<StyledTableCell>Total:0</StyledTableCell>)
                      }
                      <StyledTableCell
                        style={{
                          backgroundColor:
                            lotItem.data[3].ProcessSteps[0].AttributeValues.length !== 0 &&
                              lotItem.data[2].ProcessSteps[1].AttributeValues.length !== 0
                              ? (() => {
                                const diff = handleDifference(
                                  lotItem.data[2].ProcessSteps[1].AttributeValues[0].value,
                                  lotItem.lotid,
                                  3,
                                  0
                                );
                                return diff !== 0 ? "red" : "transparent"; // Red for both > 0 and < 0
                              })()
                              : "transparent",
                          color:
                            lotItem.data[3].ProcessSteps[0].AttributeValues.length !== 0 &&
                              lotItem.data[2].ProcessSteps[1].AttributeValues.length !== 0
                              ? (() => {
                                const diff = handleDifference(
                                  lotItem.data[2].ProcessSteps[1].AttributeValues[0].value,
                                  lotItem.lotid,
                                  3,
                                  0
                                );
                                return diff !== 0 ? "white" : "black"; // White text if red background
                              })()
                              : "black",
                        }}
                      >
                        {lotItem.data[3].ProcessSteps[0].AttributeValues.length !== 0 ? (
                          lotItem.data[2].ProcessSteps[1].AttributeValues.length !== 0 ? (
                            handleDifference(
                              lotItem.data[2].ProcessSteps[1].AttributeValues[0].value,
                              lotItem.lotid,
                              3,
                              0
                            )
                          ) : (
                            ""
                          )
                        ) : (
                          "Diff:0"
                        )}
                      </StyledTableCell>

                      {
                        lotItem.data.map((item, index) => (
                          index >= 3 && index <= 8 ? (
                            <React.Fragment>
                              <StyledTableCell>
                              </StyledTableCell>
                              <StyledTableCell>
                                {
                                  index === 8 ? (lotItem.data[8].ProcessSteps[1].AttributeValues.length !== 0 ? (
                                    "Total:" + handleTotal(lotItem.lotid, 8, 1)
                                  ) : ("")) : ("")

                                }
                              </StyledTableCell>
                              <StyledTableCell>

                              </StyledTableCell>
                              <StyledTableCell>

                              </StyledTableCell>
                              {
                                index === 7 ? (<StyledTableCell></StyledTableCell>) : ("")
                              }

                            </React.Fragment>
                          ) : (" ")

                        ))
                      }

                      <StyledTableCell></StyledTableCell>
                      <StyledTableCell style={{ borderTop: "2px solid white" }}>
                      </StyledTableCell>
                    </TableRow>
                  </React.Fragment>
                ))
              }

            </TableBody>
            <TableFooter>
              <StyledTableCell><p style={{ fontSize: "17px", fontWeight: "bold", color: "black" }}>Total RawGold:{calculation[0].rawGold}</p></StyledTableCell>
              <StyledTableCell><p ></p></StyledTableCell>
              {
                calculation[2].process.map((item, key) => (
                  <>

                    <StyledTableCell><StyledInput ></StyledInput></StyledTableCell>
                    <StyledTableCell>
                      <p style={{ fontSize: "17px", fontWeight: "bold", color: "black" }}>
                        {item.processName === 'Finishing' ? `FinishTotal ${(item.Weight[1].aw).toFixed(3)}` : ""}
                      </p>
                    </StyledTableCell>

                    <StyledTableCell><p style={{ fontSize: "17px", fontWeight: "bold", color: "black" }}>{item.processName}ScarpTotal:{(item.Weight[2].sw).toFixed(3)}</p></StyledTableCell>
                    <StyledTableCell><p style={{ fontSize: "17px", fontWeight: "bold", color: "black" }}>{item.processName}LossTotal:{(item.Weight[3].lw).toFixed(3)}</p></StyledTableCell>
                    {
                      item.processName === "Cutting" ? (<StyledTableCell><p style={{ fontSize: "17px", fontWeight: "bold", color: "black" }}>{item.processName}PureTotal:{(item.Weight[4].pw).toFixed(3)}</p></StyledTableCell>) : ("")
                    }

                    {
                      item.processName === "Kambi" ? (
                        <>
                          <StyledTableCell></StyledTableCell>
                          <StyledTableCell></StyledTableCell>
                          <StyledTableCell></StyledTableCell>
                          <StyledTableCell></StyledTableCell>
                        </>
                      ) : ("")
                    }

                  </>
                ))
              }
              <StyledTableCell></StyledTableCell>
              <StyledTableCell><p style={{ fontSize: "17px", fontWeight: "bold", color: "black" }}>LotTotal:{(calculation[3].lotTotal).toFixed(3)}</p></StyledTableCell>
            </TableFooter>
          </Table>
          <ToastContainer />
        </div>
      </StyledTableContainer>

      <Button variant="contained" color="primary" onClick={handleDownloadPdf}>
        Download as PDF
      </Button>


      <Button variant="contained" onClick={exportToExcel}>Export to Excel</Button>



      <Modal open={open} onClose={handleClose}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography variant="h6" component="h2">
            Enter Initial Weight
          </Typography>
          <TextField
            fullWidth
            label="Initial Weight"
            value={initialWeight}
            onChange={(e) => setInitialWeight(e.target.value)}
            sx={{ mt: 2 }}
          />
          <Typography variant="h6" component="h2">
            Touch Weight
          </Typography>
          <TextField
            fullWidth
            label="Touch Weight"
            value={touchValue}
            onChange={(e) => setTouchValue(e.target.value)}
            sx={{ mt: 2 }}
          />
          <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
            <Button onClick={handleClose} sx={{ mr: 2 }}>
              Cancel
            </Button>
            <Button variant="contained" onClick={handleSave}>
              Save
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>

    

  );
};

export default ProcessTable;









