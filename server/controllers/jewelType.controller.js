const { PrismaClient } = require("@prisma/client");
const prisma= new PrismaClient()

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
  const { master_jewel_id } = req.params;
  
  try {
    const jewelData = await prisma.masterJewelType.findUnique({
      where: { master_jewel_id: parseInt(master_jewel_id) },
      include: {
        MasterJewelTypeCustomerValue: {
          select: {
            customer_id: true,
            masterJewel_id: true,
            value: true,
            attribute1: true,
            attribute2: true
          }
        }
      }
    });

    if (!jewelData) {
      return res.status(404).json({ message: 'Jewel type not found' });
    }

    const resultArray = [{
      master_jewel_id: jewelData.master_jewel_id,
      jewel_name: jewelData.jewel_name,
      MasterJewelTypeCustomerValue: jewelData.MasterJewelTypeCustomerValue
    }];

    return res.json(resultArray);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};


module.exports={createJewelType,deleteJewelType,getAllJewelTypes,updateJewelType, getJewelWithCustomerValues }
