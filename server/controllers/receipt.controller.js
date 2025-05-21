const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();


exports.saveReceipts = async (req, res) => {
  const { customer_id, receipts } = req.body;

  if (!customer_id || !receipts || !Array.isArray(receipts)) {
    return res.status(400).json({ message: "Invalid data format" });
  }

  try {
    const created = await Promise.all(
      receipts.map((r) =>
        prisma.receipt.create({
          data: {
            date: new Date(r.date),
            goldRate: parseFloat(r.goldRate),
            givenGold: parseFloat(r.givenGold),
            touch: parseFloat(r.touch),
            purityWeight: parseFloat(r.purityWeight),
            amount: parseFloat(r.amount),
            customer_id: customer_id,
          },
        })
      )
    );
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
      orderBy: { date: "desc" },
    });

    res.status(200).json(receipts);
  } catch (error) {
    console.error("Fetch error", error);
    res.status(500).json({ error: "Server error" });
  }
};
