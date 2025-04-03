const express = require("express");
const router = express.Router();
const {
  createLotInfo,
  
} = require("../controllers/lot.controller");

// Create a new lot
router.post("/lotinfo", createLotInfo);

// // Get all lots
// router.get("/lotinfo", getAllLots);

// // Update a lot by ID
// router.put("/lotinfo/:id", updateLotInfo);

// // Delete a lot by ID
// router.delete("/lotinfo/:id", deleteLotInfo);

module.exports = router;
