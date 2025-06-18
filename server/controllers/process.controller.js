const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
//getAllLotProcess 
const dayjs = require('dayjs')
const utc = require('dayjs/plugin/utc')
const timezone = require('dayjs/plugin/timezone')

// Load plugins
dayjs.extend(utc)
dayjs.extend(timezone)

//Convert to Asia/Kolkata time




const getAllLot = async (req, res) => {
  try {

    // // Get current date (today)
    // const start = new Date();
    // start.setHours(0, 0, 0, 0); // Set to 12:00 AM of today

    // const end = new Date();
    // end.setHours(23, 59, 59, 999); // Set to 11:59:59.999 PM of today

    // console.log('Start of today:', start);
    // console.log('End of today:', end);

    const start = dayjs().tz('Asia/Kolkata').startOf('day').toDate();  // Start of today (12:00 AM IST)
    const end = dayjs().tz('Asia/Kolkata').endOf('day').toDate();    // End of today (11:59:59.999 PM IST)

    console.log('Start of today (IST):', start);
    console.log('End of today (IST):', end);


    // Now use these dates in your Prisma query
    const lotIds = await prisma.lotInfo.findMany({
      where: {
        createdAt: {
          gte: start,
          lte: end
        }
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
    const finalData = []
    console.log('lotInfo', allLotData)
    if (allLotData.length >= 1) { // if lot data empty return [] array
      for (const [index, item] of allLotData.entries()) {
        if (finalData.length === 0) {
          finalData.push(item);
        } else {
          if (finalData[finalData.length - 1].lotDate === item.lotDate) {
            finalData.push(item);
          } else {
            const scarpProcesses = await prisma.scarpInfo.findMany({
              where: {
                scarpDate: finalData[finalData.length - 1].lotDate,
                process_id: { in: [3, 6] },
              },
              orderBy: {
                id: 'asc', //  ensures you get oldest records first
              },
              take: 2       //  limits the result to first 2
            });

            const mechine = scarpProcesses.find(item => item.process_id === 3);
            const cutting = scarpProcesses.find(item => item.process_id === 6);
            finalData.push({ "scarpBox": [{ "mechine": mechine }, { "cutting": cutting }] });
            finalData.push(item);
          }
        }
      }

      // After the loop, push scarpValue for last lot
      const lastLotDate = finalData[finalData.length - 1].lotDate;
      const lastScarpProcess = await prisma.scarpInfo.findMany({
        where: {
          scarpDate: lastLotDate,
          process_id: { in: [3, 6] },
        },
        orderBy: {
          id: 'asc', //  ensures you get oldest records first
        },
        take: 2       //  limits the result to first 2
      });

      const mechine = lastScarpProcess.find(item => item.process_id === 3);
      const cutting = lastScarpProcess.find(item => item.process_id === 6);
      finalData.push({ "scarpBox": [{ "mechine": mechine }, { "cutting": cutting }] });



    }


    console.log('finalLot in GetAll contoller', finalData)

    res.status(200).json({ data: finalData });
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

    const lotData = req.body.lotdata

    if (!req.body.lotdata) {
      return res.status(400).json({ status: 'noData', message: "No Lot Data" });
    }

    for (const lot of lotData) {
      lotId = lot.lotid;
      if (lot.scarpValue) {

      }

      if (lot.data) {

        for (const process of lot.data) {

          for (const step of process.ProcessSteps) {


            if (step.process_id >= 3 && step.process_id <= 8) {//Individual Process object

              if (!step.AttributeValues || step.AttributeValues.length === 0) {
                continue;
              }

              let index = 0;
              let existingChildItems = [];

              for (const attrValue of step.AttributeValues) {


                if (step.process_id === 3) {

                  if (attrValue.process_step_id === 6 && attrValue.attribute_id === 2) { // wiring Process Before weight

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
                          value: attrValue.value === null ? null : parseFloat(attrValue.value),

                        },
                      });

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
                        },
                      });

                    }

                  }
                }
                if (attrValue.items_id === null && attrValue.attribute_id === 3) { // wiring after weight created

                  if (step.process_id === 3) { // child items only created at wiring process


                    if (!attrValue.master_jewel_id) {
                      return res.status(400).json({
                        statusMsg: "noMasterId",
                        message: "JewelName is Required"
                      });
                    } else {
                      let newItem = await prisma.item.create({ //item create
                        data: {
                          lot_id: attrValue.lot_id,
                          item_type: "childItem",
                          

                        }
                      })
                      await prisma.masterJewelItemMapper.create({
                        data: {
                          item_id: newItem.item_id,
                          master_jewel_id: attrValue.master_jewel_id
                        }
                      });

                      await prisma.attributeValue.create({ //item value
                        data: {
                          process_step_id: attrValue.process_step_id,
                          lot_id: attrValue.lot_id,
                          attribute_id: attrValue.attribute_id,
                          items_id: newItem.item_id,
                          value: attrValue.value === null ? null : parseFloat(attrValue.value),
                          touchValue: attrValue.touchValue ? parseFloat(attrValue.touchValue) : null,
                          item_name: attrValue.item_name
                        },
                      });
                    }

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
                        items_id: existingChildItems[attrValue.index],
                        value: attrValue.value === null ? null : parseFloat(attrValue.value),
                        touchValue: attrValue.touchValue ? parseFloat(attrValue.touchValue) : null,
                        item_name: attrValue.item_name

                      },
                    });
                    ++index;
                    console.log('process_step_id', attrValue.process_step_id)

                    if (attrValue.process_step_id === 26) {
                      console.log('stockkkkk')
                      const childItems = await prisma.item.findMany({
                        where: {
                          lot_id: attrValue.lot_id,
                          item_type: "childItem",
                        },
                        select: { item_id: true },
                      });

                      const existingChildItems = childItems.map(item => item.item_id);
                      console.log('stock created time', existingChildItems)
                      for (const itemId of existingChildItems) {
                        const validAttributes = await prisma.attributeValue.findMany({
                          where: {
                            lot_id: attrValue.lot_id,
                            items_id: itemId,
                            process_step_id: attrValue.process_step_id,
                          },
                          select: {
                            value: true,
                          },
                        });

                        const hasValid = validAttributes.some(attr => attr.value !== null);
                        console.log('console from created time', hasValid);

                        if (hasValid) {
                          // Check if the item_id already exists in ProductStocks
                          const existingStock = await prisma.productStocks.findFirst({
                            where: {
                              item_id: itemId,
                            },
                          });

                          if (!existingStock) {
                            // If not exists, create the ProductStocks entry
                            await prisma.productStocks.create({
                              data: {
                                item_id: itemId,
                                product_status: "active", // or whatever default status you want
                              },
                            });
                            console.log(`Item ID ${itemId} added to ProductStocks.`);
                          } else {
                            console.log(`Item ID ${itemId} already exists in ProductStocks.`);
                          }
                        }
                      }
                    }


                  }
                }
                else {
                  let childItems = await prisma.item.findMany({  // its stored other weight of child items
                    where: {
                      lot_id: attrValue.lot_id,
                      item_type: "childItem",
                    },
                    select: { item_id: true }, // Only select the primary key (id)
                  });

                  // ✅ Store only the primary keys in the array
                  existingChildItems = childItems.map(item => item.item_id);

                  if (attrValue.items_id === null) {

                    let createdItems = await prisma.attributeValue.create({
                      data: {
                        process_step_id: attrValue.process_step_id,
                        lot_id: attrValue.lot_id,
                        attribute_id: attrValue.attribute_id,
                        items_id: existingChildItems[attrValue.index],
                        item_name: attrValue.item_name,
                        value: attrValue.value === null ? null : parseFloat(attrValue.value),
                        touchValue: attrValue.touchValue ? parseFloat(attrValue.touchValue) : null

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
                    //Item Name Update
                    // await prisma.item.update({
                    //   where: {
                    //     item_id: attrValue.items_id
                    //   },
                    //   data: {
                    //     item_name: attrValue.item_name
                    //   }
                    // })
                    // MasterJewelItemMapper Update
                    if(attrValue.process_step_id===7){// its only create for child item
                    const existingItem = await prisma.masterJewelItemMapper.findFirst({
                      where: { item_id: attrValue.items_id }
                    });

                    if (existingItem) {
                      await prisma.masterJewelItemMapper.update({
                        where: { id: existingItem.id },
                        data: { master_jewel_id: attrValue.master_jewel_id }
                      });
                    }
                    else{
                          console.log('master id',attrValue.master_jewel_id)
                        if(attrValue.master_jewel_id){
                            await prisma.masterJewelItemMapper.create({
                         data: {
                          item_id: attrValue.items_id,
                          master_jewel_id: attrValue.master_jewel_id
                        }
                      });
                    }
                  }
                    
                    }
                    


                    //Stock moved to Update time
                    if (attrValue.process_step_id === 26) {
                      const childItems = await prisma.item.findMany({
                        where: {
                          lot_id: attrValue.lot_id,
                          item_type: "childItem",
                        },
                        select: { item_id: true },
                      });

                      const existingChildItems = childItems.map(item => item.item_id);

                      for (const itemId of existingChildItems) {
                        const validAttributes = await prisma.attributeValue.findMany({
                          where: {
                            lot_id: attrValue.lot_id,
                            items_id: itemId,
                            process_step_id: attrValue.process_step_id,
                          },
                          select: {
                            value: true,
                          },
                        });

                        const hasValid = validAttributes.some(attr => attr.value !== null);
                        // console.log('console from created time', hasValid);

                        if (hasValid) {
                          // Check if the item_id already exists in ProductStocks
                          const existingStock = await prisma.productStocks.findFirst({
                            where: {
                              item_id: itemId,
                            },
                          });

                          if (!existingStock) {
                            // If not exists, create the ProductStocks entry
                            await prisma.productStocks.create({
                              data: {
                                item_id: itemId,
                                product_status: "active", // or whatever default status you want
                              },
                            });
                            console.log(`Item ID ${itemId} added to ProductStocks.`);
                          } else {
                            console.log(`Item ID ${itemId} already exists in ProductStocks.`);
                          }
                        }
                      }
                    }


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
                      value: attrValue.value === null ? null : parseFloat(attrValue.value),
                      touchValue: attrValue.touchValue ? parseFloat(attrValue.touchValue) : null
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




      } else {
      
        // Update mechine
        await prisma.scarpInfo.updateMany({
          where: { id: lot.scarpBox[0].mechine.id },
          data: {
            itemTotal: lot.scarpBox[0].mechine.itemTotal ?? 0,
            scarp: lot.scarpBox[0].mechine.scarp ?? 0,
            touch: lot.scarpBox[0].mechine.touch ?? 0,
            cuttingScarp: lot.scarpBox[0].mechine.cuttingScarp ?? 0,
            totalScarp: lot.scarpBox[0].mechine.totalScarp ?? 0,
          }
        });

        // Update cutting
        await prisma.scarpInfo.updateMany({
          where: { id: lot.scarpBox[1].cutting.id },
          data: {
            itemTotal: lot.scarpBox[1].cutting.itemTotal ?? 0,
            scarp: lot.scarpBox[1].cutting.scarp ?? 0,
            touch: lot.scarpBox[1].cutting.touch ?? 0,
            cuttingScarp: lot.scarpBox[1].cutting.cuttingScarp ?? 0,
            totalScarp: lot.scarpBox[1].cutting.totalScarp ?? 0,
          }
        });

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
    const finalData = []

    if (allLotData.length >= 1) {

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
                scarpDate: finalData[finalData.length - 1].lotDate,
                process_id: { in: [3, 6] },
              },
              orderBy: {
                id: 'asc', //  ensures you get oldest records first
              },
              take: 2       //  limits the result to first 2
            });

            const mechine = scarpProcesses.find(item => item.process_id === 3);
            const cutting = scarpProcesses.find(item => item.process_id === 6);
            finalData.push({ "scarpBox": [{ "mechine": mechine }, { "cutting": cutting }] });
            finalData.push(item);
          }
        }
      }

      // After the loop, push scarpValue for last lot
      const lastLotDate = finalData[finalData.length - 1].lotDate;
      const lastScarpProcess = await prisma.scarpInfo.findMany({
        where: {
          scarpDate: lastLotDate,
          process_id: { in: [3, 6] },
        },
        orderBy: {
          id: 'asc', //  ensures you get oldest records first
        },
        take: 2       //  limits the result to first 2
      });

      const mechine = lastScarpProcess.find(item => item.process_id === 3);
      const cutting = lastScarpProcess.find(item => item.process_id === 6);
      finalData.push({ "scarpBox": [{ "mechine": mechine }, { "cutting": cutting }] });


    }



    console.log('finalLot in lot create controller ', finalData)

    res.status(200).json({ data: finalData });
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

