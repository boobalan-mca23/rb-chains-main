const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient()




//createJewelType

const createJewelType=async(req,res)=>{
    const{jewelName}=req.body
    console.log('req.body',req.body)

    try{
      if(!jewelName){
        return res.status(400).json({error:"jewelName is required"})
      }
      const newJeweltype=await prisma.masterJewelType.create({
        data:{
            jewel_name :jewelName
        },
      })
      return res.status(201).json({message:"newJewelCreated",newJewel:newJeweltype})
    }catch(err){
      return res.status(500).json({error:"Failed to Create a JewelType",})
    }
}

// deleteJewelType

const deleteJewelType =async (req,res)=>{
  const {master_jewel_id} = req.params;
  console.log(`Attempting to delete JewelType with ID: ${master_jewel_id}`)
try{
  let itemIds=await prisma.masterJewelItemMapper.findMany({
    where:{
      master_jewel_id:parseInt(master_jewel_id)
    },
    select:{
      item_id:true
    }
  })
let processStep = [];
  
  if(itemIds.length>=1){
    
    for(const id of itemIds){
     let result=await prisma.attributeValue.findMany({
      where:{
        items_id:id.item_id
      },
      select:{
        process_step_id:true,
        items_id:true
      }
    })
     processStep = processStep.concat(result);
   }
  }
  console.log('processStepid',processStep)
  if(processStep.length>=1){
   for(const processStepId of processStep){
       await prisma.attributeValue.updateMany({
         where:{
          process_step_id:processStepId.process_step_id,
          items_id:processStepId.items_id
         },
         data:{
          item_name:""
         }
       })
   }
  }
  
   

  const deletedJewelType= await prisma.masterJewelType.delete({
    where:{
      master_jewel_id:parseInt(master_jewel_id),
    },
  })
  return res.status(200).json({
    message:"JewelType deleted successfully",
    deletedJewelType,
  })

}catch(err){
  console.error('Error deleting JewelType', err);
  return res.status(500).json({error:'Failed to delete JewelType'})
}
}

const getAllJewelTypes = async (req, res) => {
  try {
    const allTypes = await prisma.masterJewelType.findMany();
    res.status(200).json(allTypes);
  } catch (err) {
    console.error("Error fetching jewel types:", err);
    res.status(500).json({ error: "Failed to fetch jewel types" });
  }
};


//update 
const updateJewelType =async(req,res)=>{
  const {master_jewel_id} =req.params;
  const {jewelName} =req.body;

  if(!jewelName){
    return res.status(400).json({error:'jewelName is required'})
  }

  try{
    const updatedJewelType=await prisma.masterJewelType.update({
      where:{
        master_jewel_id:parseInt(master_jewel_id)
      },
      data:{
        jewel_name:jewelName,
      },
    });
    return res.status(200).json({message:'JewelType updated successfully', updatedJewelType})


  }catch(err){

    console.error('Error updating JewelType',err);
    return res.status(500).json({error:'Failed to update jewelType'})
  }
}


const getJewelWithCustomerValues = async (req, res) => {
  const { customer_id } = req.params;
  console.log('customer id',customer_id);

  try {
    const jewelData = await prisma.masterJewelType.findMany({
      select: {
        master_jewel_id: true,
        jewel_name: true,
        MasterJewelTypeCustomerValue: {
          where: {
            customer_id: Number(customer_id)
          },
          select: {
            id:true,
            customer_id: true,
            masterJewel_id: true,
            value: true
          }
        }
      }
    });
    console.log('res from jewel',jewelData)
    return res.status(200).json(jewelData);
  } catch (err) {
    console.error("Error fetching jewels:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// createCutomer percentage

// const createCustomerJewelPercentage = async (req, res) => {
//   const { itemList } = req.body;
//   console.log(itemList)

//   try {
//     if (!itemList || itemList.length === 0) {
//       return res.status(400).json({ error: "itemList is required" });
//     }

//     for (const item of itemList) {
//       const valueData = item.MasterJewelTypeCustomerValue?.[0];
//       console.log('value',valueData);

//       if (valueData && valueData.value !== "") {
//         if (!valueData. id  ) {
//           // Create new record
//           await prisma.masterJewelTypeCustomerValue.create({
//             data: {
//               customer_id: valueData.customer_id,
//               masterJewel_id: valueData.masterJewel_id,
//               value: valueData.value,
            
//             },
//           });
//         } else {
//           //  update case
//           console.log('percentage',valueData.value)
//           await prisma.masterJewelTypeCustomerValue.update({
//             where: { id: valueData.id },
//             data: {
//               customer_id: valueData.customer_id,
//               masterJewel_id: valueData.masterJewel_id,
//               value: valueData.value,

//             },
//           });
//         }
//       }
//     }

//     res.status(200).json({ message: "Customer Jewel Percentages created successfully" });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Failed to save customer percentages" });
//   }
// };

const createCustomerJewelPercentage = async (req, res) => {
  const { itemList } = req.body;

  try {
    if (!itemList || itemList.length === 0) {
      return res.status(400).json({ error: "itemList is required" });
    }

    for (const item of itemList) {
      const valueData = item.MasterJewelTypeCustomerValue?.[0];



      // Skip if no value or empty string
      if (!valueData || valueData.value === "") continue;

      if (valueData.id) {
        // ✅ If ID exists: Update existing entry
        await prisma.masterJewelTypeCustomerValue.update({
          where: { id: valueData.id },
          data: {
            customer_id: valueData.customer_id,
            masterJewel_id: valueData.masterJewel_id,
            value: valueData.value,
          },
        });
      } else {
        // ✅ If no ID: Create new entry
        await prisma.masterJewelTypeCustomerValue.create({
          data: {
            customer_id: valueData.customer_id,
            masterJewel_id: valueData.masterJewel_id,
            value: valueData.value,
          },
        });

      }
    }

    res.status(200).json({ message: "Customer Jewel Percentages saved successfully" });

  } catch (err) {
    console.error("Error saving percentages:", err);
    res.status(500).json({ error: "Failed to save customer percentages" });
  }
};



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
      console.log(mapper.length)
      return res.status(400).json({'productWeight':[] });
    }

    const allActiveProducts = [];

    for (const obj of mapper) {
      const activeProducts = await prisma.productStocks.findMany({
        where: {
          item_id: obj.item_id,
          product_status: "active"
        }
      });
       if(activeProducts){// if condition is check that item exits stock
        allActiveProducts.push(...activeProducts); // Merge results
      }
    }
    const productWeight = []

   
    for (const activeProducts of allActiveProducts) {
      console.log('activeProducts', activeProducts.item_id)
      const weight = await prisma.attributeValue.findMany({
        where: {
          items_id: activeProducts.item_id,
          process_step_id: 26
        },
        select: {
          item_name:true,
          value: true,
          touchValue:true
        }
      })
      const enrichedWeights = weight.map(weight => ({
        ...weight,
        stock_id: activeProducts.id
      }));

      productWeight.push(...enrichedWeights)
    }
    
    // ✅ Only send response after all mapper items are processed
    return res.send({ 'productsWeight': productWeight });

  } catch (err) {
    console.error("Error fetching weight:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports={createJewelType,deleteJewelType,getAllJewelTypes,updateJewelType, getJewelWithCustomerValues,getJewelType, billingProductWeight,createCustomerJewelPercentage }




