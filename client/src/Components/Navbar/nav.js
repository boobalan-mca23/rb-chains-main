
import React from "react";
import { AppBar, Toolbar, Button, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import logo from "../../Assets/rb logo.jpg";
import { useState,useEffect } from "react";

// import image from "../../Assets/bg.jpg";

function Nav() {
  const navigate = useNavigate();
  const navbarHeight = "70px"; 
  
  // const [fromDate, setFromDate] = useState("");
  // const [toDate, setToDate] = useState("");
  // useEffect(() => {
  //   // Get current date in UTC
  //   const today = new Date();

  //   // Convert to Indian Standard Time (IST)
  //   const offset = 5.5 * 60; // IST is UTC +5:30
  //   const indiaTime = new Date(today.getTime() + offset * 60000); // Adjust the time by the offset

  //   // Extract date parts (year, month, day)
  //   const year = indiaTime.getFullYear();
  //   const month = String(indiaTime.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
  //   const day = String(indiaTime.getDate()).padStart(2, '0');

  //   // Format the date as YYYY-MM-DD
  //   const currentDate = `${year}-${month}-${day}`;

  //   console.log('currentDate in IST:', currentDate);

  //   setFromDate(currentDate);
  //   setToDate(currentDate);
  // }, []);

  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          backgroundImage:
            "linear-gradient(to right, #000000, #2C2C2C, #B8860B, #FFD700)",
          height: navbarHeight,
          zIndex: 1000,
        }}
      >
        <Toolbar>
          <Box sx={{ flexGrow: 1 }}>
            <img
              src={logo}
              alt="RB Chains Logo"
              style={{ height: "60px", width: "5rem" }}
            />
          </Box>

          <Box>
            <Button
              disableRipple
              onClick={() => navigate("/process")}
              sx={{ color: "black", fontSize: "1rem", fontWeight: "bold" ,"&:focus": { backgroundColor: "black" ,color:"white"},}}
            >
              Lot
            </Button>
            {/* <Button
              onClick={() => navigate("/customer")}
              sx={{ color: "black", fontSize: "1rem", fontWeight: "bold" }}
            >
              Customer
            </Button> */}
            <Button
              disableRipple
              onClick={() => navigate("/billing")}
              sx={{ color: "black", fontSize: "1rem", fontWeight: "bold","&:focus": { backgroundColor: "black" ,color:"white"} }}
            >
              Billing
            </Button>
            <Button
              disableRipple
              onClick={() => navigate("/receiptvoucher")}
              sx={{ color: "black", fontSize: "1rem", fontWeight: "bold","&:focus": { backgroundColor: "black" ,color:"white"}}}
            >
              Receipt Voucher
            </Button>
            <Button
              disableRipple
              onClick={() =>
                navigate(
                  `/report?type=customer`
                )
              }
              sx={{ color: "black", fontSize: "1rem", fontWeight: "bold","&:focus": { backgroundColor: "black" ,color:"white"} }}
            >
              Report
            </Button>
            <Button
              disableRipple
              onClick={() => navigate("/master")}
              sx={{ color: "black", fontSize: "1rem", fontWeight: "bold","&:focus": { backgroundColor: "black" ,color:"white"} }}
            >
              Master
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Box
        sx={{
          position: "absolute",
          top: navbarHeight,
          left: 0,
          width: "100%",
          height: "100%",
          // backgroundImage: `url(${image})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          zIndex: -1,
        }}
      ></Box>

      <Box
        sx={{ marginTop: navbarHeight, padding: "20px", position: "relative" }}
      ></Box>
    </>
  );
}

export default Nav;