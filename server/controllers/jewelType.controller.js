const { PrismaClient } = require("@prisma/client");
const { report } = require("../routes/jewelType.routes");
const prisma = new PrismaClient()

// //createJewelType

// exports.createJewelType=async(req,res)=>{
//     const{jewelName}=req.body
//     console.log('req.body',req.body)

//     try{
//       if(!jewelName){
//         return res.status(400).json({error:"jewelName is required"})
//       }
//       const newJeweltype=await prisma.MasterJeweltType.create({
//         data:{
//             jewel_name :jewelName
//         },
//       })
//       return res.status(201).json({message:"newJewelCreated",newJewel:newJeweltype})
//     }catch(err){
//       return res.status(500).json({error:"Failed to Create a JewelType",})
//     }
// }

//get JewelType
const getJewelType = async (req, res) => {
  try {

    const jewelType = await prisma.masterJewelType.findMany({
      select: {
        master_jewel_id: true,
        jewel_name: true
      }
    })

    return res.status(200).json({ message: "allJewelType", allJewel: jewelType })
  } catch (err) {
    return res.status(500).json({ error: "Failed to Create a JewelType", })
  }
}
const billingProductWeight = async (req, res) => {
  const { id } = req.params;
  const itemId = parseInt(id);

  try {
    const mapper = await prisma.masterJewelItemMapper.findMany({
      where: { master_jewel_id: itemId },
      select: {
        item_id: true
      },
    });

    if (!mapper || mapper.length === 0) {
      return res.status(404).json({ error: "Item not found in MasterJewelItemMapper" });
    }

    const allActiveProducts = [];

    for (const obj of mapper) {
      const activeProducts = await prisma.productStocks.findMany({
        where: {
          item_id: obj.item_id,
          product_status: "active"
        }
      });

      allActiveProducts.push(...activeProducts); // Merge results
    }
    const productWeight = []

    for (const activeProducts of allActiveProducts) {
      console.log('activeProducts', activeProducts.item_id)
      const weight = await prisma.attributeValue.findMany({
        where: {
          items_id: activeProducts.item_id,
          process_step_id: 32
        },
        select: {
          value: true
        }
      })
      productWeight.push(...weight)
    }

    // ✅ Only send response after all mapper items are processed
    return res.send({ 'productsWeight': productWeight });

  } catch (err) {
    console.error("Error fetching weight:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};


module.exports = { getJewelType, billingProductWeight }

