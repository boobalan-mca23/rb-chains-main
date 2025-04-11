const express=require('express')
const router=express.Router()

const{getJewelType}=require('../controllers/jewelType.controller')

// router.post('/createJewelType',createJewelType)
router.get('/getJewelType',getJewelType)
module.exports=router