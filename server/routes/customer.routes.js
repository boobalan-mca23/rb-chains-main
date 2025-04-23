const express = require("express");
const {
  createCustomer,
  deleteCustomer,
  updateCustomer,
  getAllCustomers,
  getCustomerById,
  getCustomerValueWithPercentage,
  getCustomerClosing
} = require("../controllers/customer.controller");

const router = express.Router();

router.post("/customer_info", createCustomer);
router.delete("/customer_info/:customer_id", deleteCustomer);
router.put("/customer_info/:customer_id", updateCustomer);
router.get("/customerinfo", getAllCustomers);
router.get("/customer_info/:customer_id", getCustomerById);
router.get("/closing/:id",getCustomerClosing);
router.get('/getCustomerValueWithPercentage',getCustomerValueWithPercentage)

module.exports = router;
