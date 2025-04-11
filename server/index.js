const {connectDB } =require('./config/dbConnection.js')
const express = require("express");
const chalk = require("chalk");
const cors = require("cors"); 
const lotRoutes = require("./routes/lot.routes");
const customerRoutes = require("./routes/customer.routes");
const processRoutes  = require("./routes/process.routes");
const jewelTypeRoutes=require("./routes/jewelType.routes.js");

const app = express();
const PORT = 5000;

app.use(cors()); 
app.use(express.json());
connectDB()
// Lot routes
app.use("/api/lot", lotRoutes);

// Customer routes
app.use("/api/customer", customerRoutes);

//Process routes

app.use("/api/process", processRoutes);

// JewelType routes

app.use("/api/jewelType",jewelTypeRoutes);

app.listen(PORT, () => {
  console.log(chalk.green(`Server running on http://localhost:${PORT}`));
});
