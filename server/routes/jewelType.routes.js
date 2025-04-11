const express=require('express')
const router=express.Router()

const{getJewelType,billingProductWeight}=require('../controllers/jewelType.controller')

// router.post('/createJewelType',createJewelType)
router.get('/getJewelType',getJewelType)
router.get('/getProductWeight/:id',billingProductWeight);
module.exports=router