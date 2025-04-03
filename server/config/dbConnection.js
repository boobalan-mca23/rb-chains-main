// import { PrismaClient } from '@prisma/client';
const {PrismaClient}=require('@prisma/client');

const prisma = new PrismaClient();

const connectDB = async () => {
  try {
    await prisma.$connect();
    console.log('MySQL Database Connected Successfully!');
  } catch (error) {
    console.error('MySQL Database Connection Error:', error);
    process.exit(1); // Exit if connection fails
  }
};

module.exports={connectDB}
