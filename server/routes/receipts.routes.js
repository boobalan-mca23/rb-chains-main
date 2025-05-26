const express = require("express");
const router = express.Router();
const receiptController = require("../controllers/receipt.controller");

router.post("/save", receiptController.saveReceipts);
router.get("/receipts", receiptController.getAllReceipts);

router.get("/customer/:customer_id", receiptController.getReceiptsByCustomer);


module.exports = router;
