const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// const createLotInfo = async (req, res) => {
//   const {
//     lot_name,
//     lot_before_weight,
//     lot_after_weight,
//     lot_difference_weight,
//     lot_comments,
//     is_completed,
//   } = req.body;

//   console.log("Incoming payload:", req.body); 

  
//   if (!lot_name) {
//     return res.status(400).json({ error: "Lot name is required" });
//   }

//   try {
   
//     const newLot = await prisma.lotInfo.create({
//       data: {
//         lot_name,
//         lot_before_weight: lot_before_weight || null,
//         lot_after_weight: lot_after_weight || null,
//         lot_difference_weight: lot_difference_weight || null,
//         lot_comments: lot_comments || null,
//         is_completed: is_completed || false,
//       },
//     });
//     await prisma.item.create({
//       data:{
//         lot_id:newLot.id,
//         item_type:'Intial'
//       }
//     })
//     await prisma.attributeValue.create({
//       data:{
//         lot_id:newLot.id,
//         item_id:1,
//         attribute_id:1,
//         value:lot_before_weight
//       }
//     })

//     res.status(201).json(newLot);
//   } catch (error) {
//     console.error("Error creating lot:", error);
//     res.status(400).json({ error: error.message });
//   }
// };
const createLotInfo = async (req, res) => {
  const {
    initialWeight,
    touchValue
  } = req.body;

  console.log("Incoming payload:", req.body); 

  try {
    // Step 1: Create Lot Entry
    const newLot = await prisma.lotInfo.create({
      data: {
        lot_initial_weight : parseFloat(initialWeight)  || null
        
      },
    });

    // Step 2: Create Item Entry Linked to Lot
    const newItem = await prisma.item.create({
      data: {
        lot_id: newLot.id,
        item_type: "Initial",
       
      },
    });

    // Step 3: Create AttributeValue Entry with Retrieved Item ID
    await prisma.attributeValue.create({
      data: {
        lot_id: newLot.id,
        items_id: newItem.item_id, // Dynamically referencing newly created item's ID
        attribute_id: 1,
        touchValue: touchValue ? parseFloat(touchValue) : null,
        value:parseFloat(initialWeight) || null,
        process_step_id:1
      },
    });

    await prisma.attributeValue.create({
      data: {
        lot_id: newLot.id,
        items_id: newItem.item_id, // Dynamically referencing newly created item's ID
        attribute_id: 2, // Assuming attribute_id is always 1
        value:parseFloat(initialWeight) || null,
        process_step_id:2,
       
        
      },
    });

   const processStepIds = await prisma.processSteps.findMany({
      select: { id: true }
    });

    const stepIds = processStepIds.map(step => step.id); // Extract IDs

    //  Now, fetch LotProcess with nested relations
    const items = await prisma.lotProcess.findMany({
      include: { 
        ProcessSteps: {
          include: {
            AttributeInfo: true,
            AttributeValues: { 
              where: {
                lot_id:Number(newLot.id),
                process_step_id: { in: stepIds } // ✅ Correctly filter step IDs
              }
            }
          }
        }
      }
    });
    return res.status(200).json({lotid:newLot.id, data:items });
  } catch (error) {
    console.error("Error creating lot:", error);
    res.status(400).json({ error: error.message });
  }
};

// const getAllLots = async (req, res) => {
//   try {
//     const lots = await prisma.lotInfo.findMany();
//     res.status(200).json(lots);
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// };


// const updateLotInfo = async (req, res) => {
//   const { id } = req.params; 
//   const {
//     lot_name,
//     lot_before_weight,
//     lot_after_weight,
//     lot_difference_weight,
//     lot_comments,
//     is_completed,
//   } = req.body;

//   try {
//     const updatedLot = await prisma.lotInfo.update({
//       where: { id: parseInt(id) },
//       data: {
//         lot_name,
//         lot_before_weight,
//         lot_after_weight,
//         lot_difference_weight,
//         lot_comments,
//         is_completed,
//       },
//     });
//     res.status(200).json(updatedLot);
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// };


// const deleteLotInfo = async (req, res) => {
//   const { id } = req.params;

//   try {
//     await prisma.lotInfo.delete({
//       where: { id: parseInt(id) }, 
//     });
//     res
//       .status(200)
//       .json({ message: `Lot with ID ${id} deleted successfully.` });
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// };


module.exports = {createLotInfo};
