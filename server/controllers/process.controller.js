const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
// getAllLotProcess 


const getAllLot = async (req, res) => {
  try {
    // Fetch only lot IDs from lotInfo table
    const today = new Date();
    today.setHours(0, 0, 0, 0); // 12:00 AM

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999); // 11:59:59 PM

    // Fetch lot IDs created today
    const lotIds = await prisma.lotInfo.findMany({
      where: {
        createdAt: {
          gte: today,  // Greater than or equal to 12:00 AM
          lte: endOfDay // Less than or equal to 11:59:59 PM
        }
      },
      select: { id: true }
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


      allLotData.push({ lotid: lot.id, data: processes })

    }


    res.status(200).json({ data: allLotData });
  } catch (err) {
    console.error("Error fetching lot IDs:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};





const getlotProcessesById = async (req, res) => {
  try {
    console.log("Fetching all processes...");
    const { lot_id } = req.params;

    const lotExists = await prisma.lotInfo.findFirst({
      where: { id: Number(lot_id) },
    });

    if (!lotExists) {
      return res.status(404).json({ message: "Lot does not exist" });
    }
    // ✅ First, get all process step IDs
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
                lot_id: Number(lot_id),
                process_step_id: { in: stepIds } // ✅ Correctly filter step IDs
              }
            }
          }
        }
      }
    });

    console.log("Processes fetched successfully:", JSON.stringify(processes, null, 2));
    res.json(processes);
  } catch (error) {
    console.error("Error fetching processes:", error);
    res.status(500).json({ error: "Failed to fetch processes" });
  }
};

