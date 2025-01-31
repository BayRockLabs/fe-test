import React, { useEffect, useState } from "react";
import {
  Box,
  MenuItem,
  TextField,
  Button,
  Stack,
  Typography,
  InputAdornment,
  Grid,
  Tooltip,
  IconButton,
} from "@mui/material";
import { PATH_PAGE } from "../../routes/paths";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import { useSnackbar } from "notistack";
import useAxiosPrivate, { isValidResponse } from "../../hooks/useAxiosPrivate";
import useLocales from "../../hooks/useLocales";
import useClient from "../../hooks/useClient";
import PricingAPI from "../../services/PricingService";
import EstimationAPI from "../../services/EstimationService";
import { fDateMDY, fDateTimeMill } from "../../utils/formatTime";
import ContractAPI from "../../services/ContractService";
import { createStyles, useTheme } from "@mui/styles";
import { deleteFilesFromServer } from "./UploadContractFile";
import { fCurrencyWithoutSign, fNumber } from "../../utils/formatNumber";
import PreviewContractFile from "./PreviewContractFile";
import UploadFileWithExtractData from "./UploadFileWithExtractData";
import MandatoryTextField from "../../pages/MandatoryTextField";
import { fGetNumber } from "../../utils/formatString";
import { paymentTermsOptions } from "../clients/AddClientStepper";
import { anchorOrigin } from "../../utils/constants";
import ConsentPopUp from "../../components/ConsentPopUp";
import { useNavigate } from "react-router-dom";
import { displayError } from "../../utils/handleErrors";
import AllocationAPI from "../../services/AllocationService";
import InfoIcon from "@mui/icons-material/Info";
function AddContractForm({ detailData, handleClose, onContractAdded }) {
  const [deleteCount, setDeleteCount] = useState(0);
  const isEditMode = detailData ? true : false;
  const navigate = useNavigate();
  const theme = useTheme();
  const styles = useStyles(theme);
  const axiosPrivate = useAxiosPrivate();
  const { enqueueSnackbar } = useSnackbar();

  const { translate } = useLocales();
  const { selectedClient } = useClient();
  const [contractRedirectionId, setContractRedirectionId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [priceDataList, setPriceDataList] = useState([]);
  const [selectedPrice, setSelectedPrice] = React.useState(
    isEditMode ? {} : null
  );

  const [estimationDataList, setEstimationDataList] = useState([]);

  const [selectedEstimation, setSelectedEstimation] = React.useState(
    isEditMode ? {} : null
  );
  const [combination, setcombination] = useState({});
  const [formObject, setFormObject] = useState({
    contractName: detailData?.contractsow_name ?? "",
    contractAmount: detailData?.total_contract_amount ?? "",
    termsClient: detailData?.payment_term_client ?? "",
    termsContract: detailData?.payment_term_contract ?? "",
    contractType: detailData?.contractsow_type ?? "",
    docContractAmount: detailData?.doc_contract_amount ?? "",
    startDate: detailData?.start_date ?? "",
    endDate: detailData?.end_date ?? "",
    documentStartDate: detailData?.doc_start_date ?? "",
    documentEndDate: detailData?.doc_end_date ?? "",
  });
  const [contractExist, setContractExist] = useState(false);
  const [deletedFileUrls, setDeletedFileUrls] = useState([]);
  const [upLoadedFileUrls, setUpLoadedFileUrls] = useState(
    detailData?.document ?? []
  );
  const [isConsentPopUp, setConsentPopUp] = useState(false);
  const [fileAmount, setFileAmount] = useState(0);
  const [priceAmount, setPriceAmount] = useState(0);
  const [confirm, setConfirm] = useState(false);
  const contractType = ["FIXED", "TIME AND MATERIAL", "CAPACITY"];
  const [unidentifiedData, setUnIdentifiedData] = useState(false);
  const [fileUploaded, setFileUploaded] = useState({});
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [contractDataList, setContractDataList] = useState([]);
  const [selectedContract, setSelectedContract] = useState({});

  useEffect(() => {
    fetchEstimations();
  }, []);

  useEffect(() => {
    if (selectedEstimation?.uuid) {
      fetchPrices();
    }
  }, [selectedEstimation]);
  useEffect(() => {
    if (selectedEstimation?.uuid && selectedPrice?.uuid) {
      checkCombination(combination);
    }
  }, [selectedEstimation, selectedPrice]);

  useEffect(() => {
    if (selectedPrice) {
      const finalOffer = selectedPrice?.final_offer_price;
      setContractAmount(finalOffer);
      setFormObject((prevFormObject) => ({
        ...prevFormObject,
        contractAmount: parseFloat(finalOffer)?.toFixed(2),
      }));
    }
  }, [selectedPrice]);

  useEffect(() => {
    if (selectedClient.uuid && estimationDataList?.length > 0) {
      const estimation = estimationDataList.find(
        (item) => item.uuid === detailData?.estimation_uuid
      );
      if (estimation) {
        setSelectedEstimation(estimation);
      }
    }
  }, [estimationDataList, selectedClient.uuid]);

  useEffect(() => {
    if (detailData?.extension_sow_contract && contractDataList?.length > 0) {
      const matchedContract = contractDataList.find(
        (contract) => contract.uuid === detailData.extension_sow_contract
      );
      setSelectedContract(matchedContract || null); // Set to null if no match is found
    }
  }, [detailData, contractDataList]);

  async function checkCombination(payload) {
    if (!isEditMode) {
      try {
        const response = await ContractAPI.CHECK(axiosPrivate, payload);
        setContractExist(response.data.exists);
        if (response.data.exists) {
          setContractRedirectionId(response?.data?.data.uuid);
        }
      } catch (error) {
        console.log("Error while checking contract exist or not : ", error);
        onError(translate("error.checkContractExist"));
      }
    }
  }
  const gotoContractPage = () => {
    const uuid = contractRedirectionId;
    navigate(PATH_PAGE.contracts.detail, { state: { uuid } });
  };

  function setContractAmount(amount) {
    if (!formObject.contractAmount) {
      handleFormChange(
        "contractAmount",
        amount ? fCurrencyWithoutSign(amount) : ""
      );
    } else {
      isValidPriceFileAmount(
        selectedPrice?.final_offer_price,
        formObject.contractAmount
      );
    }
  }

  function isValidPriceFileAmount(pAmount, fAmount) {
    let isNotValidAmount = false;

    try {
      const priceAmount = fCurrencyWithoutSign(pAmount);
      const newPriceAmount = parseFloat(priceAmount).toFixed(2);
      const fileAmount = fCurrencyWithoutSign(fAmount);
      const newFileAmount = parseFloat(fileAmount).toFixed(2);
      isNotValidAmount = newPriceAmount !== newFileAmount;
      if (newFileAmount === newPriceAmount) {
        setConfirm(true);
      }
    } catch (error) {
      console.log("Error in setContractAmount : ", error);
    }

    if ((pAmount === 0 || pAmount) && !isNaN(fAmount)) {
      if (isNotValidAmount) {
        setFileAmount(fAmount);
        setPriceAmount(fCurrencyWithoutSign(pAmount));
        return false;
      }
    }
    return true;
  }

  const onCloseConsetPopup = () => {
    setConfirm(false);
    setConsentPopUp(false);
    setUnIdentifiedData(false);
    setSelectedFiles([]);
    setFileUploaded({});
    setFormObject((prev) => ({
      ...prev,
      docContractAmount: "",
      documentStartDate: null,
      documentEndDate: null,
    }));
  };

  const handleFileUpload = (filesData) => {
    setUpLoadedFileUrls((prevFiles) => [...prevFiles, ...filesData]);
  };

  function handleFormChange(key, value) {
    setFormObject((prevObject) => {
      return { ...prevObject, [key]: value };
    });
  }

  const onPriceChange = (event) => {
    const priceItem = event.target.value;
    setSelectedPrice(priceItem);
    setcombination({
      ...combination,
      pricing_id: priceItem.uuid,
    });
  };

  const onEstimationChange = (event) => {
    const estimationItem = event.target.value;
    setSelectedEstimation(estimationItem);
    setcombination({
      ...combination,
      estimation_id: estimationItem.uuid,
    });
    const startDate = estimationItem.contract_start_date
      ? fDateMDY(estimationItem.contract_start_date)
      : "";
    const endDate = estimationItem.contract_end_date
      ? fDateMDY(estimationItem.contract_end_date)
      : "";
    setFormObject({
      ...formObject,
      startDate: startDate,
      endDate: endDate,
    });
  };

  const onError = (message) => {
    enqueueSnackbar("Contract - " + message, {
      anchorOrigin,
      variant: "error",
    });
  };

  async function fetchEstimations() {
    if (selectedClient.uuid) {
      try {
        const response = await EstimationAPI.LIST(
          axiosPrivate,
          selectedClient.uuid,
          1,
          1000
        );

        if (isValidResponse(response)) {
          const estimationList = response.data.results;
          setEstimationDataList(estimationList);
          setIsLoading(false);
          if (isEditMode) {
            setSelectedEstimation(
              estimationList.find(
                (item) => item.name === detailData.estimation_name
              )
            );
          }
        } else {
          onError(translate("error.fetch"));
        }
      } catch (error) {
        console.log("Error in fetchEstimations : ", error);
        onError(translate("error.fetch"));
      }
    }
  }

  async function fetchPrices() {
    if (selectedEstimation?.uuid) {
      try {
        const response = await PricingAPI.LIST(
          axiosPrivate,
          selectedClient.uuid,
          1,
          1000
        );

        if (isValidResponse(response)) {
          const filterPriceList = response?.data?.results?.filter(
            (item) => item.estimation === selectedEstimation.uuid
          );
          setPriceDataList(filterPriceList);
          setIsLoading(false);

          if (isEditMode) {
            const priceItem = filterPriceList.find(
              (item) => item.name === detailData.pricing_name
            );
            if (
              isValidPriceFileAmount(
                priceItem.final_offer_price,
                formObject.contractAmount
              )
            ) {
              setSelectedPrice(priceItem);
            }
          }
        } else {
          onError("Invalid response from Price List API ");
        }
      } catch (error) {
        console.log("Error in fetchPrices : ", error);
        onError(translate("error.fetch"));
      }
    }
  }

  const onContractAddedSuccess = () => {
    enqueueSnackbar(
      translate(isEditMode ? "message.update" : "message.create"),
      { anchorOrigin }
    );
    onContractAdded();
  };

  async function checkForDeletedFiles() {
    deleteFilesFromServer(axiosPrivate, deletedFileUrls, () => {
      onError(translate("error.deleteFail"));
    });
  }

  async function requestAddContract(payload, fileUploaded) {
    try {
      const formData = new FormData();

      if (fileUploaded && fileUploaded.name) {
        formData.append("file", fileUploaded, fileUploaded.name);
      }

      // Append the rest of the payload as individual fields
      Object.keys(payload).forEach((key) => {
        formData.append(key, payload[key]);
      });

      let response;
      if (isEditMode) {
        checkForDeletedFiles();
        response = await ContractAPI.UPDATE(
          axiosPrivate,
          detailData.uuid,
          formData
        );
      } else {
        response = await ContractAPI.ADD(axiosPrivate, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.microsoft_code}`,
          },
        });
      }

      onContractAddedSuccess(response?.data);
    } catch (error) {
      displayError(enqueueSnackbar, error, { anchorOrigin });
      console.log("Error in requestAddContract ", error);
    }
  }
  const [initialFormObject, setInitialFormObject] = useState(formObject);
  useEffect(() => {
    // Set the initial state when the component mounts
    setInitialFormObject({ ...formObject });
  }, []);

  // Function to check for changes
  function hasChanges() {
    return (
      formObject.contractName !== initialFormObject.contractName ||
      formObject.contractAmount !== initialFormObject.contractAmount ||
      formObject.termsContract !== initialFormObject.termsContract ||
      formObject.contractType !== initialFormObject.contractType ||
      selectedPrice !== initialFormObject.selectedPrice ||
      confirm !== initialFormObject.confirm
    );
  }
  function isCreateDisabled() {
    if (
      !formObject.contractName ||
      !formObject.contractAmount ||
      !formObject.termsContract ||
      !formObject.contractType ||
      !selectedPrice ||
      !confirm ||
      (!isEditMode ? contractExist : false)
    ) {
      return true;
    }

    // Button should only enable when changes are detected in edit mode
    if (isEditMode && !hasChanges()) {
      return true;
    }
    return false;
  }
  const handleCreateContract = async () => {
    if (selectedClient.uuid) {
      const payload = {
        contractsow_name: formObject.contractName,
        total_contract_amount: formObject.contractAmount,
        start_date: fDateTimeMill(formObject.startDate),
        end_date: fDateTimeMill(formObject.endDate),
        payment_term_contract: formObject.termsContract,
        contractsow_type: formObject.contractType,
        client: selectedClient.uuid,
        pricing: selectedPrice.uuid,
        estimation: selectedEstimation.uuid,
        doc_contract_amount: formObject.docContractAmount,
        doc_start_date: formObject.documentStartDate,
        doc_end_date: formObject.documentEndDate,
        extension_sow_contract: selectedContract.uuid || null,
      };

      await requestAddContract(payload, fileUploaded);
    }
  };
  const onConsent = () => {
    setConfirm(true);
    setConsentPopUp(false);
    setUnIdentifiedData(false);
  };

  const onResetData = () => {
    setFormObject({
      ...formObject,
      docContractAmount: "",
      documentStartDate: "",
      documentEndDate: "",
    });
    setConfirm(false);
  };

  const onFileDataExtracted = (data) => {
    onResetData();

    let totalAmount = null;
    let startDate = null;
    let endDate = null;

    const amount = data?.Total;
    const doubleNumber = fGetNumber(amount);
    if (doubleNumber) {
      totalAmount = fCurrencyWithoutSign(doubleNumber);
    }

    try {
      startDate = fDateMDY(data?.start_date);
    } catch (error) {
      console.log("Error in extracted startDate ", error);
    }

    try {
      endDate = fDateMDY(data?.end_date);
    } catch (error) {
      console.log("Error in extracted endDate ", error);
    }

    if (totalAmount && startDate && endDate) {
      setFormObject({
        ...formObject,
        docContractAmount: totalAmount,
        documentStartDate: startDate,
        documentEndDate: endDate,
      });

      if (selectedPrice) {
        if (
          !isValidPriceFileAmount(selectedPrice.final_offer_price, totalAmount)
        ) {
          setConsentPopUp(true);
          //setSelectedPrice(null);
        }
      }
    } else {
      setConsentPopUp(true);
      setUnIdentifiedData(true);
      setFormObject({
        ...formObject,
        docContractAmount: 0,
      });
    }
  };

  const handleFilesDeleted = (deletedFilesData, filesData) => {
    setConfirm(false);
    setDeletedFileUrls(deletedFilesData);
    setUpLoadedFileUrls(filesData);
    setFormObject({
      ...formObject,
      docContractAmount: "",
      documentStartDate: "",
      documentEndDate: "",
    });
  };
  useEffect(() => {
    fetchSOWContracts();
  }, []);
  async function fetchSOWContracts() {
    if (selectedClient.uuid) {
      try {
        const response = await AllocationAPI.GET_EST_CON(
          axiosPrivate,
          selectedClient.uuid
        );

        if (isValidResponse(response)) {
          setContractDataList(response.data);
        }
      } catch (error) {
        console.log("Error in fetchSOWContracts : ", error);
      }
    }
  }
  return (
    <Box padding={"2% 2% 10% 2%"}>
      <Stack {...styles.titleStackParams}>
        <HighlightOffIcon onClick={handleClose} />
        <Typography noWrap variant="h4">
          {translate(
            isEditMode ? "CONTRACTS.EDIT_CONTRACT" : "CONTRACTS.ADD_CONTRACT"
          )}
        </Typography>
      </Stack>
      {contractExist && (
        <Stack direction={"row"}>
          <Typography sx={styles.contractExistError}>
            This estimation and pricing combination has already been assigned to
            a contract. You cannot create a new contract using the same
            configuration.
          </Typography>
          <Typography
            onClick={gotoContractPage}
            sx={{
              color: "blue",
              fontSize: "12px",
              cursor: "pointer",
              textDecoration: "underline",
            }}
          >
            Click here to view
          </Typography>
        </Stack>
      )}
      <Stack {...styles.stackParams}>
        <TextField
          disabled={isEditMode}
          InputLabelProps={{ shrink: true }}
          select
          fullWidth
          label={
            <MandatoryTextField
              label={translate("Estimations.ESTIMATION_NAME")}
            />
          }
          value={selectedEstimation}
          onChange={!isEditMode ? onEstimationChange : null}
        >
          {estimationDataList?.map((item) => (
            <MenuItem key={item.uuid} value={item}>
              {item.name}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          disabled={isEditMode}
          InputLabelProps={{ shrink: true }}
          select
          fullWidth
          label={
            <MandatoryTextField
              label={translate("PriceEstimation.PRICING_NAME")}
            />
          }
          value={selectedPrice}
          onChange={!isEditMode ? onPriceChange : null}
          inputProps={{ maxLength: 25 }}
        >
          {priceDataList?.map((item) => (
            <MenuItem key={item.uuid} value={item}>
              {item.name}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          fullWidth
          // label={translate("CONTRACTS.CONTRACT_EXT")}
          label={
            <div style={{ display: "flex", alignItems: "center" }}>
              {translate("CONTRACTS.CONTRACT_EXT")}
              <Tooltip title="Select an existing SOW contract if this new contract is an extension">
                <IconButton size="small" style={{ marginLeft: 4 }}>
                  <InfoIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </div>
          }
          value={selectedContract || null}
          onChange={(event) => {
            const contract = event.target.value;
            setSelectedContract(contract);
          }}
        >
          {contractDataList && contractDataList.length > 0 ? (
            contractDataList
              .filter(
                (item) => item.contractsow_name !== formObject?.contractName
              ) // Exclude the current contract name
              .map((item) => (
                <MenuItem key={item.uuid} value={item}>
                  {item.contractsow_name}
                </MenuItem>
              ))
          ) : (
            <MenuItem disabled value="">
              {translate("No contracts")}
            </MenuItem>
          )}
        </TextField>
      </Stack>

      <Stack {...styles.stackParams}>
        <TextField
          InputLabelProps={{ shrink: true }}
          label={
            <MandatoryTextField label={translate("CONTRACTS.CONTRACT_NAME")} />
          }
          size="medium"
          value={formObject?.contractName}
          inputProps={{ maxLength: 25 }}
          onChange={(e) => {
            const newValue = e.target.value.replace(/[^A-Za-z0-9\s]/g, "");
            handleFormChange("contractName", newValue);
          }}
          variant="outlined"
          fullWidth
          disabled={contractExist}
        />

        <TextField
          InputLabelProps={{ shrink: true }}
          disabled
          label={translate("CONTRACTS.CLIENT_NAME")}
          size="medium"
          value={selectedClient.name}
          variant="outlined"
          fullWidth
        />
        <TextField
          InputLabelProps={{ shrink: true }}
          id="outlined-select-contract-type"
          select
          fullWidth
          label={
            <MandatoryTextField
              label={translate("CONTRACTS.SELECT_CONTRACT_TYPE")}
            />
          }
          value={formObject?.contractType}
          onChange={(e) => {
            handleFormChange("contractType", e?.target?.value);
          }}
          disabled={contractExist}
        >
          {contractType.map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </TextField>
      </Stack>
      <Stack {...styles.stackParams}>
        <TextField
          InputLabelProps={{ shrink: true }}
          id="outlined-select-contract-term"
          select
          fullWidth
          label={
            <MandatoryTextField
              label={translate("CONTRACTS.PAYMENT_TERMS_CONTRACT")}
            />
          }
          value={formObject?.termsContract}
          onChange={(e) => {
            handleFormChange("termsContract", e?.target?.value);
          }}
          disabled={contractExist}
        >
          {paymentTermsOptions.map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          InputLabelProps={{ shrink: true }}
          disabled
          fullWidth
          type="number"
          label={
            <MandatoryTextField
              label={translate("CONTRACTS.TOTAL_CONTRACT_AMOUNT")}
            />
          }
          inputProps={{ maxLength: 20 }}
          value={formObject?.contractAmount}
          onChange={(e) => {
            // handleFormChange("contractAmount", e?.target?.value);
          }}
          variant="outlined"
          InputProps={{
            startAdornment: <InputAdornment position="start">$</InputAdornment>,
          }}
        />
        <TextField
          label="Contract Start Date"
          fullWidth
          value={formObject.startDate ?? ""}
          InputProps={{
            readOnly: true,
          }}
          disabled={contractExist}
        />
      </Stack>

      <Stack direction="row" spacing={4} marginTop="4px" marginBottom="21px">
        <Grid xs={12} md={4} sm={4}>
          <TextField
            label="Contract End Date"
            fullWidths
            value={formObject.endDate ?? ""}
            InputProps={{
              readOnly: true,
            }}
            disabled={contractExist}
          />
        </Grid>
      </Stack>
      {formObject?.docContractAmount >= 0 && (
        <Stack direction={"row"} spacing={2}>
          <Typography sx={styles.docItemText}>
            {"\u2B24"}&nbsp;&nbsp;
            {translate("SOW Amount") + " - " + formObject?.docContractAmount}
          </Typography>
          <Typography sx={styles.docItemText}>
            {"\u2B24"}&nbsp;&nbsp;
            {translate("startDate") +
              " - " +
              (formObject.documentStartDate ?? null)}
          </Typography>
          <Typography sx={styles.docItemText}>
            {"\u2B24"}&nbsp;&nbsp;
            {translate("endDate") +
              " - " +
              (formObject.documentEndDate ?? null)}
          </Typography>
        </Stack>
      )}
      {isConsentPopUp && (
        <ConsentPopUp
          onClose={onCloseConsetPopup}
          onConsent={onConsent}
          priceAmount={priceAmount}
          fileAmount={fileAmount}
          unidentifiedData={unidentifiedData}
        />
      )}

      {fileUploaded && upLoadedFileUrls?.length > 0 ? (
        <PreviewContractFile
          isEditMode={true}
          filesData={upLoadedFileUrls}
          deletedFilesData={deletedFileUrls}
          onFilesDeleted={handleFilesDeleted}
        />
      ) : (
        <UploadFileWithExtractData
          docType="SOW"
          onFileDataExtracted={onFileDataExtracted}
          onFileUploaded={(files) => {
            handleFileUpload(files);
          }}
          deleteCount={deleteCount}
          onFileDeleted={onResetData}
          setFileUploaded={setFileUploaded}
          selectedFiles={selectedFiles}
          setSelectedFiles={setSelectedFiles}
        />
      )}

      <Button
        disabled={isCreateDisabled()}
        onClick={handleCreateContract}
        sx={{
          float: "right",
          margin: "30px",
          borderRadius: "4px",
          height: "40px",
        }}
        color="primary"
        variant="contained"
      >
        {translate(
          isEditMode
            ? "CONTRACTS.UPDATE_CONTRACTS"
            : "CONTRACTS.CREATE_CONTRACTS"
        )}
      </Button>
    </Box>
  );
}
export default AddContractForm;

const useStyles = createStyles((theme) => ({
  titleStackParams: {
    direction: "row",
    spacing: 1,
    alignItems: "center",
  },
  stackParams: {
    direction: "row",
    spacing: 4,
    alignItems: "center",
    marginTop: 4,
    marginBottom: 4,
    justifyContent: "space-evenly",
  },
  docItemText: {
    fontSize: "10px",
    color: theme.palette.text.main,
  },
  contractExistError: {
    color: "red",
    fontSize: "12px",
  },
}));
