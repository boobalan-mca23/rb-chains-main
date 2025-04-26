const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const saveBill = async (req, res) => {
  const {
    customer_id,
    totalPrice,
    order_status,
    orderItems,
    balance,
    closingbalance
  } = req.body;

  console.log('closingBlance',closingbalance)
  try {
    // Save master order
    const newOrder = await prisma.masterOrder.create({
      data: {
        customer_id: customer_id,
        order_status: order_status,
        total_price: parseFloat(totalPrice)
      }
    });

    // Validate and save orderItems
    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ error: 'Order items are required' });
    }

    for (const data of orderItems) {
      const newOrderItem = await prisma.orderItem.create({
        data: {
          order_id: newOrder.id,
          itemName: data.productName,
          touchValue: parseFloat(data.productTouch),
          productWeight: parseFloat(data.productWeight),
          final_price: parseFloat(data.productPure),
          stock_id: data.stockId
        }
      });

      await prisma.productStocks.update({
        where: { id: newOrderItem.stock_id },
        data: { product_status: 'sold' }
      });
    }

    // Validate and save balances
    if (balance.length >=1) {
      // return res.status(400).json({ error: 'Balance is required' });

      for (const balanceData of balance) {
        await prisma.balance.create({
          data: {
            order_id: newOrder.id,
            customer_id: customer_id,
            gold_weight: parseFloat(balanceData.givenGold),
            gold_touch: parseFloat(balanceData.touch),
            gold_pure: parseFloat(balanceData.pure),
            remaining_gold_balance: parseFloat(closingbalance)
          }
        });
      }

      const existingCustomer = await prisma.closingBalance.findFirst({
        where: { customer_id: customer_id }
      });
      if (!existingCustomer) {
  
        await prisma.closingBalance.create({
          data: {
            customer_id: customer_id,
            closing_balance: parseFloat(closingbalance)
          }
        })    
       
      } 
      else{
        const updatedValue = parseFloat(existingCustomer.closing_balance) + parseFloat(closingbalance);
        await prisma.closingBalance.update({
          where: { customer_id: customer_id },
          data: { closing_balance : updatedValue }
        });
      }


      // await prisma.closingBalance.create({
      //   data: {
      //     customer_id: customer_id,
      //     closing_balance: parseFloat(closingbalance)
      //   }
      // })
    }
    else{ 
       const existingCustomer = await prisma.closingBalance.findFirst({
      where: { customer_id: customer_id }
    });
    if (!existingCustomer) {

      await prisma.closingBalance.create({
        data: {
          customer_id: customer_id,
          closing_balance: parseFloat(closingbalance)
        }
      })    
     
    } else{
      console.log('update')
      const updatedValue = parseFloat(existingCustomer.closing_balance) + parseFloat(closingbalance);
      await prisma.closingBalance.update({
        where: { customer_id: customer_id },
        data: { closing_balance : updatedValue }
      });
    }

    

  
  }

    



    // Handle closing balance
    // const existingCustomer = await prisma.closingBalance.findFirst({
    //   where: { customer_id: customer_id }
    // });

    // if (!existingCustomer) {
      // Create new closing balance
     
    // } 
    // else {
    //   // Update closing balance by adding new value
    //   const updatedValue = parseFloat(existingCustomer.closing_balance) + parseFloat(closingbalance);
    //   await prisma.closingBalance.update({
    //     where: { customer_id: customer_id },
    //     data: { closing_balance : updatedValue }
    //   });
    // }

    res.status(201).json({ message: "Bill, items, balances, and closing balance saved!", data: newOrder });
  } catch (error) {
    console.error("Error saving bill:", error);
    res.status(500).json({ error: "Error saving bill" });
  }
};

  
  //getBill

  const getBill=async(req,res)=>{
         const getBillData=await prisma.masterOrder.findMany({
            where:{
                id:parseInt(req.params.masterid)
            },
            select:{
                total_price:true,
                OrderItems:true,
                Balance:true,
                CustomerInfo:true

               
            }
         })
         res.send(getBillData)
  }

  // getCustomerBillDetails
  const getCustomerBillDetails=async(req,res)=>{
        try{
         const billInfo=await prisma.masterOrder.findMany({
           include:{
            Balance:true,
           }
         })
         res.send({'billInfo':billInfo})
         
        }catch(err){
          res.send(err)
        }
  }


  //getSalesBillDetails 

  const getSalesBillDetails=async(req,res)=>{
    try{
     const billInfo=await prisma.masterOrder.findMany({
       include:{
        CustomerInfo:true,
       }
     })
     res.send({'billInfo':billInfo})
     
    }catch(err){
      res.send(err)
    }
}
  //updateBill
  const updateBill=async(req,res)=>{
     const order_id=req.params.id;
     const balanceData=req.body

     const closing=balanceData[balanceData.length-1].closing
 
     try{
       for(const bal of balanceData){
      
            if(bal.balance_id===0){
               const newBalance=await prisma.balance.create({
                 data:{
                  order_id:parseInt(order_id),
                  customer_id:bal.customer_id,
                  gold_weight:parseFloat(bal.gold_weight),
                  gold_touch:parseFloat(bal.gold_touch),
                  gold_pure:parseFloat(bal.gold_pure),
                  remaining_gold_balance:parseFloat(closing)
                 }
               })
               const existingClosing=await prisma.closingBalance.findFirst({
                where:{
                  customer_id:newBalance.customer_id
                }
              
               })
               const updateValue=existingClosing.closing_balance-newBalance.gold_pure
               await prisma.closingBalance.update({
                where:{
                  customer_id:newBalance.customer_id
                },
                data:{
                  closing_balance:parseFloat(updateValue)
                }
               })
            }else{
              
              if (!bal.balance_id) {
                console.log("Skipping invalid balance", bal);
                continue; // skip to next
              }
              console.log('balance update',bal.balance_id,order_id,bal.customer_id,bal.gold_weight,bal.gold_touch,bal.gold_pure,closing)
              //balance update
              await prisma.balance.updateMany({
                where: {
                  balance_id: parseInt(bal.balance_id)
                },
                data: {
                  order_id: parseInt(order_id),
                  customer_id: bal.customer_id,
                  gold_weight: parseFloat(bal.gold_weight),
                  gold_touch: parseFloat(bal.gold_touch),
                  gold_pure: parseFloat(bal.gold_pure),
                  remaining_gold_balance: parseFloat(closing)
                }
              });
              

            }
       }
       res.status(200).json({message:" Bill Update Suceess"})
     }catch(err){
      console.log(err)
       res.status(500).json({message:"Error on Update bill"})
     }
 
  }
  module.exports={saveBill,getBill,getCustomerBillDetails,updateBill,getSalesBillDetails}