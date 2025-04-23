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
    if (!balance || balance.length === 0) {
      return res.status(400).json({ error: 'Balance is required' });
    }

    if (!closingbalance) {
      return res.status(400).json({ error: 'Closing balance is required' });
    }

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

    // Handle closing balance
    const existingCustomer = await prisma.closingBalance.findFirst({
      where: { customer_id: customer_id }
    });

    if (!existingCustomer) {
      // Create new closing balance
      await prisma.closingBalance.create({
        data: {
          customer_id: customer_id,
          closing_balance: parseFloat(closingbalance)
        }
      });
    } else {
      // Update closing balance by adding new value
      const updatedValue = parseFloat(existingCustomer.closing_balance) + parseFloat(closingbalance);
      await prisma.closingBalance.update({
        where: { customer_id: customer_id },
        data: { closing_balance : updatedValue }
      });
    }

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
                OrderItems:true,
                Balance:true,
                CustomerInfo:true

               
            }
         })
         res.send(getBillData)
  }
  module.exports={saveBill,getBill}