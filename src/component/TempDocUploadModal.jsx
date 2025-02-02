import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  MenuItem,
  Typography,
  Grid,
  CircularProgress,
  IconButton,
  InputAdornment,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import ClearIcon from "@mui/icons-material/Clear";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import axios from "axios";
import { BASE_URL } from "../baseURL";

const availableOptions = ["Residential Address", "Electricity Bill", "Gas Connection"];
const MySwal = withReactContent(Swal);

const DocumentUploadModal = ({ prefillData }) => {
  const [formValues, setFormValues] = useState({
    salarySlip: prefillData?.salarySlip || null,
    aadhaarFront: prefillData?.aadhaarFront || null,
    aadhaarBack: prefillData?.aadhaarBack || null,
    panCard: prefillData?.panCard || null,
    otherDocuments: prefillData?.otherDocuments || [{ type: "", files: null }],
  });

  const [isFetching, setIsFetching] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [uploaded, setUploaded] = useState(false);

  useEffect(() => {
    if (prefillData) {
      setUploaded(true);
    } else {
      getDocumentList(); // Get documents if not prefilled
    }
  }, [prefillData]);

  const getAvailableOptions = (index) => {
    const uploadedDocuments = formValues.otherDocuments.map((doc, idx) =>
      idx === index ? "" : doc.type
    );
    return availableOptions.filter((option) => !uploadedDocuments.includes(option));
  };

  const handleFileChange = (field, file, index = 0) => {
    const updatedFormValues = { ...formValues };
    if (field === "otherDocuments") {
      updatedFormValues.otherDocuments[index].files = file;
    } else {
      updatedFormValues[field] = file;
    }
    setFormValues(updatedFormValues);
  };

  const handleDropdownChange = (event, index) => {
    const selectedType = event.target.value;
    const updatedFormValues = { ...formValues };
    updatedFormValues.otherDocuments[index].type = selectedType;
    setFormValues(updatedFormValues);
  };

  const deleteUploadedFile = (field, index = 0) => {
    const updatedFormValues = { ...formValues };
    if (field === "otherDocuments") {
      updatedFormValues.otherDocuments[index].files = null;
    } else {
      updatedFormValues[field] = null;
    }
    setFormValues(updatedFormValues);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formValues.salarySlip) newErrors.salarySlip = "Required";
    if (!formValues.aadhaarFront) newErrors.aadhaarFront = "Required";
    if (!formValues.aadhaarBack) newErrors.aadhaarBack = "Required";
    if (!formValues.panCard) newErrors.panCard = "Required";

    formValues.otherDocuments.forEach((doc, index) => {
      if (!doc.type) newErrors[`otherType-${index}`] = "Required";
      if (!doc.files) newErrors[`otherFiles-${index}`] = "Required";
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getDocumentList = async () => {
    setIsFetching(true);
  
    try {
      const response = await axios.get(
        `${BASE_URL}/api/loanApplication/getDocumentList`,
        {
          withCredentials: true,
        }
      );

      if (response.status !== 200) {
        throw new Error("Failed to fetch document list.");
      }
  
      const { success, data } = response.data;
      if (success && data?.documents) {
        // Assuming 'documents' contains the list of uploaded documents
        setFormValues({
          salarySlip: data?.documents.find(doc => doc.type === 'salarySlip')?.url || "",
          aadhaarFront: data?.documents.find(doc => doc.type === 'aadhaarFront')?.url || "",
          aadhaarBack: data?.documents.find(doc => doc.type === 'aadhaarBack')?.url || "",
          panCard: data?.documents.find(doc => doc.type === 'panCard')?.url || "",
          otherDocuments: data?.documents.filter(doc => doc.type === 'otherDocuments') || [],
        });
        setUploaded(true);
      } else {
        setUploaded(false);
      }
    } catch (error) {
      console.error("Error:", error);
      setUploaded(false);
    } finally {
      setIsFetching(false);
    }
  };
  // const handleSubmit = async () => {
  //   if (!validateForm()) return;

  //   // Prepare form-data
  //   const formData = new FormData();
  //   formData.append("salarySlip", formValues.salarySlip);
  //   formData.append("aadhaarFront", formValues.aadhaarFront);
  //   formData.append("aadhaarBack", formValues.aadhaarBack);
  //   formData.append("panCard", formValues.panCard);
  //   if (formValues.otherType) {
  //     formData.append("type", formValues.otherType);
  //     formData.append("others", formValues.otherDocument);
  //   }

  //   setLoading(true);

  //   try {
  //     // Making the API call to upload documents
  //     const response = await axios.patch(
  //       `${BASE_URL}/api/loanApplication/uploadDocuments`,
  //       formData,
  //       {
  //         headers: {
  //           "Content-Type": "multipart/form-data",
  //           // Authorization: `Bearer ${token}`, // Uncomment if token is needed
  //         },
  //         withCredentials: true, // Ensures that cookies are included with the request
  //       }
  //     );
  
  //     if (response.data.success) {
  //       // If successful, show success alert
  //       setUploaded(true);
  //       MySwal.fire({
  //         icon: "success",
  //         title: "Documents uploaded successfully",
  //       });
  
  //       // Call getDocumentList after successful upload to fetch and display documents
  //       getDocumentList();
  //     } else {
  //       // If not successful, show error alert
  //       MySwal.fire({
  //         icon: "error",
  //         title: "Failed to upload documents",
  //         text: response.data.message || "Something went wrong",
  //       });
  //     }
  //   } catch (error) {
  //     console.error("Error uploading documents:", error);
  //     MySwal.fire({
  //       icon: "error",
  //       title: "Failed to upload documents",
  //       text: error.response?.data?.message || "Something went wrong",
  //     });
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const formData = new FormData();
    formData.append("salarySlip", formValues.salarySlip);
    formData.append("aadhaarFront", formValues.aadhaarFront);
    formData.append("aadhaarBack", formValues.aadhaarBack);
    formData.append("panCard", formValues.panCard);
    if (formValues.otherType) {
      formData.append("type", formValues.otherType);
      formData.append("others", formValues.otherDocuments);
    }

    // Prepare form-data
    // const formData = new FormData();
    // formData.append("salarySlip", formValues.salarySlip);
    // formData.append("aadhaarFront", formValues.aadhaarFront);
    // formData.append("aadhaarBack", formValues.aadhaarBack);
    // formData.append("panCard", formValues.panCard);
    // if (formValues.otherDocuments.length > 0) {
    //   formValues.otherDocuments.forEach(doc => {
    //     if (doc.type && doc.files) {
    //       formData.append("otherDocuments[]", doc.files);
    //       formData.append("otherDocumentType[]", doc.type);
    //     }
    //   });
    // }
    console.log("JJJJJ",formData)

    setLoading(true);

    try {
      // Making the API call to upload documents
      const response = await axios.patch(
        `${BASE_URL}/api/loanApplication/uploadDocuments`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            // Authorization: `Bearer ${token}`, // Uncomment if token is needed
          },
          withCredentials: true, // Ensures that cookies are included with the request
        }
      );
  
      console.log("fdfvedfdv>>>>",response);
      
      if (response.status===200) {
        // If successful, show success alert
        setUploaded(true);
        MySwal.fire({
          icon: "success",
          title: "Documents uploaded successfully",
        });
  
    
        getDocumentList();
      } else {
        MySwal.fire({
          icon: "error",
          title: "Failed to upload documents",
          text: response.data.message || "Something went wrong",
        });
      }
    } catch (error) {
      console.error("Error uploading documents:", error);
      MySwal.fire({
        icon: "error",
        title: "Failed to upload documents",
        text: error.response?.data?.message || "Something went wrong",
      });
    } finally {
      setLoading(false);
    }
  };

  const addMoreDocumentFields = () => {
    setFormValues({
      ...formValues,
      otherDocuments: [...formValues.otherDocuments, { type: "", files: null }],
    });
  };

  const isSubmitDisabled = () => {
    const requiredFields = [
      formValues.salarySlip,
      formValues.aadhaarFront,
      formValues.aadhaarBack,
      formValues.panCard,
    ];
    const otherDocsComplete = formValues.otherDocuments.every(
      (doc) => doc.type && doc.files
    );

    return requiredFields.some((field) => !field) || !otherDocsComplete;
  };

  return (
    <Box
      sx={{
        padding: 4,
        border: "2px solid #ddd",
        borderRadius: 3,
        maxWidth: 900,
        margin: "0 auto",
        boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)",
        background: "white",
      }}
    >
      <Typography variant="h5" mb={2} sx={{ color: "black" }}>
        Upload Documents
      </Typography>
      <Grid container spacing={2}>
        {["salarySlip", "aadhaarFront", "aadhaarBack", "panCard"].map((field, index) => (
          <Grid item xs={12} sm={6} key={index}>
            <TextField
              fullWidth
              type="file"
              inputProps={{ accept: ".pdf,image/*" }}
              label={`Upload ${field.replace(/([A-Z])/g, " $1")}`}
              error={!!errors[field]}
              helperText={errors[field]}
              InputLabelProps={{ shrink: true }}
              InputProps={{
                endAdornment: formValues[field] && (
                  <InputAdornment position="end">
                    <IconButton onClick={() => deleteUploadedFile(field)}>
                      <ClearIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              onChange={(e) => handleFileChange(field, e.target.files[0])}
            />
          </Grid>
        ))}

        {formValues.otherDocuments.map((doc, index) => (
          <React.Fragment key={index}>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Select Document Type"
                value={doc.type}
                onChange={(e) => handleDropdownChange(e, index)}
                error={!!errors[`otherType-${index}`]}
                helperText={errors[`otherType-${index}`]}
              >
                {getAvailableOptions(index).map((option, idx) => (
                  <MenuItem key={idx} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="file"
                label="Upload Document"
                error={!!errors[`otherFiles-${index}`]}
                helperText={errors[`otherFiles-${index}`]}
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  endAdornment: doc.files && (
                    <InputAdornment position="end">
                      <IconButton onClick={() => deleteUploadedFile("otherDocuments", index)}>
                        <ClearIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                onChange={(e) => handleFileChange("otherDocuments", e.target.files[0], index)}
              />
            </Grid>
          </React.Fragment>
        ))}
        <Grid item xs={12}>
          <Button
            variant="outlined"
            onClick={addMoreDocumentFields}
            disabled={formValues.otherDocuments.length >= availableOptions.length}
          >
            Add More Documents
          </Button>
        </Grid>
        <Grid item xs={12}>
          <Box mt={3} textAlign="center">
            <Button
              variant="outlined"
              onClick={() => MySwal.close()}
              sx={{ mr: 2, color: "black", borderColor: "black" }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={isSubmitDisabled()}
              sx={{ color: "white", backgroundColor: "#28a745" }}
            >
              {loading ? <CircularProgress size={24} /> : "Upload"}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DocumentUploadModal;
