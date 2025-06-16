const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const convertToIST = (date) => {
  return new Date(date.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
};

const saveBill = async (req, res) => {
  const {
      customer_id,
      order_status,
      totalPrice,
      orderItems,
      receivedDetails,
      oldBalance,
      excessBalance,
  } = req.body;
  console.log('saveBill',req.body)
  
  try {
    // Save master order
    const newOrder = await prisma.masterOrder.create({
      data: {
        customer_id: customer_id,
        order_status: order_status,
        total_price: parseFloat(totalPrice),
        created_at: convertToIST(new Date()) 
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

     if (receivedDetails.length>=1) {
        for(const recive of receivedDetails){
          await prisma.receipt.create({
              data: {
                date: new Date(recive.date),
                goldRate: parseFloat(recive.goldRate)||0,
                customer_id:customer_id,
                touch: parseFloat(recive.touch)||0,
                purityWeight:parseFloat(recive.purityWeight)||0,
                amount:parseFloat(recive.amount)||0 ,
                givenGold:parseFloat(recive.givenGold) ||0
              }
           });
        }
    }
        await prisma.customerBalance.updateMany({
          where:{
            customer_id:customer_id
          },
          data:{
              expure:parseFloat(Math.abs(excessBalance).toFixed(2)),
              balance:parseFloat(Math.abs(oldBalance).toFixed(2)),
          }
        })
      const billLength=await prisma.masterOrder.findMany()

    res.status(201).json({ message: "Bill items saved!", data: billLength.length });
  } catch (error) {
    console.error("Error saving bill:", error);
    res.status(500).json({ error: "Error saving bill" });
  }
};
 
//getBill length

const getBillLength=async(req,res)=>{
    try{
       const billLength=await prisma.masterOrder.findMany()
       return res.status(200).json({billLength:billLength.length})
    }catch(err){
       return res.status(500).json({message:"Server Error"})
    }
}

//getBill

const getBill = async (req, res) => {
  const getBillData = await prisma.masterOrder.findMany({
    where: {
      id: parseInt(req.params.masterid)
    },
    select: {
      total_price: true,
      oldBalance:true,
      OrderItems: true,
      Balance: true,
      CustomerInfo: true


    }
  })
  res.send(getBillData)
}
const getCustomerBillWithDate = async (req, res) => {
  try {
    let { fromDate, toDate, customer_id } = req.query;

    const billWhere = {};
    const receiptWhere = {};

    // If date range is provided
    if (fromDate && toDate) {
      const from = new Date(fromDate);
      const to = new Date(toDate);
      to.setHours(23, 59, 59, 999); // Include full day

      billWhere.created_at = {
        gte: from,
        lte: to,
      };

      receiptWhere.date = {
        gte: from,
        lte: to,
      };
    }

    // If customer_id is provided
    if (!isNaN(parseInt(customer_id))) {
       billWhere.customer_id = parseInt(customer_id);
       receiptWhere.customer_id = parseInt(customer_id);
}

    let combinedData=[]
    // Check if at least date or customer_id is provided
    if (fromDate && toDate || customer_id) {
      const allBill = await prisma.masterOrder.findMany({
        where: billWhere,
        include: {
          OrderItems: true,
        },
      });

      const allReceipt = await prisma.receipt.findMany({
        where: receiptWhere,
      });

       combinedData = [
        ...allBill.map((bill) => ({
          type: "bill",
          date: new Date(bill.created_at),
          info: bill,
        })),
        ...allReceipt.map((receipt) => ({
          type: "receipt",
          date: new Date(receipt.date),
          info: receipt,
        })),
      ];

      combinedData.sort((a, b) => a.date - b.date);
      console.log('partdata',combinedData);
      
      res.status(200).json(combinedData);
    } else {
      res.status(200).json(combinedData);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
};



// getCustomerBillDetails based on today date
// const getCustomerBillDetails = async (req, res) => {
//   try {
//     // Get today's start and end time
//     const today = new Date();
//     const startOfDay = new Date(today.setHours(0, 0, 0, 0));
//     const endOfDay = new Date(today.setHours(23, 59, 59, 999));

//     const billInfo = await prisma.masterOrder.findMany({
//       where: {
//         created_at: {
//           gte: startOfDay,
//           lte: endOfDay,
//         }
//       },
//       include: {
//         Balance: true,
//       },
//     });

//     res.send({ billInfo });

//   } catch (err) {
//     console.error(err);
//     res.status(500).send({ error: 'Something went wrong' });
//   }
// };



//getSalesBillDetails 

const getSalesBillDetails = async (req, res) => {
  try {
    const billInfo = await prisma.masterOrder.findMany({
      include: {
        CustomerInfo: true,
      }
    })
    res.send({ 'billInfo': billInfo })

  } catch (err) {
    res.send(err)
  }
}
//updateBill
const updateBill = async (req, res) => {
  const order_id = req.params.id;
  const balanceData = req.body

  const closing = balanceData[balanceData.length - 1].closing

  try {
    for (const bal of balanceData) {

      if (bal.balance_id === 0) {
        const newBalance = await prisma.balance.create({
          data: {
            order_id: parseInt(order_id),
            customer_id: bal.customer_id,
            gold_weight: parseFloat(bal.gold_weight),
            gold_touch: parseFloat(bal.gold_touch),
            gold_pure: parseFloat(bal.gold_pure),
            remaining_gold_balance: parseFloat(closing)
          }
        })
        const existingClosing = await prisma.closingBalance.findFirst({
          where: {
            customer_id: newBalance.customer_id
          }

        })
        const updateValue = existingClosing.closing_balance - newBalance.gold_pure
        await prisma.closingBalance.update({
          where: {
            customer_id: newBalance.customer_id
          },
          data: {
            closing_balance: parseFloat(updateValue)
          }
        })
      } else {

        if (!bal.balance_id) {
          console.log("Skipping invalid balance", bal);
          continue; // skip to next
        }
        console.log('balance update', bal.balance_id, order_id, bal.customer_id, bal.gold_weight, bal.gold_touch, bal.gold_pure, closing)
        //balance update

        const existingGoldWeight = await prisma.balance.findFirst({
          where: {
            balance_id: bal.balance_id
          },
          select: {
            gold_pure: true
          }
        })
        const existingClosing = await prisma.closingBalance.findFirst({
          where: {
            customer_id: bal.customer_id
          },
          select: {
            closing_balance: true
          }
        })
        const addClosing = parseFloat(existingGoldWeight.gold_pure) + parseFloat(existingClosing.closing_balance)
        console.log('addclosing', addClosing)
        await prisma.closingBalance.update({
          where: {
            customer_id: bal.customer_id
          },
          data: {
            closing_balance: parseInt(addClosing)
          }
        })
        const updateBal = await prisma.balance.updateMany({
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
        //closing update

        const newClose = addClosing - parseFloat(bal.gold_pure)
        console.log('newClose', newClose)
        await prisma.closingBalance.update({
          where: {
            customer_id: bal.customer_id
          },
          data: {
            closing_balance: parseFloat(newClose)
          }
        })


      }
    }
    res.status(200).json({ message: " Bill Update Suceess" })
  } catch (err) {
    console.log(err)
    res.status(500).json({ message: "Error on Update bill" })
  }

}
module.exports = { saveBill, getBill, updateBill, getSalesBillDetails, getCustomerBillWithDate,getBillLength }