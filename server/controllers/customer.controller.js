const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const createCustomer = async (req, res) => {
  const { customer_name, customer_shop_name, phone_number, address } = req.body;
  if (!customer_name) {
    return res.status(400).json({ error: "Customer name is required" });
  }
  console.log(req.body);

  try {
    const newCustomer = await prisma.customerInfo.create({
      data: {
        customer_name: customer_name,
        customer_shop_name: customer_shop_name || null,
        phone_number: phone_number || null,
        address: address || null,
      },
    });
     await prisma.customerBalance.create({
      data:{
        customer_id:newCustomer.customer_id,
        expure:0.0,
        balance:0.0
      }
     })
    res.status(201).json(newCustomer);
  } catch (error) {
    console.error("Error creating customer:", error);
    res.status(500).json({ error: "Failed to create customer" });
  }
};

const deleteCustomer = async (req, res) => {
  const { customer_id } = req.params;
  console.log(`Attempting to delete customer with ID: ${customer_id}`);

  try {
    const deletedCustomer = await prisma.customerInfo.delete({
      where: { customer_id: parseInt(customer_id) },
    });
    res.status(200).json({
      message: "Customer deleted successfully",
      customer: deletedCustomer,
    });
  } catch (error) {
    console.error("Error deleting customer:", error);
    res.status(500).json({ error: "Failed to delete customer" });
  }
};

const updateCustomer = async (req, res) => {
  const { customer_id } = req.params;
  const { customer_name, customer_shop_name, phone_number, address } = req.body;

  try {
    const updatedCustomer = await prisma.customerInfo.update({
      where: { customer_id: parseInt(customer_id) },
      data: {
        customer_name,
        customer_shop_name,
        phone_number,
        address,
      },
    });
    res.status(200).json(updatedCustomer);
  } catch (error) {
    console.error("Error updating customer:", error);
    res.status(500).json({ error: "Failed to update customer" });
  }
};
const getAllCustomers = async (req, res) => {

  try {
    const customers = await prisma.customerInfo.findMany({
      include:{
        customerBalance:true
      }
    }); 
    res.status(200).json(customers);
  } catch (error) {
    console.error("Error fetching customers:", error);
    res.status(500).json({ error: "Failed to fetch customers" });
  }
};


const getCustomerById = async (req, res) => {
  const { customer_id } = req.params;

  try {
    const customer = await prisma.customerInfo.findUnique({
      where: { customer_id: parseInt(customer_id) },
    });

    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    res.status(200).json(customer);
  } catch (error) {
    console.error("Error fetching customer:", error);
    res.status(500).json({ error: "Failed to fetch customer" });
  }
};
//get Customer detail with Percentage value
const getCustomerValueWithPercentage = async (req, res) => {
  try {
    const customers = await prisma.customerInfo.findMany({
      include: {
        customerBalance:true,
        MasterJewelTypeCustomerValue: true, // include related percentage data
      },
    });

    res.status(200).json(customers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch customer percentage" });
  }
};

//get closing balance for customer
const getCustomerClosing = async (req, res) => {
  console.log(req.params)
  try {
    const closingBalance = await prisma.closingBalance.findFirst({
      where:{
        customer_id:parseInt(req.params.id)
      },
      select:{
        closing_balance:true
      }

    });

    res.status(200).json({closingBalance:closingBalance?(closingBalance.closing_balance).toFixed(3):0});
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch customer closingBalance" });
  }
};

module.exports = {
  createCustomer,
  deleteCustomer,
  updateCustomer,
  getAllCustomers,
  getCustomerById,
  getCustomerValueWithPercentage,
  getCustomerClosing,
  
};