const getLotsByDateRange = async (req, res) => {
  try {
    const { fromDate, toDate } = req.body;
    console.log(fromDate, toDate)

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
      select: {
        id: true,
        scarpDate: true
      }
    });

    const allLotData = [];
    console.log(lotIds)
    if (lotIds.length === 0) {
      return res
    }
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
                },

              }
            }
          }
        }
      });

      allLotData.push({ lotid: lot.id, lotDate: lot.scarpDate, data: processes });

    }
    const finalData = []
    console.log('filter lot', allLotData)
    if (allLotData.length >= 1) {
      for (const [index, item] of allLotData.entries()) {
        if (finalData.length === 0) {
          finalData.push(item);
        } else {
          if (finalData[finalData.length - 1].lotDate === item.lotDate) {
            finalData.push(item);
          } else {
            const scarpProcesses = await prisma.scarpInfo.findMany({
              where: {
                scarpDate: finalData[finalData.length - 1].lotDate,
                process_id: { in: [3, 6] },
              },
              orderBy: {
                id: 'asc', //  ensures you get oldest records first
              },
              take: 2       //  limits the result to first 2
            });

            const mechine = scarpProcesses.find(item => item.process_id === 3);
            const cutting = scarpProcesses.find(item => item.process_id === 6);
            finalData.push({ "scarpBox": [{ "mechine": mechine }, { "cutting": cutting }] });
            finalData.push(item);
          }
        }
      }

      // After the loop, push scarpValue for last lot
      const lastLotDate = finalData[finalData.length - 1].lotDate;
      const lastScarpProcess = await prisma.scarpInfo.findMany({
        where: {
          scarpDate: lastLotDate,
          process_id: { in: [3, 6] },
        },
        orderBy: {
          id: 'asc', //  ensures you get oldest records first
        },
        take: 2       //  limits the result to first 2
      });

      const mechine = lastScarpProcess.find(item => item.process_id === 3);
      const cutting = lastScarpProcess.find(item => item.process_id === 6);
      finalData.push({ "scarpBox": [{ "mechine": mechine }, { "cutting": cutting }] });





    }


    // After the loop, push scarpValue for last lot



    console.log('finalLot', finalData)
    res.status(200).json({ data: finalData });
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


};

