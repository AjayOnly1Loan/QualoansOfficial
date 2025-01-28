import React, { useEffect, useState } from "react";
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
import ClearIcon from "@mui/icons-material/Clear";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import VisibilityIcon from "@mui/icons-material/Visibility";

import axios from "axios";
import { BASE_URL } from "../baseURL";

const availableOptions = [
  "Residential Address",
  "Electricity Bill",
  "Gas Connection",
];

const MySwal = withReactContent(Swal);

const DocumentUploadModal = ({ prefillData }) => {
  const [formValues, setFormValues] = useState({
    salarySlip: [null, null, null],
    aadhaarFront: prefillData?.aadhaarFront || null,
    aadhaarBack: prefillData?.aadhaarBack || null,
    panCard: prefillData?.panCard || null,
    otherDocuments: prefillData?.otherDocuments || [{ type: "", files: null }],
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [isDocUploaded, setIsDocUploaded] = useState(false);
  const [firstOccurrences, setFirstOccurrences] = useState([]);

  useEffect(() => {
    const getPreviousData = async () => {
      const getDashboardDetailsResponse = await axios.get(
        `${BASE_URL}/api/user/getDashboardDetails`,
        { withCredentials: true }
      );
      console.log(
        "doccccc srssss ress <>>>> ",
        getDashboardDetailsResponse.data
      );

      if (getDashboardDetailsResponse.data.success) {
        const { isDocumentUploaded } = getDashboardDetailsResponse.data;
        setIsDocUploaded(isDocumentUploaded);
      }
    };
    getPreviousData();
  }, []);

  // Handle logic after isDocUploaded changes
  useEffect(() => {
    if (isDocUploaded) {
      const fetchDocumentList = async () => {
        const documentListResponse = await axios.get(
          `${BASE_URL}/api/loanApplication/getDocumentList`,
          { withCredentials: true }
        );
        console.log(
          "documentListResponse zsdss",
          documentListResponse.data.documents
        );
        const data = documentListResponse.data.documents;
        const result = {};
        const requiredNames = ["salarySlip_1", "salarySlip_2", "salarySlip_3"];

        for (const item of data) {
          if (requiredNames.includes(item.name) && !result[item.name]) {
            result[item.name] = item;
          }
        }

        const firstOccurrencesArray = Object.values(result);
        setFirstOccurrences(firstOccurrencesArray);

        setFormValues((prev) => ({
          ...prev,
          salarySlip: firstOccurrencesArray.map((doc) => doc || null),
          aadhaarFront: data.find((doc) => doc.type === "aadhaarFront"),
          aadhaarBack: data.find((doc) => doc.type === "aadhaarBack"),
          panCard: data.find((doc) => doc.type === "panCard"),
        }));
      };
      fetchDocumentList();
    }
  }, [isDocUploaded]);

  // console.log("formValues >>> ", formValues);

  const getAvailableOptions = (index) => {
    const uploadedDocuments = formValues.otherDocuments.map((doc, idx) =>
      idx === index ? "" : doc.type
    );
    return availableOptions.filter(
      (option) => !uploadedDocuments.includes(option)
    );
  };

  const handleFileChange = (field, file, index = 0) => {
    const updatedFormValues = { ...formValues };
    const filePreview = file ? URL.createObjectURL(file) : null;

    if (field === "salarySlip") {
      console.log("handleFileChange slip field >>> ", field);
      console.log("handleFileChange slip index >>> ", index);
      console.log("handleFileChange slip file >>> ", file);
      updatedFormValues.salarySlip[index] = file;
      console.log("formValues.salarySlip[index] >>> ", formValues.salarySlip);
    } else if (field === "otherDocuments") {
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
    if (field === "salarySlip") {
      console.log("slip index >>> ", index);
      console.log("slip field >>> ", field);
      updatedFormValues.salarySlip[index] = null;
    } else if (field === "otherDocuments") {
      updatedFormValues.otherDocuments[index].files = null;
    } else {
      updatedFormValues[field] = null;
    }
    setFormValues(updatedFormValues);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formValues.salarySlip.every((file) => file)) {
      newErrors.salarySlip = "All three salary slips are required.";
    }
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

  const handleSubmit = async () => {
    if (!validateForm()) return;

    // Prepare form-data
    const formData = new FormData();

    if (formValues.selectedOption && formValues.selectedFile) {
      const selectedKey = optionKeyMap[formValues.selectedOption];
      if (selectedKey) {
        formData.append(selectedKey, formValues.selectedFile);
      }
    }

    formValues.salarySlip.forEach((file, index) => {
      formData.append(`salarySlip`, file);
    });
    formData.append("salarySlip", formValues.salarySlip);
    formData.append("aadhaarFront", formValues.aadhaarFront);
    formData.append("aadhaarBack", formValues.aadhaarBack);
    formData.append("panCard", formValues.panCard);
    if (formValues.otherType) {
      formData.append("type", formValues.otherType);
      formData.append("others", formValues.otherDocument);
    }

    setLoading(true);

    try {
      // Fetch the API using axios
      const response = await axios.patch(
        `${BASE_URL}/api/loanApplication/uploadDocuments`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );
      console.log("response ><<>> ", response);
      MySwal.fire({
        icon: "success",
        title: "Documents uploaded successfully",
      });
    } catch (error) {
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
      // formValues.salarySlip,
      formValues.aadhaarFront,
      formValues.aadhaarBack,
      formValues.panCard,
    ];
    const otherDocsComplete = formValues.otherDocuments.every(
      (doc) => doc.type && doc.files
    );

    return requiredFields.some((field) => !field) || !otherDocsComplete;
  };

  const handlePreview = async (docId, docType) => {
    // const docType = "salarySlip";
    const apiUrl = `http://localhost:8081/api/loanApplication/documentPreview?docType=${docType}&docId=${docId}`;
    try {
      const response = await axios.get(apiUrl, { withCredentials: true });
      console.log("Preview data:", response.data);
      if (response.data && response.data.url) {
        // Redirect to the URL
        // window.location.href = response.data.url;
        window.open(response.data.url, "_blank");
      } else {
        throw new Error("URL not found in the response");
      }
    } catch (error) {
      console.error("Error fetching document preview:", error);
      MySwal.fire({
        icon: "error",
        title: "Failed to load document preview",
        text: error.response?.data?.message || "Something went wrong",
      });
    }
  };

  const handleDelete = (field) => {
    const updatedFormValues = { ...formValues };
    updatedFormValues[field] = null;
    setFormValues(updatedFormValues);
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
        {console.log("firstOccurrences <<>>> ", firstOccurrences)}
        {[0, 1, 2].map((index) => (
          <Grid item xs={12} sm={4} key={`salarySlip-${index}`}>
            {console.log("firstOccurrences <<<<>>>>>c ", firstOccurrences)}
            {formValues.salarySlip[index] ? (
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
              >
                <Typography
                  sx={{
                    textDecoration: "underline",
                    cursor: "pointer",
                    fontSize: "0.9rem",
                    color: "blue",
                  }}
                  onClick={() =>
                    firstOccurrences[index]
                      ? handlePreview(
                          firstOccurrences[index].id,
                          firstOccurrences[index].type
                        )
                      : null
                  }
                >
                  View Uploaded File
                </Typography>
                <IconButton
                  onClick={() => deleteUploadedFile("salarySlip", index)}
                >
                  <ClearIcon sx={{ color: "red" }} />
                </IconButton>
              </Box>
            ) : (
              <TextField
                fullWidth
                type="file"
                inputProps={{ accept: ".pdf,image/*" }}
                label={`Upload Salary Slip ${index + 1}`}
                error={!!errors.salarySlip && !formValues.salarySlip[index]}
                helperText={
                  errors.salarySlip && !formValues.salarySlip[index]
                    ? "Required"
                    : ""
                }
                InputLabelProps={{ shrink: true }}
                onChange={(e) =>
                  handleFileChange("salarySlip", e.target.files[0], index)
                }
              />
            )}
          </Grid>
        ))}
        {/* {["aadhaarFront", "aadhaarBack", "panCard"].map((field, index) => (
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
        ))} */}

        {["aadhaarFront", "aadhaarBack", "panCard"].map((field) => {
          const document = formValues[field];
          console.log("document >>> ", document);
          return (
            <Box
              key={field}
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              mb={2}
            >
              {document ? (
                <>
                  <Typography
                    onClick={() => handlePreview(document.id, document.type)}
                    style={{ cursor: "pointer", textDecoration: "underline" }}
                  >
                    {document.name}
                  </Typography>
                  <Box>
                    <IconButton
                      onClick={() => handlePreview(document.id, document.type)}
                    >
                      <VisibilityIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(field)}>
                      <ClearIcon />
                    </IconButton>
                  </Box>
                </>
              ) : (
                <TextField
                  fullWidth
                  type="file"
                  inputProps={{ accept: ".pdf,image/*" }}
                  label={`Upload ${field.replace(/([A-Z])/g, " $1")}`}
                  InputLabelProps={{ shrink: true }}
                  onChange={(e) =>
                    handleFileChange("salarySlip", e.target.files[0], index)
                  }
                />
              )}
            </Box>
          );
        })}
        {/* {formValues.otherDocuments.map((doc, index) => (
          <React.Fragment key={index}>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Select Document Type"
                value={doc.type || ""}
                onChange={(e) => handleDropdownChange(e, index)}
                error={!!errors[`otherType-${index}`]}
                helperText={errors[`otherType-${index}`]}
              >
                {[
                  "Residential Address",
                  "Electricity Bill",
                  "Gas Connection",
                ].map((option, idx) => (
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
                      <IconButton
                        onClick={() =>
                          deleteUploadedFile("otherDocuments", index)
                        }
                      >
                        <ClearIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                onChange={(e) =>
                  handleFileChange("otherDocuments", e.target.files[0], index)
                }
              />
            </Grid>
          </React.Fragment>
        ))} */}

        {/* old */}
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
                      <IconButton
                        onClick={() =>
                          deleteUploadedFile("otherDocuments", index)
                        }
                      >
                        <ClearIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                onChange={(e) =>
                  handleFileChange("otherDocuments", e.target.files[0], index)
                }
              />
            </Grid>
          </React.Fragment>
        ))}
        <Grid item xs={12}>
          <Button
            variant="outlined"
            onClick={addMoreDocumentFields}
            disabled={
              formValues.otherDocuments.length >= availableOptions.length
            }
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
              disabled={isSubmitDisabled() || loading}
              sx={{ backgroundColor: "orange", color: "white" }}
              startIcon={loading && <CircularProgress size={20} />}
            >
              {loading ? "Submitting..." : "Submit"}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DocumentUploadModal;