//create process for each attribute values
const saveProcess = async (req, res) => {
  var lotId = "";

  try {
    //   const {lotdata} = req.body;
    console.log('req', req.body);
    for (const lot of req.body.lotdata) {
      lotId = lot.lotid;

      if (!lot.data || !Array.isArray(lot.data)) {

        return res.status(400).json({ message: "Invalid request data" });
      }
      for (const process of lot.data) {

        for (const step of process.ProcessSteps) {


          if (step.process_id >= 4 && step.process_id <= 9) {//Individual Process object

            if (!step.AttributeValues || step.AttributeValues.length === 0) {
              continue;
            }

            let index = 0;
            let existingChildItems = [];
            let createdItems = ""




            for (const attrValue of step.AttributeValues) {

              if (attrValue.items_id === null && attrValue.attribute_id === 2) {

                if (step.process_id === 4) { // child items only created at wiring process 
                  let newItem = await prisma.item.create({
                    data: {
                      lot_id: attrValue.lot_id,
                      item_type: "childItem",
                      item_name: attrValue.item_name

                    }
                  })

                  await prisma.attributeValue.create({
                    data: {
                      process_step_id: attrValue.process_step_id,
                      lot_id: attrValue.lot_id,
                      attribute_id: attrValue.attribute_id,
                      items_id: newItem.item_id,
                      value: attrValue.value === null ? null : parseFloat(attrValue.value),
                      item_name: attrValue.item_name
                    },
                  });
                }
                else {
                  let childItems = await prisma.item.findMany({  // its create other process child items
                    where: {
                      lot_id: attrValue.lot_id,
                      item_type: "childItem",
                    },
                    select: { item_id: true }, // Only select the primary key (id)
                  });

                  existingChildItems = childItems.map(item => item.item_id);
                  createdItems = await prisma.attributeValue.create({
                    data: {
                      process_step_id: attrValue.process_step_id,
                      lot_id: attrValue.lot_id,
                      attribute_id: attrValue.attribute_id,
                      items_id: existingChildItems[index],
                      value: attrValue.value === null ? null : parseFloat(attrValue.value),
                      item_name: attrValue.item_name

                    },
                  });
                  ++index;

                }
                // this code items to stock


              }
              else {
                let childItems = await prisma.item.findMany({  // its stored after weight of child items
                  where: {
                    lot_id: attrValue.lot_id,
                    item_type: "childItem",
                  },
                  select: { item_id: true }, // Only select the primary key (id)
                });

                // ✅ Store only the primary keys in the array
                existingChildItems = childItems.map(item => item.item_id);
                console.log('key', existingChildItems);

                if (attrValue.items_id === null) {

                const createdItems=await prisma.attributeValue.create({
                    data: {
                      process_step_id: attrValue.process_step_id,
                      lot_id: attrValue.lot_id,
                      attribute_id: attrValue.attribute_id,
                      items_id: existingChildItems[index],
                      item_name: attrValue.item_name,
                      value: attrValue.value === null ? null : parseFloat(attrValue.value)

                    },
                  });
                  ++index;
                 
                  
                 
                 

                


                } else {
                  await prisma.attributeValue.updateMany({
                    where: {
                      process_step_id: attrValue.process_step_id,
                      lot_id: attrValue.lot_id,
                      attribute_id: attrValue.attribute_id,
                      items_id: attrValue.items_id
                    },
                    data: {
                      value: attrValue.value === null ? null : parseFloat(attrValue.value),
                      touchValue: attrValue.touchValue ?? null,
                      item_name: attrValue.item_name

                    },
                  });
                }
              }
            }
          }




          // Melting and Kambi Process

          else {
            if (!step.AttributeValues || step.AttributeValues.length === 0) {
              continue;
            }

            for (const attrValue of step.AttributeValues) {

              // if (!attrValue.attribute_id) {
              //   console.warn("Skipping attribute with missing attribute_id:", attrValue);
              //   continue;
              // }


              const existingAttribute = await prisma.attributeValue.findFirst({
                where: {
                  process_step_id: attrValue.process_step_id,
                  lot_id: attrValue.lot_id,
                  attribute_id: attrValue.attribute_id,
                  items_id: attrValue.items_id

                },
              });

              if (!existingAttribute) { // Create new item 
                await prisma.attributeValue.create({
                  data: {
                    process_step_id: attrValue.process_step_id,
                    lot_id: attrValue.lot_id,
                    attribute_id: attrValue.attribute_id,
                    items_id: attrValue.items_id,
                    item_name: attrValue.item_name,
                    value: attrValue.value === null ? null : parseFloat(attrValue.value)
                  },
                });
              }
              else { // updateItem
                await prisma.attributeValue.updateMany({
                  where: {
                    process_step_id: attrValue.process_step_id,
                    lot_id: attrValue.lot_id,
                    attribute_id: attrValue.attribute_id,
                    items_id: attrValue.items_id
                  },
                  data: {
                    value: attrValue.value === null ? null : parseFloat(attrValue.value),
                    touchValue: attrValue.touchValue ?? null,
                    item_name: attrValue.item_name

                  },
                });
              }



            }
          }

        }
      }
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0); // 12:00 AM

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999); // 11:59:59 PM

    // Fetch lot IDs created today
    const lotIds = await prisma.lotInfo.findMany({
      where: {
        createdAt: {
          gte: today,  // Greater than or equal to 12:00 AM
          lte: endOfDay // Less than or equal to 11:59:59 PM
        }
      },
      select: { id: true }
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


      allLotData.push({ lotid: lot.id, data: processes })

    }


    res.status(200).json({ data: allLotData });
  } catch (error) {
    console.error("Error creating process:", error);
    return res.status(500).json({ message: "Internal Server Error", error });
  }



};

