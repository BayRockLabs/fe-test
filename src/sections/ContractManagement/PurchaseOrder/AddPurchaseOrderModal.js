import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  MenuItem,
  TableCell,
  TableHead,
  TableRow,
  Table,
  TableBody,
  IconButton,
  LinearProgress,
  Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import useLocales from "../../../hooks/useLocales";
import { createStyles, useTheme } from "@mui/styles";
import PurchaseOrderAPI from "../../../services/PurchaseOrderService";
import useClient from "../../../hooks/useClient";
import useAxiosPrivate, {
  isValidResponse,
} from "../../../hooks/useAxiosPrivate";
import ContractAPI from "../../../services/ContractService";
import { useSnackbar } from "notistack";
import { displayError } from "../../../utils/handleErrors";
import { fDateTimeMill } from "../../../utils/formatTime";
import UploadFileWithExtractData from "../UploadFileWithExtractData";
import { fCurrency, fPercent } from "../../../utils/formatNumber";
import MandatoryTextField from "../../../pages/MandatoryTextField";
import { anchorOrigin } from "../../../utils/constants";
import PreviewContractFile from "../PreviewContractFile";
import POExistPopUp from "../../../components/POExistPopUp";
import ManualPOEntryPopup from "../../../components/ManualPOEntryPopup";
import { isBefore, parseISO } from "date-fns";

const useStyles = createStyles((theme) => ({
  header: {
    display: "flex",
    alignItems: "center",
    margin: "15px",
    fontSize: "24px",
    fontWeight: "700",
    color: theme.palette.common.black,
    height: "50px",
  },
  closeButton: {
    height: "50px",
    width: "30px",
    margin: "10px",
  },
  formContainer: {
    margin: "16px",
    display: "flex",
    gap: "30px",
    flexDirection: "row",
    direction: "revert",
    paddingBottom: "10px",
  },
  textField: {
    width: "100%",
    borderRadius: 1,
    backgroundColor: theme.palette.background.neutral,
  },

  button: {
    float: "right",
    margin: "30px",
    borderRadius: "4px",
    height: "40px",
    backgroundColor: theme.palette.background.primary,
  },
}));

