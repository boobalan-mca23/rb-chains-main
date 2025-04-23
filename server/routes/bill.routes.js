const express = require('express');
const router=express.Router()
const{saveBill,getBill}=require('../controllers/bills.controller')

router.post('/saveBill',saveBill);
router.get('/getbill/:masterid',getBill);

module.exports=router;


