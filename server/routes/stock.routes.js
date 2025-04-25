const express = require('express');
const router=express.Router()

const {getStock}=require('../controllers/stock.controller')

router.get('/getStock',getStock)
module.exports=router
