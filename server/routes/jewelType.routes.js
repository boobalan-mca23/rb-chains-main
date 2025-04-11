const express=require('express')
const router=express.Router()

const{createJewelType,deleteJewelType,getAllJewelTypes,updateJewelType, getJewelWithCustomerValues}=require('../controllers/jewelType.controller')

router.post('/createJewelType',createJewelType)
router.delete('/deleteJewelType/:master_jewel_id',deleteJewelType)
router.get('/getAllJewelTypes', getAllJewelTypes);
router.put('/updateJewelType/:master_jewel_id',updateJewelType)
router.get('/getJewelDetails/:master_jewel_id',getJewelWithCustomerValues ) 

module.exports=router;