// update ecah process atttribute value
const updateProcess = async (req, res) => {
  try {
    console.log('reqbody', req.body);
    for (const lot of req.body.lotdata) {

      if (!lot.data || !Array.isArray(lot.data)) {
        return res.status(400).json({ message: "Invalid request data" });
      }



      for (const process of lot.data) {
        for (const step of process.ProcessSteps) {
          if (!step.AttributeValues || step.AttributeValues.length === 0) {
            continue;
          }

          for (const attrValue of step.AttributeValues) {
            if (!attrValue.attribute_id || !attrValue.lot_id || !attrValue.process_step_id) {
              continue; // Skip if required fields are missing
            }

            const updateResult = await prisma.attributeValue.updateMany({
              where: {
                process_step_id: attrValue.process_step_id,
                lot_id: attrValue.lot_id,
                attribute_id: attrValue.attribute_id,
                items_id: attrValue.items_id
              },
              data: {
                value: attrValue.value ?? null,
                touchValue: attrValue.touchValue ?? null,

              },
            });





          }
        }
      }
    }






    const lotIds = await prisma.lotInfo.findMany({  // send response all lot data
      select: {
        id: true, // Select only the 'lotid' field
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


      allLotData.push({ lotid: lot.id, data: processes })

    }

    return res.status(200).json({ data: allLotData });
  } catch (error) {
    console.error("Error updating process:", error);
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

const deleteLot = async (req, res) => {
  try {
    const { lotid } = req.params;
    const lotId = parseInt(lotid);

    console.log('Deleting Lot with ID:', lotId);

    // Step 1: Delete AttributeValues related to LotInfo
    await prisma.attributeValue.deleteMany({
      where: { lot_id: lotId }
    });

    // Step 2: Delete Items related to LotInfo
    await prisma.item.deleteMany({
      where: { lot_id: lotId }
    });

    // Step 3: Delete the LotInfo record
    await prisma.lotInfo.delete({
      where: { id: lotId }
    });

    res.status(200).json({ message: `Lot ${lotId} and related records deleted successfully!` });
  } catch (error) {
    console.error('Error deleting lot:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};

const deleteByItemId = async (req, res) => {
  try {
    const { lotid, items_id } = req.params;
    const lotIdInt = parseInt(lotid);
    const itemIdInt = parseInt(items_id);

    console.log(`Deleting item with ID: ${itemIdInt} from Lot ID: ${lotIdInt}`);

    // Step 1: Delete AttributeValues related to the specific lot and item
    await prisma.attributeValue.deleteMany({
      where: { lot_id: lotIdInt, items_id: itemIdInt }
    });

    // Step 2: Delete the specific Item related to LotInfo
    await prisma.item.deleteMany({
      where: { lot_id: lotIdInt, item_id: itemIdInt }
    });

    // Step 3: Fetch all LotInfo IDs
    const today = new Date();
    today.setHours(0, 0, 0, 0); // 12:00 AM

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999); // 11:59:59 PM

    // Fetch lot IDs created today
    const lotIds = await prisma.lotInfo.findMany({
      where: {
        createdAt: {
          gte: today,  // Greater than or equal to 12:00 AM
          lte: endOfDay // Less than or equal to 11:59:59 PM
        }
      },
      select: { id: true }
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


      allLotData.push({ lotid: lot.id, data: processes })

    }



  

    return res.status(200).json({ data: allLotData });

  } catch (error) {
    console.error('Error deleting item and fetching lots:', error);
    return res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
};

const getLotsByDateRange = async (req, res) => {
  try {
    const { fromDate, toDate } = req.body;
   console.log(fromDate,toDate)

    if (!fromDate || !toDate) {
      return res.status(400).json({ error: 'fromDate and toDate are required' });
    }

    const start = new Date(fromDate);
    const end = new Date(toDate);
    end.setHours(23, 59, 59, 999); // Set end time to end of the day

    // 1. Get all lot IDs in the range
    const lotIds = await prisma.lotInfo.findMany({
      where: {
        createdAt: {
          gte: start,
          lte: end
        }
      },
      select: { id: true }
    });

    const allLotData = [];

    for (const lot of lotIds) {
      // 2. Get all process step IDs
      const processStepIds = await prisma.processSteps.findMany({
        select: { id: true }
      });

      const stepIds = processStepIds.map(step => step.id);

      // 3. Get LotProcess data for each lot with nested relations
      const processes = await prisma.lotProcess.findMany({
        include: {
          ProcessSteps: {
            include: {
              AttributeInfo: true,
              AttributeValues: {
                where: {
                  lot_id: lot.id,
                  process_step_id: { in: stepIds }
                }
              }
            }
          }
        }
      });

      allLotData.push({ lotid: lot.id, data: processes });
    }

    res.status(200).json({ data: allLotData });
  } catch (err) {
    console.error("Error fetching lot data by date range:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};


module.exports = {
  getlotProcessesById,
  getLotsByDateRange,
  getAllLot,
  saveProcess,
  updateProcess,
  deleteLot,
  deleteByItemId

};

