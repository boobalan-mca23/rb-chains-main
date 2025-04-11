const { PrismaClient } = require("@prisma/client");
const prisma= new PrismaClient()

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
const getJewelType=async(req,res)=>{
    try{
              
        const jewelType=await prisma.masterJewelType.findMany({
            select:{
                master_jewel_id:true,
                jewel_name:true
            }
        })

              return res.status(200).json({message:"allJewelType",allJewel:jewelType})
            }catch(err){
              return res.status(500).json({error:"Failed to Create a JewelType",})
            }
}
module.exports={getJewelType}