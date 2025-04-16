const express=require('express')
const router=express.Router()


const{createJewelType,deleteJewelType,getAllJewelTypes,updateJewelType, getJewelWithCustomerValues,getJewelType,billingProductWeight,createCustomerJewelPercentage
}=require('../controllers/jewelType.controller')

router.post('/createJewelType',createJewelType)
router.delete('/deleteJewelType/:master_jewel_id',deleteJewelType)
router.get('/getAllJewelTypes', getAllJewelTypes);
router.put('/updateJewelType/:master_jewel_id',updateJewelType)
router.get('/getJewelDetails/:customer_id',getJewelWithCustomerValues ) 
router.get('/getJewelType',getJewelType)
router.get('/getProductWeight/:id',billingProductWeight);
router.post('/createCustomerJewelPercentage',createCustomerJewelPercentage)


module.exports=router;







