const express = require('express');
const router=express.Router()
const{saveBill,getBill,getCustomerBillDetails}=require('../controllers/bills.controller')

router.post('/saveBill',saveBill);
router.get('/getbill/:masterid',getBill);
router.get('/getCustomerBillDetails',getCustomerBillDetails)

module.exports=router;


