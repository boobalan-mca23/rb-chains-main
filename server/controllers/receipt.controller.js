const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.saveReceipts = async (req, res) => {
  const { customer_id, receipts ,oldBalance,excessBalance} = req.body;

  if (!customer_id || !receipts || !Array.isArray(receipts)) {
    return res.status(400).json({ message: "Invalid data format" });
  }

  try {
    const created = await Promise.all(
      receipts.map((r) =>
        prisma.receipt.create({
          data: {
            date: new Date(r.date),
            goldRate: parseFloat(r.goldRate)||0,
            givenGold: parseFloat(r.givenGold)||0,
            touch: parseFloat(r.touch)||0,
            purityWeight: parseFloat(r.purityWeight)||0,
            amount: parseFloat(r.amount)||0,
            customer_id: customer_id,
          },
        })
      )
    );
    await prisma.customerBalance.updateMany({
          where:{
            customer_id:customer_id
          },
          data:{
              expure:parseFloat(Math.abs(excessBalance).toFixed(2)),
              balance:parseFloat(Math.abs(oldBalance).toFixed(2)),
          }
        })
    res.status(201).json({ message: "Receipts saved", data: created });
  } catch (error) {
    console.error("Create error", error);
    res.status(500).json({ error: "Server error" });
  }
};

exports.getReceiptsByCustomer = async (req, res) => {
  const { customer_id } = req.params;

  try {
    const receipts = await prisma.receipt.findMany({
      where: { customer_id: parseInt(customer_id) },
      include: {
        customer: {
          select: {
            customer_name: true,
            phone_number: true,
          },
        },
      },
      orderBy: { date: "desc" },
    });

    const transformedReceipts = receipts.map((receipt) => ({
      ...receipt,
      customer_name: receipt.customer.customer_name,
      customer_phone: receipt.customer.phone_number,
    }));

    res.status(200).json(transformedReceipts);
  } catch (error) {
    console.error("Fetch error", error);
    res.status(500).json({ error: "Server error" });
  }
};

exports.getAllReceipts = async (req, res) => {
  try {
    const receipts = await prisma.receipt.findMany({
      include: {
        customer: {
          select: {
            customer_name: true,
            phone_number: true,
          },
        },
      },
      orderBy: { date: "desc" },
    });

    const transformedReceipts = receipts.map((receipt) => ({
      ...receipt,
      customer_name: receipt.customer.customer_name,
      customer_phone: receipt.customer.phone_number,
    }));

    res.status(200).json(transformedReceipts);
  } catch (error) {
    console.error("Fetch all receipts error", error);
    res.status(500).json({ error: "Server error" });
  }
};
