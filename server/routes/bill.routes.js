const express = require('express');
const router=express.Router()
const{saveBill,getBill,getCustomerBillDetails,updateBill, getSalesBillDetails}=require('../controllers/bills.controller')

router.post('/saveBill',saveBill);
router.get('/getbill/:masterid',getBill);
router.get('/getCustomerBillDetails',getCustomerBillDetails)
router.put('/updateBill/:id',updateBill)
router.get('/getSalesBillDetails',getSalesBillDetails)

module.exports=router;


