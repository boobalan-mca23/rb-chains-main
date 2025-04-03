const express = require("express");
const {
  createCustomer,
  deleteCustomer,
  updateCustomer,
  getAllCustomers,
  getCustomerById,
} = require("../controllers/customer.controller");

const router = express.Router();

router.post("/customer_info", createCustomer);
router.delete("/customer_info/:customer_id", deleteCustomer);
router.put("/customer_info/:customer_id", updateCustomer);
router.get("/customerinfo", getAllCustomers);
router.get("/customer_info/:customer_id", getCustomerById);

module.exports = router;
