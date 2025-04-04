
const express = require("express");
const router = express.Router();

const {getlotProcessesById,saveProcess,updateProcess, getAllLot,deleteLot,deleteByItemId,getLotsByDateRange} = require("../controllers/process.controller");

router.get("/processes", getAllLot);

router.get("/processes/:lot_id",getlotProcessesById);
router.post("/getLotsByDateRange",getLotsByDateRange);

router.post("/saveProcess", saveProcess);

router.put("/updateProcess",updateProcess);

router.delete("/deleteLot/:lotid",deleteLot);

router.delete("/deleteItem/:lotid/:items_id",deleteByItemId)


module.exports = router;
