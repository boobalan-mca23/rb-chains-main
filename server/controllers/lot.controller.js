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
    touchValue,
    today
  } = req.body;

  console.log("Incoming payload:", req.body);

  try {
    // Step 1: Create Lot Entry
    if (!initialWeight || !touchValue) {
      return res.status(400).json({ message: "Initial Weight is required" })
    } else {
      const newLot = await prisma.lotInfo.create({//create lot
        data: {
          lot_initial_weight: parseFloat(initialWeight) || null,
          scarpDate: String(today) || null
        },
      });

      const baseData = {
        lot_id: newLot.id,
        scarpDate: today,
        itemTotal: 0,
        scarp: 0,
        touch: 0,
        cuttingScarp: 0,
        totalScarp: 0,
      };

      const scarpProcesses = [3, 6].map(process_id => ({
        ...baseData,
        process_id,
      }));
      console.log('scarpProcess', scarpProcesses)
      
      await prisma.scarpInfo.createMany({
        data: scarpProcesses,
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
          value: parseFloat(initialWeight) || null,
          process_step_id: 1
        },
      });

      await prisma.attributeValue.create({
        data: {
          lot_id: newLot.id,
          items_id: newItem.item_id, // Dynamically referencing newly created item's ID
          attribute_id: 2, // Assuming attribute_id is always 1
          value: parseFloat(initialWeight) || null,
          process_step_id: 2,
        },
      });


      const todayDate = new Date();
      todayDate.setHours(0, 0, 0, 0); // 12:00 AM

      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999); // 11:59:59 PM

      // Fetch lot IDs created today
      const lotIds = await prisma.lotInfo.findMany({
        where: {
          createdAt: {
            gte: todayDate,  // Greater than or equal to 12:00 AM
            lte: endOfDay // Less than or equal to 11:59:59 PM
          },
        },
        select: {
          id: true,
          scarpDate: true
        }
      });

      const allLotData = []
      for (const lot of lotIds) {


        const processStepIds = await prisma.processSteps.findMany({
          select: { id: true }
        });

        const stepIds = processStepIds.map(step => step.id); // Extract IDs

        //  Now, fetch LotProcess with nested relations
        const processes = await prisma.lotProcess.findMany({
          include: {

            ProcessSteps: {
              include: {
                AttributeInfo: true,
                AttributeValues: {
                  where: {
                    lot_id: lot.id,
                    process_step_id: { in: stepIds } // ✅ Correctly filter step IDs
                  }
                }
              }
            }
          }
        })


        allLotData.push({ lotid: lot.id, lotDate: lot.scarpDate, data: processes })

      }
      // Flatten Array like lot and sacrp
      const finalData = []
      console.log('lotInfo', allLotData)
      for (const [index, item] of allLotData.entries()) {
        if (finalData.length === 0) {
          finalData.push(item);
        } else {
          if (finalData[finalData.length - 1].lotDate === item.lotDate) {
            finalData.push(item);
          } else {
            const scarpProcesses = await prisma.scarpInfo.findMany({
              where: {
                scarpDate:finalData[finalData.length - 1].lotDate,
                process_id: { in: [3, 6] },
              },
              orderBy: {
                id: 'asc', //  ensures you get oldest records first
              },
              take: 2       //  limits the result to first 2
            });

            const mechine = scarpProcesses.find(item => item.process_id === 3);
            const cutting = scarpProcesses.find(item => item.process_id === 6);
            finalData.push({"scarpBox":[{"mechine":mechine},{"cutting": cutting }] });
            finalData.push(item);
          }
        }
      }

      // After the loop, push scarpValue for last lot
      const lastLotDate = finalData[finalData.length - 1].lotDate;
      const lastScarpProcess = await prisma.scarpInfo.findMany({
              where: {
                scarpDate:lastLotDate,
                process_id: { in: [3, 6] },
              },
              orderBy: {
                id: 'asc', //  ensures you get oldest records first
              },
              take: 2       //  limits the result to first 2
            });

            const mechine = lastScarpProcess.find(item => item.process_id === 3);
            const cutting = lastScarpProcess.find(item => item.process_id === 6);
            finalData.push({"scarpBox":[{"mechine":mechine},{"cutting": cutting }] });
            console.log('finalLot in lot create controller ', finalData)

       return res.status(200).json(finalData);
    }



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


module.exports = { createLotInfo };
