const express = require('express');
const router=express.Router()
const{saveBill,getBill,updateBill, getSalesBillDetails,getCustomerBillWithDate}=require('../controllers/bills.controller')

router.post('/saveBill',saveBill);
router.get('/getbill/:masterid',getBill);

router.get('/getCustomerBillWithDate',getCustomerBillWithDate)
router.put('/updateBill/:id',updateBill)
router.get('/getSalesBillDetails',getSalesBillDetails)

module.exports=router;


