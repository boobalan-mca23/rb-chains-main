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
    const customers = await prisma.customerInfo.findMany(); 
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

module.exports = {
  createCustomer,
  deleteCustomer,
  updateCustomer,
  getAllCustomers,
  getCustomerById,
};
