import React, { useState } from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Grid
} from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import InfoIcon from "@mui/icons-material/Info";
import HomeIcon from "@mui/icons-material/Home";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import DescriptionIcon from "@mui/icons-material/Description";
import WorkIcon from "@mui/icons-material/Work";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance"; // Updated icon
import Dashboard from "./Dashboard";
import UserProfile from "./UserProfile";
import BasicInformation from "./BasicInformation";
import RecidencialAddress from "./RecidencialAddress";
import IncomeInformation from "./IncomeInformation";
import LoanDetails from "./LoanDetails";
import EmploymentInformation from './EmploymentInformation'
import DisbursalBankDetails from "./DisbursalBankDetails";
import DocumentUploadDetails from "./DocumentUploadDetails";
const items = [
  { label: "User Profile", value: "user-profile", icon: <AccountCircleIcon /> },
  { label: "Basic Information", value: "basic-information", icon: <InfoIcon /> },
  { label: "Residential Address", value: "residential-address", icon: <HomeIcon /> },
  { label: "Income Details", value: "income-details", icon: <AttachMoneyIcon /> },
  { label: "Loan Details", value: "loan-details", icon: <DescriptionIcon /> },
  { label: "Employment Information", value: "employment-information", icon: <WorkIcon /> },
  { label: "Disbursal Bank Details", value: "disbursal-bank-details", icon: <AccountBalanceIcon /> },
  { label: "Documents", value: "documents", icon: <DescriptionIcon /> },
];

export default function UserPreview() {
  const [activeComponent, setActiveComponent] = useState("");

  const renderComponent = () => {
    switch (activeComponent) {
      case "user-profile":
        return <UserProfile />;
      case "basic-information":
        return <BasicInformation/>;
      case "residential-address":
        return <RecidencialAddress/>;
      case "income-details":
        return <IncomeInformation/>;
      case "loan-details":
        return <LoanDetails/>;
      case "employment-information":
        return <EmploymentInformation/>;
      case "disbursal-bank-details":
        return <DisbursalBankDetails/>;
      case "documents":
        return <DocumentUploadDetails/>;
    //   default:
    //     return <div>Select an option to view details</div>;
    }
  };

  return (
    <>
      <Dashboard />

      <div
        style={{
          padding: "20px",
          backgroundColor: "#f4f6f9",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "row", // Align items in a row
        }}
      >
        {/* Left Side: User Preview */}
        <Box
          sx={{
            flex: 1,
            maxWidth: 320,
            margin: "20px",
            padding: 2,
            ml:30,
            backgroundColor: "#4D4D4E",
            borderRadius: 3,
            boxShadow: 3,
          }}
        >
          <Typography variant="h4" gutterBottom align="center" sx={{ color: "#f5f5f5", mb: 2 }}>
            User Preview
          </Typography>
          <List>
            {items.map((item, index) => (
              <ListItem
                key={index}
                disablePadding
                sx={{
                  "&:hover": { backgroundColor: "#5c5c5e" },
                }}
              >
                <ListItemButton
                  onClick={() => setActiveComponent(item.value)} // Set active component
                  sx={{
                    textDecoration: "none",
                    color: activeComponent === item.value ? "#FFA500" : "#f5f5f5",
                    backgroundColor: activeComponent === item.value ? "#5c5c5e" : "transparent",
                    "&:hover": {
                      color: "#ffffff",
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: activeComponent === item.value ? "#FFA500" : "#f5f5f5",
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.label} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>

        {/* Right Side: Active Component */}
        <Box
          sx={{
            flex: 1, // Take up more space
            marginTop: 3,
          }}
        >
          {renderComponent()} {/* This will render the selected component */}
        </Box>
      </div>

    </>
  );
}