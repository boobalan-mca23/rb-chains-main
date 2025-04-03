
import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Button,
  Box,
  Modal,
  Typography,
  colors,
  TableFooter,
} from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

import { createLot, getAllLot, saveLot } from "../../Api/processTableApi";
import { styled } from "@mui/material/styles";
import { processStepId } from "../../ProcessStepId/processStepId";
import axios from "axios";
const processes = [
  "Melting",
  "Kambi",
  "Wire",
  "Machine",
  "Soldrine",
  "Joint",
  "Cutting",
  "Finishing",
];

const StyledTableCell = styled(TableCell)({
  border: "1px solid #ccc",
  textAlign: "center",
  padding: "8px",
});

const StyledTableContainer = styled(TableContainer)({
  margin: "20px auto",
  maxWidth: "100%",
  border: "1px solid #ccc",
});

const StyledInput = styled(TextField)({
  "& .MuiOutlinedInput-notchedOutline": { border: "none" },
  "& .MuiInputBase-input": {
    textAlign: "center",
    padding: "5px",
  },
  width: "80px",
});

const ProcessTable = () => {
  const [data, setData] = useState([]);
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [initialWeight, setInitialWeight] = useState("");
  const [touchValue, setTouchValue] = useState("");
  const [isLotCreated, setIsLotCreated] = useState(false);

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
    console.log('touch', lotData[0].data[0].ProcessSteps[0].AttributeValues[0].touchValue);
    lotData[0].data[0].ProcessSteps[0].AttributeValues[0].touchValue = parseFloat(value);
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


      const obj = {
        lot_id: lotid,
        process_step_id: findProcessStep(process_id, attribute_id),
        // item_name: lotData.data[index].ProcessSteps[0].AttributeValues[0].item_name,
        attribute_id: attribute_id,
        items_id: lotData[0].data[0].ProcessSteps[0].AttributeValues[0].items_id,
        value: value
      }

      if (lotData[0].data[index + 1].ProcessSteps[1].AttributeValues.length === 0) {

        lotData[0].data[index + 1].ProcessSteps[1].AttributeValues.push(obj);

        const nextProcessObj = {
          lot_id: lotid,
          process_step_id: 5,
          items_id: lotData[0].data[0].ProcessSteps[0].AttributeValues[0].items_id,
          // item_name:lotData.data[index].ProcessSteps[0].AttributeValues[0].item_name,
          attribute_id: 2,
          value: value
        }
        lotData[0].data[2].ProcessSteps[0].AttributeValues.push(nextProcessObj);
        const diffObj = {
          lot_id: lotid,
          process_step_id: 4,
          items_id: lotData[0].data[0].ProcessSteps[0].AttributeValues[0].items_id,
          // item_name: lotData.data[index].ProcessSteps[0].AttributeValues[0].item_name,
          attribute_id: 4,
          value: lotData[0].data[index + 1].ProcessSteps[0].AttributeValues[0].value - lotData[0].data[index + 1].ProcessSteps[1].AttributeValues[0].value
        }
        lotData[0].data[index + 1].ProcessSteps[2].AttributeValues.push(diffObj);








        tempData.splice(lotIndex, 1, lotData[0]);
        setItems(tempData)


      }
      else {
        lotData[0].data[index + 1].ProcessSteps[1].AttributeValues[0].value = parseFloat(value);//Meting Process After Weight update
        lotData[0].data[2].ProcessSteps[0].AttributeValues[0].value = parseFloat(value);
        lotData[0].data[index + 1].ProcessSteps[2].AttributeValues[0].value = lotData[0].data[index + 1].ProcessSteps[0].AttributeValues[0].value - lotData[0].data[index + 1].ProcessSteps[1].AttributeValues[0].value


        if (lotData[0].data[2].ProcessSteps[1].AttributeValues.length !== 0) {
          lotData[0].data[2].ProcessSteps[2].AttributeValues[0].value = lotData[0].data[2].ProcessSteps[0].AttributeValues[0].value - lotData[0].data[2].ProcessSteps[1].AttributeValues[0].value
        }


        tempData.splice(lotIndex, 1, lotData[0]);
        setItems(tempData)
      }

    }//Melting ProcessEnd

    else {
      //Kambi Process Start
      if (process_id === 3) {

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
          const diffObj = {
            lot_id: lotid,
            process_step_id: 7,
            items_id: lotData[0].data[0].ProcessSteps[0].AttributeValues[0].items_id,
            // item_name: lotData.data[index].ProcessSteps[0].AttributeValues[0].item_name,
            attribute_id: 4,
            value: lotData[0].data[index + 1].ProcessSteps[0].AttributeValues.length !== 0 ? parseFloat(lotData[0].data[index + 1].ProcessSteps[0].AttributeValues[0].value - lotData[0].data[index + 1].ProcessSteps[1].AttributeValues[0].value) : parseFloat(0 - lotData[0].data[index + 1].ProcessSteps[1].AttributeValues[0].value)
          }

          lotData[0].data[index + 1].ProcessSteps[2].AttributeValues.push(diffObj);
          tempData.splice(lotIndex, 1, lotData[0]);
          setItems(tempData)
          console.log('kambi', items)
        } else {
          lotData[0].data[index + 1].ProcessSteps[1].AttributeValues[0].value = parseFloat(value);
          lotData[0].data[index + 1].ProcessSteps[2].AttributeValues[0].value = lotData[0].data[index + 1].ProcessSteps[0].AttributeValues.length !== 0 ? parseFloat(lotData[0].data[index + 1].ProcessSteps[0].AttributeValues[0].value - lotData[0].data[index + 1].ProcessSteps[1].AttributeValues[0].value) : parseFloat(0 - lotData[0].data[index + 1].ProcessSteps[1].AttributeValues[0].value)
          tempData.splice(lotIndex, 1, lotData[0]);
          setItems(tempData)
          console.log('kambi', items)
        }//Kambi Process End

      }
    }


  }

  const addRow = (weight) => {
    setItems([
      ...items,
      {
        id: items.length + 1,
        touch: weight,
        itemName: "",
        data: {},
        kambiNotes: [],
      },
    ]);
  };

  // const handleAddItemColumns = (index) => {
  //   const updatedItems = [...items];
  //   updatedItems[index].kambiNotes.push({ name: "", weight: "" });
  //   setItems(updatedItems);
  // };

  const handleAddItemColumns = (lotid, index) => {
    console.log('lotid', lotid);
    const tempData = [...items];
    const lotData = tempData.filter((item, index) => item.lotid === lotid);
    let processstepid = 8;
    for (let i = 3; i <= 8; i++) {

      for (let j = 1; j <= 3; j++) {
        const obj = {
          lot_id: lotid,
          process_step_id: processstepid,
          item_name: " ",
          items_id: null,
          attribute_id: j + 1,
          value: null
        }
        lotData[0].data[i].ProcessSteps[j - 1].AttributeValues.push(obj)
        ++processstepid;
      }

    }
    processstepid = 8




    tempData.splice(index, 1, lotData[0]);
    setItems(tempData);
    console.log('items', items);


  };
  const handleChildItemName = (lotid, childIndex, itemName, lotIndex) => {
    const tempData = [...items];
    const lotData = tempData.filter((item, index) => item.lotid === lotid);

    for (let i = 3; i <= 8; i++) {//this create childItem name Each Process
      for (let j = 0; j <= 2; j++) {
        lotData[0].data[i].ProcessSteps[j].AttributeValues[childIndex].item_name = String(itemName);
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
      setInitialWeight(""); // Clear input field
      setOpen(false);
      setIsLotCreated(true);
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
    console.log('res from save function', res)
    setItems(res)

  }
  const allData = async () => {
    const res = await getAllLot();
    console.log('useEffect data', res);
    setItems(res)
  }
  const handleChildItems = (lotIndex, lotid, attribute_id, value, key, process_id, lotArrIndex) => {
    const tempData = [...items];
    const lotData = tempData.filter((item, index) => item.lotid === lotid);
    console.log('child fun', lotIndex, lotid, attribute_id, value, key, process_id)
    if (process_id <= 8) {


      // child Items Value Carry Forward here!!!!

      lotData[0].data[lotArrIndex].ProcessSteps[1].AttributeValues[key].value = parseFloat(value);
      lotData[0].data[lotArrIndex + 1].ProcessSteps[0].AttributeValues[key].value = parseFloat(value);
      lotData[0].data[lotArrIndex].ProcessSteps[2].AttributeValues[key].value = parseFloat(lotData[0].data[lotArrIndex].ProcessSteps[0].AttributeValues[key].value - lotData[0].data[lotArrIndex].ProcessSteps[1].AttributeValues[key].value)
      tempData.splice(lotIndex, 1, lotData[0]);
      setItems(tempData);
      console.log('items', items);

    } else { //last process after weight
      if (process_id === 9) {
        lotData[0].data[lotArrIndex].ProcessSteps[1].AttributeValues[key].value = parseFloat(value);
        lotData[0].data[lotArrIndex].ProcessSteps[2].AttributeValues[key].value = parseFloat(lotData[0].data[lotArrIndex].ProcessSteps[0].AttributeValues[key].value - lotData[0].data[lotArrIndex].ProcessSteps[1].AttributeValues[key].value)
        tempData.splice(lotIndex, 1, lotData[0]);
        setItems(tempData);
        console.log('items', items);
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
  const handleLotTotal=()=>{
    const tempData = [...items];
    let lotTotal=tempData.reduce((acc,item)=>acc+item.data[0].ProcessSteps[0].AttributeValues[0].value,0)
    return lotTotal;
  }

  const handleDeleteItem = async (lotid, index, lotIndex) => {
    try {
        const tempData = [...items];
        const lotData = tempData.filter((item) => item.lotid === lotid);

        if (!lotData.length) {
            console.error("Lot data not found!");
            return;
        }

        // Check if items_id is null
        if (lotData[0].data[3].ProcessSteps[0].AttributeValues[index].items_id === null) {
            for (let i = 3; i <= 8; i++) {
                lotData[0].data[i].ProcessSteps[0].AttributeValues.splice(index, 1);
                lotData[0].data[i].ProcessSteps[1].AttributeValues.splice(index, 1);
                lotData[0].data[i].ProcessSteps[2].AttributeValues.splice(index, 1);
            }
            tempData.splice(lotIndex, 1, lotData[0]);
            setItems(tempData);
        } else {
            console.log("API call initiated...");
            const items_id = lotData[0].data[3].ProcessSteps[0].AttributeValues[index].items_id;

            const res = await axios.delete(`http://localhost:5000/api/process/deleteItem/${lotid}/${items_id}`);

            if (res.status === 200) {
                setItems(res.data.data);
            }
        }
    } catch (error) {
        console.error("Error deleting item:", error);
    }
};


  const handleDeleteLot=async(lotid,lotIndex)=>{
    const tempData = [...items];
    tempData.splice(lotIndex,1);
    setItems(tempData)
     const res=await axios.delete(`http://localhost:5000/api/process/deleteLot/${lotid}`)
     if(res.status===200){
        alert(res.data.message)
     }

  }

  useEffect(() => {
    allData()
  }, [])
  return (
    <Box sx={{ padding: "20px" }}>
      <Box sx={{ textAlign: "right", marginBottom: "10px" }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleCreateLot}
          sx={{ marginRight: "10px" }}
        // Disable "Create Lot" after it's clicked
        >
          Create Lot
        </Button>
        <Button
          variant="contained"
          color="secondary"
          onClick={handleSaveData}
          sx={{ marginRight: "10px" }}
        // Disable "Create Lot" after it's clicked
        >
          Save
        </Button>

      </Box>
      <StyledTableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <StyledTableCell>
                <b>Raw Gold</b>
              </StyledTableCell>
              <StyledTableCell>
                <b>Touch</b>
              </StyledTableCell>
              {processes.map((process) => (
                <StyledTableCell
                  key={process}
                  colSpan={process === "Kambi" ? 7 : 3}
                >
                  <b>{process}</b>
                </StyledTableCell>
              ))}
               <StyledTableCell>
                
              </StyledTableCell>
              <StyledTableCell>
                <b>Item Diffrent</b>
              </StyledTableCell>
              <StyledTableCell>
                <b>Total Diffrent</b>
              </StyledTableCell>
              <StyledTableCell/>

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
                    <b>Diff</b>
                  </StyledTableCell>

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
               <StyledTableCell>
                <b>DeleteItem</b>
               </StyledTableCell>
              <StyledTableCell />
              <StyledTableCell />
              <StyledTableCell>
                  <b>DeleteLot</b>
              </StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {
              items.map((lotItem, lotIndex) => (
                <React.Fragment key={lotIndex}>
                  <TableRow>
                    <StyledTableCell>

                      <StyledInput

                        value={lotItem.data[0].ProcessSteps[0].AttributeValues[0].value || " "}
                        onChange={(e) =>
                          handleInitialChange(lotItem.lotid, lotIndex, e.target.value)
                        }
                        type="number"

                      />

                    </StyledTableCell>
                    <StyledTableCell>
                      <StyledInput
                        value={lotItem.data[0].ProcessSteps[0].AttributeValues[0].touchValue || " "}
                        onChange={(e) => {
                          handleTouchChange(lotItem.lotid, lotIndex, e.target.value)
                        }}
                        type="number"
                      />
                    </StyledTableCell>

                    {lotItem.data.map((lotArr, lotArrIndex) =>
                      lotItem.data[lotArrIndex + 1] && lotItem.data[lotArrIndex + 1].ProcessSteps ? (
                        lotArrIndex >= 0 && lotArrIndex <= 1 ? (
                          <React.Fragment key={lotArrIndex}>
                            <StyledTableCell>
                              <StyledInput
                                value={
                                  lotItem.data[lotArrIndex + 1]?.ProcessSteps[0]?.AttributeValues[0]?.value || ''
                                }


                              />
                            </StyledTableCell>

                            <StyledTableCell>
                              <StyledInput
                                value={
                                  lotItem.data[lotArrIndex + 1]?.ProcessSteps[1]?.AttributeValues[0]?.value || ''
                                }
                                onChange={(e) => handleSingleItem(lotArrIndex, lotItem.lotid,
                                  lotItem.data[lotArrIndex + 1]?.ProcessSteps[1]?.process_id,
                                  lotItem.data[lotArrIndex + 1]?.ProcessSteps[1]?.AttributeInfo.attribute_id,
                                  e.target.value, lotIndex)}
                                type="number"
                              />
                            </StyledTableCell>

                            <StyledTableCell>

                              <StyledInput
                                value={
                                  lotItem.data[lotArrIndex + 1]?.ProcessSteps[2]?.AttributeValues[0]?.value
                                }
                                style={{ width: "70px" }} // Adjust width if needed
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
                            {lotItem.data[lotArrIndex + 1].process_name === "kambi" && <StyledTableCell colSpan={23} />}

                          </React.Fragment>) : (" ")
                      ) : null

                    )}
                    {
                      lotItem.data[8]?.ProcessSteps[1]?.AttributeValues.length >= 1 ? (
                        <StyledTableCell>
                          <b>{lotItem.data[0].ProcessSteps[0].AttributeValues[0].value - handleTotal(lotItem.lotid, 8, 1)}</b>
                        </StyledTableCell>
                      ) : (<StyledTableCell></StyledTableCell>)
                    }
                    <StyledTableCell style={{cursor:"pointer"}} onClick={()=>{handleDeleteLot(lotItem.lotid,lotIndex)}}>
                        <DeleteIcon/>
                    </StyledTableCell>

                  </TableRow>


                  {
                    lotItem.data[3].ProcessSteps[0].AttributeValues.map((item, key) => (
                      //
                      <TableRow key={key}>
                        <StyledTableCell colSpan={9} />

                        <StyledTableCell>
                          <StyledInput
                            value={lotItem.data[3]?.ProcessSteps[0]?.AttributeValues[key].item_name}
                            placeholder="Name"
                            onChange={(e) => { handleChildItemName(lotItem.lotid, key, e.target.value, lotIndex) }}
                            type="text"
                          ></StyledInput>
                        </StyledTableCell>

                        <StyledTableCell>
                          <StyledInput
                            value={lotItem.data[3]?.ProcessSteps[0]?.AttributeValues[key].value}
                            placeholder="Weight"
                            onChange={(e) => { handleChildItemWeight(lotItem.lotid, key, e.target.value, lotIndex) }}
                            type="number" />
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
                                  ></StyledInput>
                                </StyledTableCell>

                                <StyledTableCell>
                                  <StyledInput
                                    value={

                                      lotItem.data[lotArrIndex]?.ProcessSteps[1]?.AttributeValues[key]?.value ?
                                        lotItem.data[lotArrIndex]?.ProcessSteps[0]?.AttributeValues[key]?.value -
                                        lotItem.data[lotArrIndex]?.ProcessSteps[1]?.AttributeValues[key]?.value : ("-")

                                    }
                                  ></StyledInput>
                                </StyledTableCell>




                              </React.Fragment>
                            ) : (" ")
                          ))
                        }
                        <StyledTableCell style={{cursor:"pointer"}} onClick={()=>{handleDeleteItem(lotItem.lotid, key,lotIndex)}}>
                            <DeleteIcon/>
                        </StyledTableCell>
                        {

                          lotItem.data[8]?.ProcessSteps[1]?.AttributeValues[key]?.value ?
                            (<StyledTableCell>
                              <p style={{ fontSize: "15px" }}>{lotItem.data[3]?.ProcessSteps[0]?.AttributeValues[key].value - lotItem.data[8]?.ProcessSteps[1]?.AttributeValues[key].value}</p>
                            </StyledTableCell>)
                            : ("")
                        }
                       <StyledTableCell></StyledTableCell>
                       <StyledTableCell></StyledTableCell>
                       <StyledTableCell></StyledTableCell>

                      </TableRow>

                    ))
                  }
                  <TableRow >
                    <StyledTableCell colSpan={9}></StyledTableCell>

                    <StyledTableCell>-</StyledTableCell>
                    {
                      lotItem.data[3].ProcessSteps[0].AttributeValues.length !== 0 ? ( //weight total
                        <StyledTableCell>{"Total:"+handleTotal(lotItem.lotid, 3, 0)}</StyledTableCell>
                      ) : (<StyledTableCell>Total:0</StyledTableCell>)
                    }
                     {
                     lotItem.data[3].ProcessSteps[0].AttributeValues.length !== 0 ? ( //weight total
                        <StyledTableCell>{lotItem.data[2].ProcessSteps[1].AttributeValues.length!==0?(
                         + lotItem.data[2].ProcessSteps[1].AttributeValues[0].value-handleTotal(lotItem.lotid, 3, 0)
                        ):("")}</StyledTableCell>
                      ) : (<StyledTableCell>Diff:0</StyledTableCell>)
                    }

                    {
                      lotItem.data.map((item, index) => (
                        index>=3 && index<=8 ?(
                          <React.Fragment>
                          <StyledTableCell>

                          </StyledTableCell>
                          <StyledTableCell>
                              {
                                index===8?(  lotItem.data[8].ProcessSteps[1].AttributeValues.length!==0?(
                                 "Total:"+ handleTotal(lotItem.lotid,8,1)
                                ):("")):("")
                              
                              }
                          </StyledTableCell>
                          <StyledTableCell>

                          </StyledTableCell>
                         
                        </React.Fragment>
                        ):(" ")
                        
                      ))
                    }
                     <StyledTableCell>

                     </StyledTableCell>
                     <StyledTableCell>
                      
                     </StyledTableCell>
                     <StyledTableCell>

                     </StyledTableCell>
                     <StyledTableCell></StyledTableCell>
               
                  </TableRow>


                </React.Fragment>
              ))


            }

            {/* <TableRow>
              <StyledTableCell colSpan={2}>
                <b>Total</b>
              </StyledTableCell>
              {processes.map((process) => (
                <React.Fragment key={process}>
                  <StyledTableCell>
                    <b>{calculateTotal(items, process, "beforeWeight")}</b>
                  </StyledTableCell>
                  <StyledTableCell />
                  <StyledTableCell>
                    <b>{calculateTotal(items, process, "diff")}</b>
                  </StyledTableCell>
                  {process === "Kambi" && <StyledTableCell colSpan={2} />}
                </React.Fragment>
              ))}
              <StyledTableCell />
            </TableRow> */}
          </TableBody>
          <TableFooter>
            <StyledTableCell><b>LotTotal:{handleLotTotal()}</b></StyledTableCell>
          </TableFooter>
        </Table>
      </StyledTableContainer>
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









