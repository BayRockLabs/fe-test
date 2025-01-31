import * as React from "react";
import UploadContractFile from "./UploadContractFile";
import { isValidResponse } from "../../hooks/useAxiosPrivate";
import { displayError } from "../../utils/handleErrors";
import { useSnackbar } from "notistack";
import useLocales from "../../hooks/useLocales";
import PropTypes from "prop-types";
import { axiosExtractService } from "../../services/axios";
import UploadFileAPI from "../../services/UploadFileService";
import { useState } from "react";
import { anchorOrigin } from "../../utils/constants";
import { Backdrop, CircularProgress, Typography, Box } from "@mui/material";

UploadContractFile.propTypes = {
  docType: PropTypes.string, //PO or SOW
  onFileDataExtracted: PropTypes.func,
  onFileUploaded: PropTypes.func,
};

export default function UploadFileWithExtractData({
  docType = "PO",
  onFileDataExtracted,
  onFileUploaded,
  onFileDeleted,
  deleteCount,
  setFileUploaded,
  page,
  selectedFiles,
  setSelectedFiles,
}) {
  const [isLoading, setLoading] = useState(false);
  const [isProcessing, setProcessing] = useState(false);
  const { translate } = useLocales();
  const { enqueueSnackbar } = useSnackbar();

  const onFileUploading = (file) => {
    setFileUploaded(file);
    onUploadFileToExtract(file);
  };

  const onError = (message) => {
    enqueueSnackbar("File - " + message, {
      anchorOrigin,
      variant: "error",
    });
  };

  async function uploadFileToServer(formData) {
    return axiosExtractService.post(
      UploadFileAPI.EXTRACT_FILE_DATA(docType),
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          const percentage = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
        },
      }
    );
  }

  async function onUploadFileToExtract(file) {
    // Start loading and processing indicators
    setLoading(true);
    setProcessing(true);
    try {
      // Create FormData for the file upload
      const formData = new FormData();
      formData.append("file", file);

      // Upload file to the server
      const response = await uploadFileToServer(formData);

      // Validate response
      if (isValidResponse(response)) {
        // Check for errors in the response
        if (response.data.error) {
          onFileDataExtracted(response.data);
        }

        // Extract nested data from the response
        const nested_extracted_data = response?.data?.extracted_data;
        let extractedData =
          nested_extracted_data?.extracted_Data || nested_extracted_data;

        // Trigger callback with extracted data
        if (onFileDataExtracted && extractedData) {
          if (page === "PO") {
            onFileDataExtracted(response?.data);
          } else {
            onFileDataExtracted(extractedData);
          }
        }
      }
    } catch (error) {
      console.error("Error in onUploadFileToExtract:", error);

      if (error.response) {
        onError(
          `Server error: ${error.response.status} - ${
            error.response.data.message || "Unknown error"
          }`
        );
      } else if (error.request) {
        onError(
          "Network error: Unable to reach the server. Please check your internet connection."
        );
      } else {
        onError(`Unexpected error: ${error.message}`);
      }
      // Log the error for debugging and notify the user
      console.error("Error in onUploadFileToExtract:", error);
      onError(translate("error.upload") + ": " + error.message);
    } finally {
      // Stop loading and processing indicators
      setLoading(false);
      setProcessing(false);
    }
  }

  return (
    <>
      <UploadContractFile
        onFileUploaded={onFileUploaded}
        onFileUploading={onFileUploading}
        deleteCount={deleteCount}
        onFileDeleted={onFileDeleted}
        showLoading={isLoading}
        selectedFiles={selectedFiles}
        setSelectedFiles={setSelectedFiles}
      />

      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={isProcessing}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            transform: "translateX(20%)",
            textAlign: "center",
          }}
        >
          <CircularProgress color="inherit" />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Our system is working on understanding your document. Please wait
            while we process.
          </Typography>
        </Box>
      </Backdrop>
    </>
  );
}
