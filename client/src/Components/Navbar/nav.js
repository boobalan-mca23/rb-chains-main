
import React from "react";
import { AppBar, Toolbar, Button, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import logo from "../../Assets/rb logo.jpg";
import { useState } from "react";

// import image from "../../Assets/bg.jpg";

function Nav() {
  const navigate = useNavigate();
  const navbarHeight = "70px"; 
  const today = new Date().toISOString().split('T')[0];
  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);

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
              onClick={() => navigate("/process")}
              sx={{ color: "black", fontSize: "1rem", fontWeight: "bold" }}
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
              onClick={() => navigate("/billing")}
              sx={{ color: "black", fontSize: "1rem", fontWeight: "bold" }}
            >
              Billing
            </Button>
            <Button
              onClick={() => navigate("/receiptvoucher")}
              sx={{ color: "black", fontSize: "1rem", fontWeight: "bold" }}
            >
              Receipt Voucher
            </Button>
            <Button
              onClick={() =>
                navigate(
                  `/report?type=customer&fromDate=${fromDate}&toDate=${toDate}`
                )
              }
              sx={{ color: "black", fontSize: "1rem", fontWeight: "bold" }}
            >
              Report
            </Button>
            <Button
              onClick={() => navigate("/master")}
              sx={{ color: "black", fontSize: "1rem", fontWeight: "bold" }}
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