// import React from "react";
// import {
//   BrowserRouter as Router,
//   Routes,
//   Route,
//   useLocation,
// } from "react-router-dom";
// import Home from "./Components/Home/home";
// import Nav from "./Components/Navbar/nav";
// import Customer from "./Components/Customer/customer";
// import Lot from "./Components/Lot/lot";
// import Billing from "./Components/Billing/billing";
// import Report from "./Components/Report/report";
// import Process from "./Components/Lot/process";
// import Dailyreport from "./Components/Report/dailyreport";
// import Customerreport from "./Components/Report/custreport";
// import Transaction from "./Components/Customer/Transaction";

// function Layout() {
//   const location = useLocation();

//   const showNavbar = location.pathname !== "/";

//   return (
//     <>
//       {showNavbar && <Nav />}
//       <Routes>
//         <Route path="/" element={<Home />} />
//         <Route path="/customer" element={<Customer />} />
//         <Route path="/lot" element={<Lot />} />
//         <Route path="/billing" element={<Billing />} />
//         <Route path="/report" element={<Report />} />
//         <Route path="/dailyreport" element={<Dailyreport/>} />
//         <Route path="/customerreport" element={<Customerreport />} />
//         <Route path="/process/:id/:lotName" element={<Process />} />
//         <Route path="/transaction/:customerName" element={<Transaction />} />
//       </Routes>
//     </>
//   );
// }

// function App() {
//   return (
//     <Router>
//       <Layout />
//     </Router>
//   );
// }

// export default App;


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

function Layout() {
  const location = useLocation();

  // Show navbar on all pages except the Home page
  const showNavbar = location.pathname !== "/";

  return (
    <>
      {showNavbar && <Nav />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/process" element={<Process />} />
        <Route path="/customer" element={<Customer />} />
        <Route path="/billing" element={<Billing />} />
        <Route path="/report" element={<Report />} />
        <Route path="/dailyreport" element={<Dailyreport />} />
        <Route path="/customerreport" element={<Customerreport />} />
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
