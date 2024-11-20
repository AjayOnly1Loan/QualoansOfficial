import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import bannerImage from "../assets/image/banner qua.webp"; // Adjust the path as needed

const FrontPage = () => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        marginTop:'-10px',
        overflowX: "hidden",
        width: "100%",
        height: "auto",
        backgroundColor: "#f9f9f9",
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: theme.spacing(2),
        color: "white",
        textAlign: "center",
      }}
    >
      {/* Centered Content */}
      <Box
        sx={{
          marginBottom: theme.spacing(4), // Space below text and button
        }}
      >
        <Typography
          variant="h2"
          sx={{
            fontWeight: "bold",
            color: "black",
            marginBottom: theme.spacing(2), // Space below heading
            [theme.breakpoints.down("sm")]: {
              fontSize: "1.5rem",
            },
            [theme.breakpoints.up("md")]: {
              fontSize: "2.5rem",
            },
          }}
        >
          Instant loans, endless <br /> possibilities—approved in just 5 minutes!
        </Typography>

        {/* Button */}
        <Button
          variant="contained"
          href="/apply-now"
          sx={{
            borderRadius:'80px',
            backgroundColor: "black",
            color: "white",
            fontWeight: "bold",
            fontSize: { xs: "14px", sm: "16px" },
            padding: { xs: "8px 16px", sm: "6px 30px" },
            animation: "blinking 1.5s infinite",
            "&:hover": {
              backgroundColor: "#FFAA00",
            },
            "@keyframes blinking": {
              "0%": { backgroundColor: "black", color: "white" },
              "50%": { backgroundColor: "#FFAA00", color: "black" },
              "100%": { backgroundColor: "black", color: "white" },
            },
          }}
        >
          Apply Now
        </Button>
      </Box>

      {/* Banner Image Section */}
            <Box
        sx={{
          marginTop: '-10px',
          paddingLeft: {md:0,md:'100px'},
          paddingRight: {md:0,md:'100px'},
          width: '100%',
          textAlign: 'center',
          mx:'90px',

          backgroundColor: 'rgba(255, 255, 255, 0)',
          borderRadius: '50px', // Parent border radius
          overflow: 'hidden', // Add this if needed
        }}
      >
      <Box
        component="img"
        src={bannerImage}
        alt="Banner"
        sx={{
          marginTop: '-10px',
          width: '100%',
          maxHeight: '320px',
          objectFit: 'cover',
          borderRadius: '80px', // Material-UI handles this directly
        }}
      />

      </Box>

    </Box>
  );
};

export default FrontPage;
