

import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import Home from "./Components/Home/home";
import Nav from "./Components/Navbar/nav";
import Customer from "./Components/Customer/customer";
import Billing from "./Components/Billing/billing";
import Report from "./Components/Report/report";
import Process from "./Components/Lot/process";
import Dailyreport from "./Components/Report/dailyreport";
import Customerreport from "./Components/Report/custreport";
import Master from './Components/MasterFile/Master'
import Item from "./Components/ItemFile/Item";
import UpdateBill from "./Components/Billing/updateBill";
import StockReport from "./Components/Report/stockreport";
import SalesReport from "./Components/Report/SalesReport";
import Receipt from "./Components/ReceiptVoucher/Receipt";
import ReceiptReport from "./Components/Report/receiptreport";


function Layout() {
  const location = useLocation();


  const showNavbar = location.pathname !== "/";
  const isPrintPage = location.pathname.startsWith("/");

  return (
    <>
      {showNavbar && (
        <div className={isPrintPage ? "navbar print-hide" : "navbar"}>
          <Nav />
        </div>
      )}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/process" element={<Process />} /> 
        <Route path="/customer" element={<Customer />} />
        <Route path="/billing" element={<Billing />} />
        <Route path="/receiptvoucher" element={<Receipt />}></Route>
        <Route path="/report" element={<Report />} />
        <Route path="/dailyreport" element={<Dailyreport />} />
        <Route path="/customerreport" element={<Customerreport />} />
        <Route path="/stockReport" element={<StockReport />} />
        <Route path="/master" element={<Master />} />
        <Route path="/item" element={<Item />} />
        <Route path="/billing/:id" element={<UpdateBill />} />
        <Route path="/salesreport" element={<SalesReport />} />
        <Route path="/receiptreport" element={<ReceiptReport />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <Layout />
    </Router>
  );
}

export default App;