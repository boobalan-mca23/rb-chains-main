
import React from "react";
import { Box, Button, Card, CardContent, Typography } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { useNavigate } from "react-router-dom"; 
import bgImage from "../../Assets/rb bg.jpg";

const theme = createTheme({
  typography: {
    fontFamily: "'Playfair Display', serif",
  },
});

function Home() {
  const navigate = useNavigate(); 

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          display: "flex",
          height: "100vh",
        }}
      >
        <Box
          sx={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <img
            src={bgImage}
            alt="RB Chains Logo"
            style={{
              width: "100%",
              maxWidth: "800px",
              height: "45.5rem",
            }}
          />
        </Box>

        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(to right, #B8860B, #FFD700)",
          }}
        >
          <Card
            sx={{
              padding: 3,
              borderRadius: 2,
              textAlign: "center",
              width: "40%",
            }}
          >
            <CardContent sx={{ backgroundColor: "#1D1D3B", color: "white" }}>
              <Typography variant="h5" fontWeight="bold">
                Login to RB Chains
              </Typography>

              <Button
                variant="contained"
                sx={{
                  marginTop: 2,
                  width: "40%",
                  fontSize: "1.2rem",
                  backgroundColor: "#B8860B",
                  "&:hover": { backgroundColor: "#8B6508" },
                }}
                onClick={() => navigate("/process")}
              >
                Login
              </Button>
            </CardContent>
          </Card>

          <Typography
            variant="h4"
            fontWeight="bold"
            sx={{
              marginTop: 6,
              color: "black",
              fontStyle: "italic",
              transform: "skewX(-10deg)",
              textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
            }}
          >
            All types of chain Manufacturers
          </Typography>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default Home;