function AddPurchaseOrderModal(props) {
  const { handleClose, onPurchaseOrderAdded, purchaseOrderData } = props;

  const isEditMode = purchaseOrderData ? true : false;

  const [deleteCount, setDeleteCount] = useState(0);

  const { translate } = useLocales();
  const [startDateValue, setStartDateValue] = useState(
    purchaseOrderData?.start_date || null
  );
  const [endDateValue, setEndDateValue] = useState(
    purchaseOrderData?.end_date || null
  );
  console.log("ends", endDateValue);

  const [hasFileToEdit, setHasFileToEdit] = useState(
    purchaseOrderData?.purchase_order_documents?.length > 0 ?? false
  );
  const [deletedFileUrls, setDeletedFileUrls] = useState([]);
  const [upLoadedFileUrls, setUpLoadedFileUrls] = useState(
    purchaseOrderData?.purchase_order_documents ?? []
  );
  const [showUploadMessage, setShowUploadMessage] = useState(true);
  const { selectedClient } = useClient();
  const axiosPrivate = useAxiosPrivate();
  const [contractDataList, setContractDataList] = useState([]);
  const [selectedContract, setSelectedContract] = useState(null);
  const [fileUploaded, setFileUploaded] = useState({});
  const [utilizedAmounts, setUtilizedAmounts] = useState(
    purchaseOrderData?.utilized_amounts || []
  );
  const [manualEntryPopupOpen, setManualEntryPopupOpen] = useState(false); // State to control manual entry popup
  const [manualEntryMode, setManualEntryMode] = useState(false); // New state

  const { enqueueSnackbar } = useSnackbar();

  const handleFilesDeleted = (deletedFilesData, filesData) => {
    setDeletedFileUrls(deletedFilesData);
    setUpLoadedFileUrls(filesData);
    setFormObject({
      ...formObject,
      docContractAmount: "",
      startDate: null,
      endDate: null,
    });
    onResetData();
  };
  const page = "PO";
  const theme = useTheme();
  const styles = useStyles(theme);

  const [formObject, setFormObject] = useState(getDefaultFormData());
  const [duplicatePO, setDuplicatePO] = useState(false);
  const [isPopUp, setIsPopUp] = useState(false);
  const [notPO, setNotPO] = useState(false);
  const purchaseOrderAmount = parseFloat(purchaseOrderData?.po_amount);
  const purchaseOrderId = purchaseOrderData?.id;
  const [endDateError, setEndDateError] = useState("");

  const handleStartDateChange = (newDate) => {
    setStartDateValue(newDate);
    // Clear end date error if the issue is resolved
    if (endDateValue && newDate && newDate > endDateValue) {
      setEndDateError("End Date cannot be earlier than Start Date.");
    } else {
      setEndDateError("");
    }
  };

  const handleEndDateChange = (newDate) => {
    if (newDate && startDateValue && newDate < startDateValue) {
      setEndDateError("End Date cannot be earlier than Start Date.");
    } else {
      setEndDateError(""); // Clear the error
      setEndDateValue(newDate);
    }
  };

  const getMinStartDate = () => startDateValue || null;
  const handleContractChange = (event) => {
    const newValue = event?.target?.value;
    setSelectedContract(newValue);
  };

  const handleCloseModal = () => {
    handleClose();
  };
  const [selectedFiles, setSelectedFiles] = useState([]);

  const onError = (message) => {
    enqueueSnackbar("Contract - " + message, {
      anchorOrigin,
      variant: "error",
    });
  };

  const onSucces = (message) => {
    enqueueSnackbar(message + " Succesfully", {
      anchorOrigin,
      variant: "success",
    });
  };

  useEffect(() => {
    if (isEditMode && purchaseOrderData?.purchase_order_documents) {
      setUpLoadedFileUrls(purchaseOrderData.purchase_order_documents);
    }
  }, [isEditMode, purchaseOrderData]);

  const onResetData = () => {
    setFormObject(getDefaultFormData());
    setStartDateValue(null);
    setEndDateValue(null);
    setSelectedContract(null);
  };
  const formatNumber = (amount) => {
    if (amount.includes(",")) {
      const stringWithoutCommas = amount.replace(/,/g, "");
      return parseInt(stringWithoutCommas, 10);
    } else {
      return Math.floor(parseFloat(amount));
    }
  };
  const onFileDataExtracted = (Filedata) => {
    setShowUploadMessage(false);
    onResetData();

    if (Filedata.document_type !== "PO") {
      setNotPO(true);
      setIsPopUp(true);
      return;
    }

    const data = Filedata?.extracted_data;

    const validateField = {
      purchase_order: (value) =>
        /^[A-Za-z0-9]+$/.test(value.trim()) && value.trim() !== "",
      order_date: (value) => /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(value),
      print_date: (value) => /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(value),
      amount: (value) => /^\d+$/.test(value) && parseInt(value, 10) > 0,
    };

    const isValidPurchaseOrder = validateField.purchase_order(
      data?.purchase_order
    );
    const isValidOrderDate = validateField.order_date(data?.order_date);
    const isValidPrintDate = validateField.print_date(data?.print_date);
    const isValidAmount = validateField.amount(data?.amount);

    let hasValidData = false;

    if (isValidPurchaseOrder) {
      const payload = { account_number: data.purchase_order };
      checkValidPO(payload);
      hasValidData = true;
    }

    if (isValidAmount && isValidPurchaseOrder) {
      setFormObject({
        ...formObject,
        accountNumber: data.purchase_order,
        poAmount: formatNumber(data.amount),
      });
      hasValidData = true;
    }

    if (isValidOrderDate) {
      handleStartDateChange(data.order_date);
      hasValidData = true;
    }

    if (isValidPrintDate) {
      handleEndDateChange(data.print_date);
      hasValidData = true;
    }

    // Open manual entry popup if no valid data
    if (!hasValidData) {
      console.log("Opening manual entry popup due to invalid data.");
      setManualEntryPopupOpen(true);
    } else {
      console.log("Valid data found, no need for manual entry popup.");
    }
  };

  const handleManualEntryProceed = () => {
    setManualEntryPopupOpen(false);
    setShowUploadMessage(false); // Proceed with manual entry
    setManualEntryMode(true);
  };

  const handleManualEntryCancel = () => {
    setManualEntryPopupOpen(false); // Close popup, stay on the same form
    setManualEntryMode(true);
  };

  async function checkValidPO(payload) {
    try {
      const response = await PurchaseOrderAPI.CHECK_PO_NUMBER_EXISTS(
        axiosPrivate,
        payload
      );
      if (response?.data?.exists) {
        setDuplicatePO(true);
        setIsPopUp(true);
      } else {
        setDuplicatePO(false);
        setIsPopUp(false);
      }
    } catch (error) {
      console.log("Error in checking PO name Exist or not ", error);
    }
  }

  useEffect(() => {
    if (selectedContract) {
      try {
        if (selectedContract.total_contract_amount > formObject.poAmount) {
          onError(translate("PurchaseOrder.contractAmountError"));
          return;
        }

        let amountUtilizedPercent = null;

        amountUtilizedPercent =
          (selectedContract.total_contract_amount / formObject.poAmount) * 100;

        if (amountUtilizedPercent) {
          setFormObject({
            ...formObject,
            amountUtilized: fPercent(amountUtilizedPercent ?? ""),
          });
        }
      } catch (error) {
        console.log("Error in amountUtilizedPercent : ", error);
      }
    }
  }, [selectedContract]);

  useEffect(() => {
    fetchContracts();
  }, []);

  function getDefaultFormData() {
    return {
      purchaseOrderName: purchaseOrderData?.purchase_order_name ?? "",
      accountNumber: purchaseOrderData?.account_number ?? "",
      amountUtilized: purchaseOrderData?.amount_utilized ?? "",
      poAmount: purchaseOrderData?.po_amount ?? "",
      client: purchaseOrderData?.client ?? "",
      contractsowId: purchaseOrderData?.contract_sow_id ?? "",
      purchase_id: purchaseOrderData?.id ?? " ",
      startDate: purchaseOrderData?.start_date ?? "",
      endDate: purchaseOrderData?.end_date ?? "",
    };
  }

  async function fetchContracts() {
    if (selectedClient.uuid) {
      try {
        const response = await ContractAPI.LIST(
          axiosPrivate,
          selectedClient.uuid,
          1,
          1000
        );

        if (isValidResponse(response)) {
          setContractDataList(response.data.results);
        } else {
          onError("Invalid response from Contract List API");
        }
      } catch (error) {
        console.error("Error in fetchContracts:", error);
        onError(translate("error.fetch"));
      }
    }
  }
  const handleSubmit = async () => {
    if (selectedClient.uuid) {
      const formattedStartDate = startDateValue
        ? fDateTimeMill(startDateValue)
        : "";
      const formattedEndDate = endDateValue ? fDateTimeMill(endDateValue) : "";
      try {
        const formData = new FormData();
        if (fileUploaded && fileUploaded.name) {
          formData.append("file", fileUploaded, fileUploaded.name);
        }

        const postData = {
          purchase_order_name: formObject.purchaseOrderName,
          account_number: formObject.accountNumber,
          // amount_utilized: formObject.amountUtilized.replace("%", ""),
          po_amount: formObject.poAmount,
          start_date: formattedStartDate,

          end_date: formattedEndDate,
          client: selectedClient.uuid,
          // contract_sow_id: selectedContract?.uuid,
        };
        Object.keys(postData).forEach((key) => {
          formData.append(key, postData[key]);
        });
        let response;

        // if (!postData.contract_sow_id) {
        //   console.error("Contract SOW UUID is missing in the API request.");
        //   return;
        // }
        if (isEditMode) {
          response = await PurchaseOrderAPI.UPDATE_PURCHASE(
            axiosPrivate,
            purchaseOrderData.id,
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
                Authorization: `Bearer ${localStorage.microsoft_code}`,
              },
            }
          );
        } else {
          // Call the ADD API
          response = await PurchaseOrderAPI.ADD(axiosPrivate, formData, {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${localStorage.microsoft_code}`,
            },
          });
        }
        if (isValidResponse(response)) {
          handleCloseModal();
          onPurchaseOrderAdded();
          {
            isEditMode
              ? onSucces(translate("Updated"))
              : onSucces(translate("Added"));
          }
        } else {
          onError("Invalid response from API");
        }
      } catch (error) {
        displayError(enqueueSnackbar, error, { anchorOrigin });
        console.error("Error:", error);
      }
    }
  };

  const handleDeleteUtilizedAmount = async (purchaseOrderId, contractsowId) => {
    try {
      const response = await PurchaseOrderAPI.DELETE_UTILIZED_AMOUNT(
        axiosPrivate,
        purchaseOrderId,
        [contractsowId]
      );

      if (response.status === 200) {
        setUtilizedAmounts((prevUtilizedAmounts) => {
          const updatedUtilizedAmounts = prevUtilizedAmounts.filter(
            (amount) => amount.sow_contract !== contractsowId
          );
          console.log("Updated utilized amounts:", updatedUtilizedAmounts);
          return updatedUtilizedAmounts;
        });

        console.log("Utilized amount deleted successfully.");
      } else {
        console.error("Failed to delete utilized amount.");
      }
    } catch (error) {
      console.error("Error deleting utilized amount:", error);
    }
  };

  const totalUtilizedAmount = utilizedAmounts.reduce((total, item) => {
    return total + parseFloat(item.utilized_amount);
  }, 0);

  const [initialFormObject] = useState(getDefaultFormData());
  const [initialUtilizedAmounts] = useState(
    purchaseOrderData?.utilized_amounts || []
  );

  function isCreateDisabled() {
    if (isEditMode) {
      // Check if the main form is unchanged
      const isFormUnchanged =
        JSON.stringify(formObject) === JSON.stringify(initialFormObject);

      // Check if the utilizedAmounts array is unchanged
      const isUtilizedAmountsUnchanged =
        JSON.stringify(utilizedAmounts) ===
        JSON.stringify(initialUtilizedAmounts);

      // Check if the form is incomplete
      const isFormIncomplete = !(
        formObject.poAmount &&
        formObject.purchaseOrderName &&
        formObject.accountNumber &&
        formObject.accountNumber.length <= 20
      );

      // Disable the button if the form is incomplete or no changes are detected
      return (
        isFormIncomplete || (isFormUnchanged && isUtilizedAmountsUnchanged)
      );
    }

    // For create mode, just check if fields are valid
    return !(
      formObject.poAmount &&
      formObject.purchaseOrderName &&
      formObject.accountNumber &&
      formObject.accountNumber.length <= 20
    );
  }

  const onClosePopup = () => {
    setIsPopUp(false);
    setNotPO(false);
    setSelectedFiles([]);
    setFormObject(getDefaultFormData());
    setStartDateValue(null);
    setEndDateValue(null);
  };

  return (
    <>
      <Box sx={styles.header}>
        <HighlightOffIcon onClick={handleClose} sx={styles.closeButton} />
        <span>
          {translate(
            isEditMode
              ? "PurchaseOrder.EDIT_PURCHASE_ORDER"
              : "PurchaseOrder.ADD_PURCHASE_ORDER"
          )}
        </span>
      </Box>
      <Box sx={styles.formContainer}>
        {showUploadMessage && !hasFileToEdit && (
          <Typography variant="subtitle1" color="error">
            Please begin by uploading your Purchase Order (PO).
          </Typography>
        )}
      </Box>

      <Box>
        <Box sx={styles.formContainer}>
          <TextField
            hidden={true}
            select
            fullWidth
            label={
              <MandatoryTextField
                label={translate("CONTRACTS.SELECT_CONTRACT")}
              />
            }
            onChange={handleContractChange}
            value={selectedContract}
            disabled={!formObject?.accountNumber}
          >
            {contractDataList?.map((item) => (
              <MenuItem key={item.uuid} value={item}>
                {item.contractsow_name}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            sx={{ width: "49%" }}
            label={
              <MandatoryTextField label={translate("PurchaseOrder.PO_NAME")} />
            }
            size="medium"
            value={formObject.purchaseOrderName}
            variant="outlined"
            inputProps={{ maxLength: 25 }}
            onChange={(e) => {
              const value = e.target.value;
              const regex = /^[A-Za-z0-9\s]*$/;
              if (regex.test(value) || value === "") {
                setFormObject({
                  ...formObject,
                  purchaseOrderName: value,
                });
              }
            }}
          />
        </Box>

        <Box>
          <Box sx={styles.formContainer}>
            <TextField
              label={
                <MandatoryTextField
                  label={translate("PurchaseOrder.ACCOUNT_NUMBER")}
                />
              }
              size="medium"
              value={formObject.accountNumber}
              variant="outlined"
              sx={{ width: "100%" }}
              fullWidth
              disabled={!manualEntryMode}
              onChange={(e) =>
                setFormObject({ ...formObject, accountNumber: e.target.value })
              }
              error={formObject.accountNumber.length > 20}
              helperText={
                formObject.accountNumber.length > 20
                  ? "PO Number cannot exceed 20 characters"
                  : ""
              }
            />
            <TextField
              label={
                <MandatoryTextField
                  label={translate("PurchaseOrder.PO_AMOUNT")}
                />
              }
              size="medium"
              value={formObject.poAmount}
              variant="outlined"
              fullWidth
              disabled={!manualEntryMode}
              onChange={(e) => {
                const value = e.target.value;

                // Ensure value is a valid positive number
                if (value === "" || (!isNaN(value) && Number(value) >= 0)) {
                  // Limit value to 8 digits
                  if (value.length <= 8) {
                    setFormObject({ ...formObject, poAmount: value });
                  }
                }
              }}
              type="number" // Ensure the input is of type number
              inputProps={{
                inputMode: "numeric", // Allows number input mode for mobile
                pattern: "[0-9]*", // Restricts input to numbers only
              }}
            />

            <TextField
              hidden={true}
              label={translate("PurchaseOrder.AMOUNT_UTILIZED")}
              size="medium"
              value={formObject.amountUtilized}
              variant="outlined"
              fullWidth
              disabled
            />
          </Box>
        </Box>
      </Box>

      <Box>
        <Box sx={styles.formContainer} hidden={true}>
          <TextField
            label={
              <MandatoryTextField
                label={translate("PurchaseOrder.PO_AMOUNT")}
              />
            }
            size="medium"
            value={fCurrency(formObject.poAmount ?? "")}
            variant="outlined"
            fullWidth
            disabled
          />

          <TextField
            label={translate("CONTRACTS.TOTAL_CONTRACT_AMOUNT")}
            size="medium"
            value={fCurrency(selectedContract?.total_contract_amount ?? "")}
            variant="outlined"
            fullWidth
            disabled
          />
        </Box>
        <Box sx={styles.formContainer}>
          <DatePicker
            label={translate("PurchaseOrder.PO_START_DATE")}
            onChange={handleStartDateChange}
            renderInput={(params) => <TextField {...params} fullWidth />}
            value={startDateValue}
            views={["year", "month", "day"]}
            disabled={!manualEntryMode}
            inputFormat="yyyy-MM-dd"
          />
          <DatePicker
            label={translate("PurchaseOrder.PO_END_DATE")}
            minDate={getMinStartDate()}
            onChange={handleEndDateChange}
            renderInput={(params) => (
              <TextField
                {...params}
                fullWidth
                error={!!endDateError}
                helperText={endDateError}
              />
            )}
            value={endDateValue}
            views={["year", "month", "day"]}
            disabled={!manualEntryMode}
            inputFormat="yyyy-MM-dd"
          />
        </Box>
      </Box>

      <Box sx={styles.formContainer}>
        {hasFileToEdit && fileUploaded && upLoadedFileUrls?.length > 0 ? (
          <PreviewContractFile
            isEditMode={true}
            filesData={upLoadedFileUrls}
            deletedFilesData={deletedFileUrls}
            onFilesDeleted={handleFilesDeleted}
          />
        ) : (
          <UploadFileWithExtractData
            docType="PO"
            onFileDataExtracted={onFileDataExtracted}
            onFileUploaded={(filesData) => {
              setUpLoadedFileUrls(filesData);
            }}
            deleteCount={deleteCount}
            onFileDeleted={onResetData}
            setFileUploaded={setFileUploaded}
            page={page}
            selectedFiles={selectedFiles}
            setSelectedFiles={setSelectedFiles}
          />
        )}
      </Box>
      {isEditMode && utilizedAmounts.length > 0 && (
        <>
          <Box
            sx={{
              padding: "10px",
              backgroundColor: "#F3F0FF",
              marginBottom: "20px",
              width: "60%",
              marginLeft: "26px",
            }}
          >
            <Typography variant="body1">
              <strong>Total Contracts Assigned:</strong>{" "}
              {utilizedAmounts.length} | <strong>Total Assigned Amount:</strong>
              <Typography component="span" sx={{ color: "#7E3BDC" }}>
                {" "}
                ${totalUtilizedAmount.toFixed(2)}
              </Typography>
            </Typography>
          </Box>
          <Box sx={styles.formContainer}>
            <Table sx={styles.table}>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <strong>{translate("Contract Name")}</strong>
                  </TableCell>
                  <TableCell>
                    <strong>{translate("Amount")}</strong>
                  </TableCell>
                  <TableCell>
                    <strong>{translate("Amount Utilized (%)")}</strong>
                  </TableCell>
                  <TableCell>
                    {" "}
                    <strong>{translate("Actions")}</strong>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {utilizedAmounts?.map((amount) => {
                  const utilizedPercentage = (
                    (parseFloat(amount.utilized_amount) / purchaseOrderAmount) *
                    100
                  ).toFixed(1);

                  return (
                    <TableRow key={amount?.id}>
                      <TableCell>{amount.contractsow_name}</TableCell>
                      <TableCell>{fCurrency(amount.utilized_amount)}</TableCell>

                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <span style={{ marginRight: "10%" }}>
                            {utilizedPercentage}%
                          </span>
                          <LinearProgress
                            variant="determinate"
                            value={utilizedPercentage}
                            sx={{
                              width: "30%",
                              height: 8,
                              borderRadius: 5,
                            }}
                            color={
                              utilizedPercentage == 100 ? "primary" : "success"
                            }
                          />
                        </Box>
                      </TableCell>
                      <TableCell>
                        <IconButton
                          onClick={() =>
                            handleDeleteUtilizedAmount(
                              purchaseOrderId,
                              amount.sow_contract
                            )
                          }
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Box>
        </>
      )}

      <ManualPOEntryPopup
        open={manualEntryPopupOpen}
        onProceed={handleManualEntryProceed}
        onCancel={handleManualEntryCancel}
      />

      {isPopUp && <POExistPopUp onClose={onClosePopup} notPO={notPO} />}

      <Button
        sx={styles.button}
        variant="contained"
        onClick={handleSubmit}
        disabled={isCreateDisabled() || duplicatePO}
      >
        {translate(
          isEditMode
            ? "PurchaseOrder.UPDATE_PURCHASE_ORDER"
            : "PurchaseOrder.CREATE_PURCHASE_ORDER"
        )}
      </Button>
    </>
  );
}
export default AddPurchaseOrderModal;
