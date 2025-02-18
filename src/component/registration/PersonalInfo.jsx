import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Modal,
  TextField,
  Typography,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  CircularProgress,
  IconButton,
} from "@mui/material";
import { Person, CheckCircle } from "@mui/icons-material";
import axios from "axios";
import Swal from "sweetalert2";
import { BASE_URL } from "../../baseURL";

const PersonalInfo = ({ onComplete, disabled, prefillData, isVerified }) => {
  const [openModal, setOpenModal] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [formValues, setFormValues] = useState({
    fullName: "",
    mothersName: "",
    gender: "",
    personalEmail: "",
    maritalStatus: "",
    spouseName: "",
    dob: "",
  });
  const [error, setError] = useState("");
  const [isPersonalInfoUpdated, setIsPersonalInfoUpdated] = useState(false);

  useEffect(() => {
    if (prefillData) {
      setIsPersonalInfoUpdated(true);
    }
  }, [prefillData]);

  const handleCompleteStep = async () => {
    try {
      setIsFetching(true);
      const response = await axios.get(`${BASE_URL}/getProfileDetails`, {
        withCredentials: true,
      });

      if (response.status === 200 && response.data.success) {
        const data = response.data.data.personalDetails;
        setFormValues({
          fullName: data.fullName || "",
          mothersName: data.mothersName || "",
          gender: data.gender || "",
          personalEmail: data.personalEmail || "",
          maritalStatus: data.maritalStatus || "",
          spouseName: data.spouseName || "",
          dob: data.dob || "",
        });
        setOpenModal(true);
      } else {
        Swal.fire("Error", "Unable to fetch profile details.", "error");
      }
    } catch (error) {
      console.error("Error fetching details:", error);
      Swal.fire("Error", "An error occurred while fetching details.", "error");
    } finally {
      setIsFetching(false);
    }
  };

  const handleFormChange = (field, value) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
    setError("");
  };

  const handleSubmit = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formValues.personalEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    const updatedDetails = {
      fullName: formValues.fullName,
      mothersName: formValues.mothersName,
      gender: formValues.gender,
      dob: formValues.dob,
      personalEmail: formValues.personalEmail,
      maritalStatus: formValues.maritalStatus,
      spouseName:
        formValues.maritalStatus === "MARRIED" ? formValues.spouseName : null,
    };

    try {
      setIsFetching(true);
      const response = await axios.patch(
        `${BASE_URL}/personalInfo`,
        updatedDetails,
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      if (response.status === 200) {
        Swal.fire("Success", "Details updated successfully!", "success");
        setOpenModal(false);
        onComplete({ personalDetails: updatedDetails });
      } else {
        Swal.fire("Error", "Failed to update details.", "error");
      }
    } catch (error) {
      console.error("Error updating details:", error);
      Swal.fire("Error", "An error occurred while updating details.", "error");
    } finally {
      setIsFetching(false);
    }
  };

  return (
    <>
      <Box
        onClick={!disabled && handleCompleteStep}
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: 2,
          borderColor: disabled ? "#1c1c1c" : "#F26722",
          borderRadius: 3,
          margin: 1,
          width: "25%",
          minWidth: 200,
          cursor: disabled ? "not-allowed" : "pointer",
          textAlign: "left",
          background: disabled ? "#D9D9D9" : "#F26722",
          color:
            //  completed ||
            !disabled ? "white" : "#1c1c1c",

          "@media (max-width: 600px)": {
            width: "80%",
            margin: "auto",
          },
        }}
      >
        <IconButton
          sx={{
            color:
              // completed ? "white" :
              disabled ? "grey" : "green",
            ml: 1,
          }}
        >
          {isPersonalInfoUpdated || isVerified ? <CheckCircle /> : <Person />}
        </IconButton>
        <Box sx={{ ml: 2, flexGrow: 1 }}>
          <Typography sx={{ fontWeight: "bold" }}>
            Personal Information
          </Typography>
          <Typography variant="body2">
            Please update your personal details.
          </Typography>
        </Box>
      </Box>

      <Modal open={openModal} onClose={() => setOpenModal(false)}>
        <Box
          sx={{
            backgroundColor: "white",
            borderRadius: 4,
            boxShadow: 24,
            padding: 3,
            maxWidth: 400,
            margin: "auto",
            marginTop: "5%",
            maxHeight: "80vh", // set a maximum height for the modal
            overflowY: "auto", // enable vertical scrolling when content overflows
          }}
        >
          <Typography sx={{ marginBottom: 2 }}>Share Your Details</Typography>

          <TextField
            label="Full Name"
            value={formValues.fullName}
            fullWidth
            disabled
            sx={{ marginBottom: 2 }}
          />
          <TextField
            label="Email"
            value={formValues.personalEmail}
            onChange={(e) => handleFormChange("personalEmail", e.target.value)}
            fullWidth
            sx={{ marginBottom: 2 }}
            error={!!error}
            helperText={error}
          />
          <TextField
            label="Mother's Name"
            value={formValues.mothersName}
            onChange={(e) => handleFormChange("mothersName", e.target.value)}
            fullWidth
            sx={{ marginBottom: 2 }}
            error={!!error}
            helperText={error}
          />
          <TextField
            label="Date of Birth"
            value={formValues.dob}
            fullWidth
            disabled
            sx={{ marginBottom: 2 }}
          />
          <FormControl fullWidth sx={{ marginBottom: 2 }}>
            <InputLabel>Gender</InputLabel>
            <Select
              value={formValues.gender}
              onChange={(e) => handleFormChange("gender", e.target.value)}
              label="Gender"
            >
              <MenuItem value="M">Male</MenuItem>
              <MenuItem value="F">Female</MenuItem>
              <MenuItem value="O">Other</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth sx={{ marginBottom: 2 }}>
            <InputLabel>Marital Status</InputLabel>
            <Select
              value={formValues.maritalStatus}
              onChange={(e) =>
                handleFormChange("maritalStatus", e.target.value)
              }
              label="Marital Status"
            >
              <MenuItem value="SINGLE">Single</MenuItem>
              <MenuItem value="MARRIED">Married</MenuItem>
              <MenuItem value="DIVORCED">Divorced</MenuItem>
            </Select>
          </FormControl>

          {formValues.maritalStatus === "MARRIED" && (
            <TextField
              label="Spouse Name"
              value={formValues.spouseName}
              onChange={(e) => handleFormChange("spouseName", e.target.value)}
              fullWidth
              sx={{ marginBottom: 2 }}
            />
          )}

          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => setOpenModal(false)}
              sx={{ color: "#1c1c1c", borderColor: "#1c1c1c" }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={isFetching}
              sx={{ backgroundColor: "#F26722", color: "white" }}
            >
              {isFetching ? <CircularProgress size={24} /> : "Submit"}
            </Button>
          </Box>
        </Box>
      </Modal>
    </>
  );
};

export default PersonalInfo;
