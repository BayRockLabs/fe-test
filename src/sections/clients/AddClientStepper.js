import * as React from "react";
import Box from "@mui/material/Box";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import OutlinedInput from "@mui/material/OutlinedInput";

import MenuItem from "@mui/material/MenuItem";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useState } from "react";
import Select from "@mui/material/Select";
import TableDataComponent from "./TableDataComponent";
import ClientAPI from "../../services/ClientService";
import useAxiosPrivate, { isValidResponse } from "../../hooks/useAxiosPrivate";
import { displayError } from "../../utils/handleErrors";
import { useSnackbar } from "notistack";
import { fDateMDY, fDateToISOString } from "../../utils/formatTime";
import { createStyles, useTheme } from "@mui/styles";
import { fCapitalizeFirst, isValidEmail } from "../../utils/formatString";
import useLocales from "../../hooks/useLocales";
import UploadContractFile, {
  deleteFilesFromServer,
} from "../ContractManagement/UploadContractFile";
// import ContractAPI from "../../services/ContractService";
import PreviewContractFile from "../ContractManagement/PreviewContractFile";
import {
  Stack,
  CircularProgress,
  FormHelperText,
  Autocomplete,
} from "@mui/material";
import MandatoryTextField from "../../pages/MandatoryTextField";
import { anchorOrigin } from "../../utils/constants";

import ControlledDatePicker from "../../common/ControlledDatePicker";
import { countryData } from "./CountryData";
import { stateData } from "./StateData";
import { cityData } from "./CityData";
import { debounce } from "lodash";

const steps = ["Client Details", "Org Level Contract", "Payment Details"];

const useStyles = createStyles((theme) => ({
  apContainer: {
    display: "flex",
    gap: "30px",
    flexDirection: "row",
    direction: "revert",
    margin: "16px",
    alignItems: "center",
  },
  loading: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: "100vh",
    marginTop: "-5%",
  },
}));

export default function AddClientStepper({
  handleClose,
  clientData,
  onClientAdded,
  userData,
}) {
  const isEditMode = clientData ? true : false;
  const theme = useTheme();
  const styles = useStyles(theme);
  const { translate } = useLocales();
  const clientCreatedByVal =
    userData?.user_info?.first_name + " " + userData?.user_info?.last_name ||
    "";

  const [activeStep, setActiveStep] = React.useState(0);
  const [clientAddress, setClientAddres] = useState(clientData?.address || "");
  const [skipped, setSkipped] = React.useState(new Set());
  const [error, setError] = React.useState({
    city: null,
    zip: null,
    email: null,
    clientAddress: null,
  });

  const [clientAPList, setClientAPList] = useState([]);

  const [hasFileToEdit, seHasFileToEdit] = useState(false);
  const [deletedFileUrls, setDeletedFileUrls] = useState([]);
  const [upLoadedFileUrls, setUpLoadedFileUrls] = useState([]);
  const [isLoading, setLoading] = useState(false);
  const [country, setCountry] = useState(clientData?.country || "");
  const [region, setRegion] = useState(clientData?.state || "");
  const [city, setCity] = useState(clientData?.city || "");
  const [zip, setZip] = useState(clientData?.zip_code || "");
  const [clientContractFile, setClientContractFile] = useState({});
  const [selectedFiles, setSelectedFiles] = useState([]);
  const axiosPrivate = useAxiosPrivate();
  const { enqueueSnackbar } = useSnackbar();

  const isStepSkipped = (step) => {
    return skipped.has(step);
  };

  // State for the selected country, state, and city
  const [selectedCountry, setSelectedCountry] = useState(
    clientData?.country || ""
  );
  const [selectedState, setSelectedState] = useState(clientData?.state || "");
  const [selectedCity, setSelectedCity] = useState(clientData?.city || "");
  const [businessUnits, setBusinessUnits] = useState([]);
  const [selectedBusinessUnit, setSelectedBusinessUnit] = useState(
    clientData?.business_unit || ""
  );
  const [initialClientData, setInitialClientData] = useState(null);

  React.useEffect(() => {
    if (clientData && businessUnits?.length > 0 && clientData?.business_unit) {
      setSelectedBusinessUnit(clientData.business_unit);
    }
  }, [clientData, businessUnits]);

  React.useEffect(() => {
    const envUnits = process.env.REACT_APP_BUSINESS_UNITS;

    if (!envUnits) {
      console.error(
        "Business Units not configured properly in environment variables."
      );
      setBusinessUnits([]);
    } else {
      const units = envUnits.split(",").map((unit) => unit.trim());
      setBusinessUnits(units);
    }
  }, []);

  const handleBusinessUnitChange = (event) => {
    setSelectedBusinessUnit(event.target.value);
  };

  React.useEffect(() => {
    if (isEditMode && clientData) {
      setInitialClientData({
        name: clientName,
        address: clientAddress,
        start_date: start_date,
        end_date: end_date,
        contractType: contractType,
        contractName: contractName,
        paymentTerms: paymentTerms,
        country: selectedCountry,
        state: selectedState,
        city: selectedCity,
        zip: zip,
        clientContractFile: clientContractFile,
        clientAPList: clientAPList,
        upLoadedFileUrls: upLoadedFileUrls,
      });
    }
  }, [isEditMode, clientData]);
  const onReset = () => {
    setClientContractFile({});
    setUpLoadedFileUrls([]);
    setSelectedFiles([]);
  };
  const hasChanges = () => {
    return (
      clientName?.trim() !== initialClientData?.name ||
      clientAddress?.trim() !== initialClientData?.address ||
      start_date !== initialClientData?.start_date ||
      end_date !== initialClientData?.end_date ||
      contractType?.trim() !== initialClientData?.contractType ||
      contractName?.trim() !== initialClientData?.contractName ||
      paymentTerms !== initialClientData?.paymentTerms ||
      selectedCountry !== initialClientData?.country ||
      selectedState !== initialClientData?.state ||
      selectedCity !== initialClientData?.city ||
      zip?.trim() !== initialClientData?.zip ||
      clientContractFile !== initialClientData?.clientContractFile ||
      JSON.stringify(clientAPList) !==
        JSON.stringify(initialClientData?.clientAPList) ||
      JSON.stringify(upLoadedFileUrls) !==
        JSON.stringify(initialClientData?.upLoadedFileUrls)
    );
  };

  const handleEmailChange = (event) => {
    const inputEmail = event.target.value;
    const trimmedEmail = inputEmail.trim();

    setValue("clientApEmail", inputEmail);

    if (!inputEmail) {
      // Clear error if the input is empty
      setError((prev) => ({ ...prev, email: null }));
    } else if (inputEmail !== trimmedEmail) {
      // Check for leading or trailing spaces
      setError((prev) => ({
        ...prev,
        email: "Email should not have leading or trailing spaces",
      }));
      disableAddAPBtn = false;
    } else if (!isValidEmail(trimmedEmail)) {
      // Validate email format
      setError((prev) => ({
        ...prev,
        email: "Invalid email address",
      }));
      disableAddAPBtn = false;
    } else {
      // Clear error if valid
      setError((prev) => ({
        ...prev,
        email: null,
      }));
    }
  };

  const isWeekend = (date) => {
    const day = date.getDay();
    return day === 0 || day === 6;
  };

  const handleBack = () => {
    if (activeStep === 0) {
      return;
    }
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  const formSchema = yup.object().shape({
    clientName: yup.string().trim().required(),
    clientAddress: clientAddress,
    clientCreatedBy: yup.string().trim().required(),
    contractName: yup.string().trim().required(),
    contractType: yup.string().trim().required(),
    paymentTerms: yup.string().trim(),
    clientInvoicingProcess: yup.string().trim().required(),
    clientApName: yup.string().trim().required(),
    clientApEmail: yup.string().trim().email().required(),
    start_date: yup.string(),
    end_date: yup.string(),
    clientCity: city,
    country: country,
    zipCode: zip,
    state: region,
  });
  const defaultValues = React.useMemo(() => getDefaultValue(), [clientData]);
  const {
    register,
    formState: { isDirty, errors },
    setValue,
    watch,
    control,
    setError: setErrors,
    clearErrors,
  } = useForm({
    resolver: yupResolver(formSchema),
    defaultValues: { ...defaultValues },
  });

  let {
    clientName,
    clientCreatedBy,

    contractName,

    contractType,
    paymentTerms,
    clientApEmail,
    clientApName,
    clientInvoicingProcess,
    start_date,
    end_date,
  } = watch();

  const handleNext = () => {
    let newSkipped = skipped;
    if (isStepSkipped(activeStep)) {
      newSkipped = new Set(newSkipped.values());
      newSkipped.delete(activeStep);
    }

    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    setSkipped(newSkipped);
  };

  function handleAddClick() {
    setClientAPList([
      ...clientAPList,
      {
        name: clientApName,
        email: clientApEmail,
      },
    ]);

    setValue("clientApName", "");
    setValue("clientApEmail", "");
  }

  const onDeleteApRow = (position) => {
    const updatedItems = clientAPList.filter((_, index) => index !== position);
    setClientAPList(updatedItems);
  };

  const disableAddAPBtn = () => {
    clientApName = clientApName?.trim();
    clientApEmail = clientApEmail?.trim();

    return !clientApName || !clientApEmail || !isValidEmail(clientApEmail);
  };

  const disableButton = () => {
    if (activeStep === 0) {
      const trimmedClientName = clientName?.trim();
      const trimmedCreatedBy = clientCreatedByVal?.trim();

      return (
        clientNameError ||
        !zip ||
        !trimmedClientName ||
        !trimmedCreatedBy ||
        !selectedCountry ||
        !selectedState ||
        zip.length < 5 ||
        zip.length > 8
      );
    }

    if (activeStep === 1) {
      const trimmedContractName = contractName?.trim();
      const trimmedContractType = contractType?.trim();

      return (
        !trimmedContractName ||
        !trimmedContractType ||
        !start_date ||
        contractNameError ||
        (end_date && new Date(end_date) < new Date(start_date))
      );
    }

    if (activeStep === 2) {
      return false; // Add validations if needed
    }
  };

  const handleFinish = () => {
    // create
    requestCreateClient();
  };

  const onError = (message) => {
    const error = new Error("Add Client - " + message);
    displayError(enqueueSnackbar, error, { anchorOrigin });
  };

  const onClientAddedSuccess = () => {
    enqueueSnackbar(
      translate(isEditMode ? "message.update" : "message.create"),
      { anchorOrigin }
    );
    onClientAdded();
  };
  const isValidClientAPList =
    Array.isArray(clientAPList) && clientAPList.length > 0 ? clientAPList : [];

  async function requestCreateClient() {
    if (isLoading) return;
    if (!hasChanges()) {
      // No changes were made, display a message and return
      onError("No changes made.");
      return;
    }
    setLoading(true);
    const payload = {
      name: clientName,
      // Remove any leading or trailing whitespace from the client address to ensure clean input
      address: clientAddress.trim(),
      start_date: fDateToISOString(start_date),
      end_date: end_date ? fDateToISOString(end_date) : "",
      end_type: contractType,
      status: true,
      contract_name: contractName,
      contract_end_type: contractType,
      contract_version: "1.0",
      contract_created_by: clientCreatedByVal,
      client_created_by: clientCreatedByVal,
      client_payment_terms: paymentTerms,
      client_ap_details: isValidClientAPList,
      country: selectedCountry,
      state: selectedState,
      city: selectedCity,
      business_unit: selectedBusinessUnit || "N/A",
      zip_code: zip,
    };

    try {
      const response = isEditMode
        ? await ClientAPI.UPDATE(axiosPrivate, clientData?.uuid, payload)
        : await ClientAPI.ADD(axiosPrivate, payload);

      if (isValidResponse(response)) {
        const clientId = response.data.uuid;
        requestCreateNDAContract(clientId); // Call the NDA contract creation after client is created
        onClientAddedSuccess();
      } else {
        onError(translate(isEditMode ? "error.update" : "error.create"));
      }
    } catch (error) {
      displayError(enqueueSnackbar, error, { anchorOrigin });
      onError(translate(isEditMode ? "error.update" : "error.create"));
    }
    setLoading(false);
  }

  async function checkForDeletedFiles() {
    deleteFilesFromServer(axiosPrivate, deletedFileUrls, () => {
      onError(translate("error.deleteFail"));
    });
  }
  async function requestCreateNDAContract(clientId) {
    if (isEditMode) {
      checkForDeletedFiles();
    }

    const payload = {
      name: contractName,
      start_date: fDateToISOString(start_date),
      end_date: end_date ? fDateToISOString(end_date) : "",
      end_type: contractType,
      client: clientId,
      status: true,
      payment_terms: paymentTerms || null,
      contract_name: contractName,
      contract_end_type: contractType,
      contract_version: "1.0",
      contract_created_by: clientCreatedByVal,
    };

    const update = {
      name: contractName,
      start_date: fDateToISOString(start_date),
      end_date: end_date ? fDateToISOString(end_date) : "",
      end_type: contractType,
      status: true,
      payment_terms: paymentTerms || null,
      contract_name: contractName,
      contract_end_type: contractType,
      contract_version: "1.0",
      contract_created_by: clientCreatedByVal,
    };

    const formData = new FormData();
    if (
      clientContractFile &&
      clientContractFile.name &&
      selectedFiles.length > 0
    ) {
      formData.append("file", clientContractFile, clientContractFile.name);
    }
    const dataToAppend = isEditMode ? update : payload;
    Object.keys(dataToAppend).forEach((key) => {
      formData.append(key, dataToAppend[key]);
    });

    try {
      const response = isEditMode
        ? await ClientAPI.UPDATE_NDA_CONTRACT(
            axiosPrivate,
            clientData.client_contracts?.[0].uuid,
            formData
          )
        : await ClientAPI.ADD_NDA_CONTRACT(axiosPrivate, formData);

      if (isValidResponse(response)) {
        onClientAddedSuccess();
      } else {
        onError(translate(isEditMode ? "error.update" : "error.create"));
      }
    } catch (error) {
      displayError(enqueueSnackbar, error, { anchorOrigin });
      onError(translate(isEditMode ? "error.update" : "error.create"));
    }
  }

  function getDefaultValue() {
    if (isEditMode) {
      const contract = clientData.client_contracts?.[0] ?? {};
      seHasFileToEdit(contract.files?.length > 0 ?? false);
      setUpLoadedFileUrls(contract.files);

      setClientAPList(clientData.client_ap_details ?? []);
      return {
        clientName: getFieldAsString(clientData.name),
        clientAddress: getFieldAsString(clientData.address),

        contractName: getFieldAsString(contract.name),
        start_date: getFieldAsDate(contract.start_date),
        end_date: getFieldAsDate(contract.end_date),
        contractType: getFieldAsString(contract.end_type),

        paymentTerms: getFieldAsString(
          fCapitalizeFirst(clientData.client_payment_terms)
        ),
        clientInvoicingProcess: getFieldAsString(
          fCapitalizeFirst(clientData.client_invoice_terms)
        ),
        clientCreatedBy: getFieldAsString(clientData.client_created_by),
        clientCity: getFieldAsString(clientData.city),
        zipCode: clientData.zip_code,
        country: clientData.country || country,
        state: clientData.state || region,
      };
    } else {
      return {};
    }
  }

  const handleFileUpload = (filesData) => {
    setUpLoadedFileUrls((prevFiles) => [...prevFiles, ...filesData]);
  };

  function getFieldAsString(fieldValue) {
    return fieldValue ? `${fieldValue}` : "";
  }

  function getFieldAsDate(fieldValue) {
    try {
      return fieldValue ? fDateMDY(fieldValue) : null;
    } catch (error) {
      return null;
    }
  }
  function validateZipCode(zipCode) {
    // Trim the input to remove leading and trailing spaces
    zipCode = zipCode.trim();

    // Check if the input is empty after trimming
    if (!zipCode) {
      return "Please fill the zip code.";
    }

    // Remove all spaces from the input for validation purposes
    const cleanedZipCode = zipCode.replace(/\s+/g, "");

    // Check if the input contains only alphabets (no numbers or special characters allowed)
    if (/^[a-zA-Z]+$/.test(cleanedZipCode)) {
      return "Zip code should be alphanumeric or numeric.";
    }

    // Check if the cleaned input contains only alphanumeric characters (no special characters)
    if (!/^[a-zA-Z0-9]+$/.test(cleanedZipCode)) {
      return "Zip code should be alphanumeric.";
    }

    // Check if the cleaned zip code length is between 5 and 8 characters
    if (cleanedZipCode.length < 5 || cleanedZipCode.length > 8) {
      return "Zip code should be min 5 or max 8 digits (alphanumeric) long.";
    }

    // If all checks pass, return null (valid zip code)
    return null;
  }

  function handleZipChange(val) {
    setZip(val);
    const isValid = validateZipCode(val);
    if (isValid != true) {
      error.zip = isValid;
    } else {
      error.zip = null;
    }
  }

  const handleCountryChange = (event, value) => {
    setSelectedCountry(value?.country_id || "");
    setSelectedState(""); // Reset selected state when country changes
    setSelectedCity(""); // Reset selected city when country changes
  };

  const handleStateChange = (event, value) => {
    setSelectedState(value?.state_id || "");
    setSelectedCity(""); // Reset selected city when state changes
  };

  const handleCityChange = (event, value) => {
    setSelectedCity(value?.city_id || "");
  };
  // Filter states based on the selected country
  const filteredStates = stateData.filter(
    (state) => state.country_id === selectedCountry
  );

  // Filter cities based on the selected state
  const filteredCities = cityData.filter(
    (city) => city.state_id === selectedState
  );

  const [clientNameError, setClientNameError] = useState(""); // Error for Client Name
  const [contractNameError, setContractNameError] = useState(""); // Error for Contract Name
  // To avoid excessive API calls while typing, wrap the API call in a debounced function
  const debouncedCheckName = debounce(async (name, searchType, setError) => {
    try {
      const payload = { name: name.trim(), search_type: searchType };
      const response = await ClientAPI.CHECK_CLIENT_CONTRACT_NAME(
        axiosPrivate,
        payload
      );
      const nameExists = response?.data?.exists;
      console.log("name exists", nameExists);

      if (nameExists) {
        setError(
          translate(
            searchType === "client"
              ? "Client name already exists. Please choose a different name."
              : "Contract name already exists. Please choose a different name."
          )
        );
      } else {
        setError(""); // Clear error if name does not exist
      }
    } catch (error) {
      console.log(`Error in checking ${searchType} name:`, error);
      setError(
        translate(`An error occurred while checking the ${searchType} name.`)
      );
    }
  }, 300);

  return (
    <>
      {isLoading ? (
        <Box sx={styles.loading}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Box height={"100vh"} padding={3}>
            <Box
              sx={{
                fontFamily: "Inter",
                fontSize: "24px",
                fontWeight: "700",
                lineHeight: "29px",
                color: "#102D58",
                height: "50px",
              }}
            >
              <HighlightOffIcon
                onClick={handleClose}
                sx={{ height: "50px", width: "30px", margin: "10px" }}
              />
              <span>{isEditMode ? "Edit" : "Add"} Client</span>
            </Box>
            <Box marginTop={4} sx={{ width: "100%" }}>
              <Stepper activeStep={activeStep}>
                {steps.map((label, index) => {
                  const stepProps = {};
                  const labelProps = {};
                  if (isStepSkipped(index)) {
                    stepProps.completed = false;
                  }
                  return (
                    <Step
                      key={label}
                      {...stepProps}
                      sx={styles.stepperRoot}
                      variant=""
                    >
                      <StepLabel {...labelProps}>{label}</StepLabel>
                    </Step>
                  );
                })}
              </Stepper>
              {activeStep === steps.length ? (
                <React.Fragment>
                  <Typography sx={{ mt: 2, mb: 1 }}>
                    All steps completed - you&apos;re finished
                  </Typography>
                  <Box sx={{ display: "flex", flexDirection: "row", pt: 2 }}>
                    <Box sx={{ flex: "1 1 auto" }} />
                    <Button onClick={handleReset}>Reset</Button>
                  </Box>
                </React.Fragment>
              ) : (
                <React.Fragment>
                  {activeStep === 0 && (
                    <div>
                      <>
                        <Box
                          sx={{
                            display: "flex",
                            gap: "16px",
                            m: 2,
                            width: "95%",
                          }}
                        >
                          {isEditMode ? (
                            <FormControl fullWidth>
                              <InputLabel htmlFor="outlined-adornment-clientname">
                                <MandatoryTextField
                                  label={translate(
                                    "ClientPreviewScreen.CLIENT_NAME"
                                  )}
                                />
                              </InputLabel>
                              <OutlinedInput
                                disabled
                                id="outlined-adornment-clientname"
                                label="Client Name"
                                size="medium"
                                name="clientName"
                                type="text"
                                value={clientName}
                                inputProps={{ maxLength: 25 }}
                                {...register("clientName")}
                                onChange={(e) => {
                                  const newValue = e.target.value.replace(
                                    /[^A-Za-z0-9\s]/g,
                                    ""
                                  );
                                  setValue("clientName", newValue);
                                }}
                              />
                            </FormControl>
                          ) : (
                            <FormControl fullWidth>
                              <InputLabel htmlFor="outlined-adornment-clientname">
                                <MandatoryTextField
                                  label={translate(
                                    "ClientPreviewScreen.CLIENT_NAME"
                                  )}
                                />
                              </InputLabel>
                              <OutlinedInput
                                id="outlined-adornment-clientname"
                                label="Client Name"
                                size="medium"
                                name="clientName"
                                type="text"
                                value={clientName}
                                inputProps={{ maxLength: 25 }}
                                {...register("clientName")}
                                onChange={(e) => {
                                  const newValue = e.target.value.replace(
                                    /[^A-Za-z0-9\s]/g,
                                    ""
                                  );
                                  setValue("clientName", newValue);

                                  if (newValue.trim().length > 0) {
                                    debouncedCheckName(
                                      newValue,
                                      "client",
                                      setClientNameError
                                    );
                                  } else {
                                    setClientNameError("");
                                  }
                                }}
                                error={!!clientNameError}
                              />
                              <Typography
                                variant="caption"
                                color="error"
                                sx={{
                                  marginTop: "4px",
                                  display: clientNameError ? "block" : "none",
                                }}
                              >
                                {clientNameError}
                              </Typography>
                            </FormControl>
                          )}

                          {/* BU start */}
                          <FormControl fullWidth>
                            <InputLabel htmlFor="business-unit-select">
                              {translate("Business Unit")}
                            </InputLabel>
                            <Select
                              labelId="business-unit-select"
                              id="business-unit-select"
                              value={selectedBusinessUnit}
                              onChange={handleBusinessUnitChange}
                              label="Business Unit"
                            >
                              {businessUnits.length > 0 ? (
                                businessUnits.map((unit) => (
                                  <MenuItem key={unit} value={unit}>
                                    {unit}
                                  </MenuItem>
                                ))
                              ) : (
                                <MenuItem value="" disabled>
                                  No Business Units Available
                                </MenuItem>
                              )}
                            </Select>
                          </FormControl>
                          {/* BU end */}
                        </Box>
                        <FormControl
                          fullWidth
                          sx={{ m: 2, borderRadius: "12px", width: "95%" }}
                        >
                          <InputLabel htmlFor="outlined-adornment-clientaddress">
                            Street Address
                          </InputLabel>
                          <OutlinedInput
                            id="outlined-adornment-clientaddress"
                            label="Client Address"
                            size="medium"
                            name="clientAddress"
                            value={clientAddress}
                            inputProps={{ maxLength: 300 }}
                            error={Boolean(error.clientAddress)}
                            onChange={(e) => {
                              const newValue = e.target.value;
                              setClientAddres(newValue);
                            }}
                          />
                          {/* Show the validation error message below the TextField */}
                          {error.clientAddress && (
                            <FormHelperText error>
                              {error.clientAddress}
                            </FormHelperText>
                          )}
                        </FormControl>

                        <Box
                          sx={{
                            display: "flex",
                            gap: "16px",
                            m: 2,
                            width: "95%",
                          }}
                        >
                          {/* Country Search & Selection */}
                          <FormControl fullWidth>
                            <Autocomplete
                              options={countryData}
                              getOptionLabel={(option) =>
                                option.country_name || ""
                              }
                              value={
                                countryData.find(
                                  (country) =>
                                    country.country_id === selectedCountry
                                ) || null
                              }
                              onChange={handleCountryChange}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  label={
                                    <MandatoryTextField
                                      label={translate("Country")}
                                    />
                                  }
                                  placeholder="Search Country"
                                  variant="outlined"
                                />
                              )}
                              isOptionEqualToValue={(option, value) =>
                                option.country_id === value?.country_id
                              }
                            />
                          </FormControl>

                          {/* State  Search & Selection */}
                          <FormControl fullWidth>
                            <Autocomplete
                              options={filteredStates}
                              getOptionLabel={(option) =>
                                option.state_name || ""
                              }
                              value={
                                filteredStates.find(
                                  (state) => state.state_id === selectedState
                                ) || null
                              }
                              onChange={handleStateChange}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  label={
                                    <MandatoryTextField
                                      label={translate("State")}
                                    />
                                  }
                                  placeholder="Search State"
                                  variant="outlined"
                                />
                              )}
                              isOptionEqualToValue={(option, value) =>
                                option.state_id === value?.state_id
                              }
                            />
                          </FormControl>

                          {/* City  Search & Selection */}

                          <FormControl fullWidth>
                            <Autocomplete
                              options={filteredCities}
                              getOptionLabel={(option) =>
                                option.city_name || ""
                              }
                              value={
                                filteredCities.find(
                                  (city) => city.city_id === selectedCity
                                ) || null
                              }
                              onChange={handleCityChange}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  label={translate("City")}
                                  placeholder="Search City"
                                  variant="outlined"
                                />
                              )}
                              isOptionEqualToValue={(option, value) =>
                                option.city_id === value?.city_id
                              }
                              noOptionsText="Not Available"
                            />
                          </FormControl>
                        </Box>
                        <Box
                          sx={{
                            display: "flex",
                            gap: "12px",
                            margin: "25px",
                            width: "96%",
                            marginLeft: "16px",
                          }}
                        >
                          <FormControl fullWidth>
                            <InputLabel htmlFor="outlined-adornment-zipcode">
                              <MandatoryTextField
                                label={translate("Zip Code")}
                              />
                            </InputLabel>
                            <OutlinedInput
                              classes="MuiSelect-root MuiSelect-select MuiSelect-outlined MuiInputBase-input MuiOutlinedInput-input"
                              id="outlined-adornment-zipcode"
                              label="Zip Code"
                              size="medium"
                              name="zipCode"
                              value={zip}
                              error={Boolean(error.zip)}
                              helperText={error.zip}
                              onChange={(e) => handleZipChange(e.target.value)}
                            />
                            <FormHelperText sx={{ color: "red" }}>
                              {error?.zip}
                            </FormHelperText>
                          </FormControl>

                          <FormControl fullWidth>
                            <InputLabel htmlFor="outlined-adornment-clientCreatedBy">
                              <MandatoryTextField
                                label={translate(
                                  "ClientPreviewScreen.CLIENT_CREATED_BY"
                                )}
                              />
                            </InputLabel>
                            <OutlinedInput
                              id="outlined-adornment-clientCreatedby"
                              label="Client Created By"
                              name="clientCreatedBy"
                              value={
                                isEditMode
                                  ? clientCreatedBy
                                  : clientCreatedByVal
                              }
                              inputProps={{ maxLength: 50 }}
                              {...register("clientCreatedBy")}
                              disabled
                            />
                          </FormControl>
                          <Typography color="error" variant="error">
                            {errors?.clientCreatedBy?.message}
                          </Typography>
                        </Box>
                      </>
                    </div>
                  )}

                  {activeStep === 1 && (
                    <div>
                      <Stack
                        direction={"row"}
                        spacing={3}
                        justifyContent={"stretch"}
                        paddingTop={5}
                      >
                        <Stack direction={"column"} sx={{ width: "100%" }}>
                          <FormControl fullWidth>
                            <InputLabel htmlFor="outlined-adornment-contractname">
                              <MandatoryTextField
                                label={translate(
                                  "ClientPreviewScreen.CONTRACT_NAME"
                                )}
                              />
                            </InputLabel>
                            <OutlinedInput
                              id="outlined-adornment-contractname"
                              label="Contract Name"
                              size="medium"
                              type="text"
                              name="contractName"
                              inputProps={{ maxLength: 25 }}
                              {...register("contractName")}
                              onChange={(e) => {
                                const newValue = e.target.value.replace(
                                  /[^A-Za-z0-9\s]/g,
                                  ""
                                );
                                setValue("contractName", newValue);

                                if (newValue.trim().length > 0) {
                                  debouncedCheckName(
                                    newValue,
                                    "contract",
                                    setContractNameError
                                  );
                                } else {
                                  setContractNameError("");
                                }
                              }}
                              error={!!contractNameError}
                            />
                            <Typography
                              variant="caption"
                              color="error"
                              sx={{
                                marginTop: "4px",
                                display: contractNameError ? "block" : "none",
                              }}
                            >
                              {contractNameError}
                            </Typography>
                          </FormControl>
                        </Stack>
                        <Stack direction={"column"} sx={{ width: "100%" }}>
                          <FormControl>
                            <InputLabel id="demo-simple-select-label">
                              <MandatoryTextField
                                label={translate(
                                  "ClientPreviewScreen.CONTRACT_TYPE"
                                )}
                              />
                            </InputLabel>

                            {/* <OutlinedInput
                        placeholder="MSA/PSA/NDA"
                        label={
                          <MandatoryTextField
                            label={translate(
                              "ClientPreviewScreen.CONTRACT_TYPE"
                            )}
                          />
                        }
                        name="contractType"
                        value={contractType}
                        {...register("contractType")}
                      /> */}

                            <Select
                              labelId="demo-simple-select-label"
                              id="demo-simple-select"
                              value={contractType}
                              label="ContractType"
                              name="contractType"
                              {...register("contractType")}
                            >
                              <MenuItem value={"MSA"}>MSA</MenuItem>
                              <MenuItem value={"PSA"}>PSA</MenuItem>
                              <MenuItem value={"NDA"}>NDA</MenuItem>
                            </Select>
                          </FormControl>
                          <Typography color="error" variant="error">
                            {errors?.contractType?.message}
                          </Typography>
                        </Stack>
                      </Stack>
                      <Stack
                        direction={"row"}
                        spacing={3}
                        justifyContent={"stretch"}
                        paddingTop={5}
                        paddingBottom={5}
                      >
                        <Box sx={{ flexGrow: 1 }}>
                          <ControlledDatePicker
                            label={
                              <Box>
                                <MandatoryTextField
                                  label={translate(
                                    "ClientPreviewScreen.CONTRACT_START_DATE"
                                  )}
                                />
                              </Box>
                            }
                            name="start_date"
                            control={control}
                            disablePast={
                              process.env?.APP_ENABLED_PAST_DATES || false
                            }
                            sx={{ width: "100%" }}
                            disableWeekends={isWeekend}
                          />
                        </Box>
                        <Box sx={{ flexGrow: 1 }}>
                          <ControlledDatePicker
                            disabled={!start_date}
                            label={translate(
                              "ClientPreviewScreen.CONTRACT_END_DATE"
                            )}
                            name="end_date"
                            control={control}
                            sx={{ width: "100%" }}
                            minDate={start_date}
                            disableWeekends={isWeekend}
                            error={!!errors.end_date}
                            helperText={errors.end_date?.message}
                            onChange={(value) => {
                              if (
                                value &&
                                new Date(value) < new Date(start_date)
                              ) {
                                setValue("end_date", value, {
                                  shouldValidate: true,
                                });
                                setErrors("end_date", {
                                  type: "manual",
                                  message:
                                    "End date cannot be earlier than the start date",
                                });
                              } else {
                                setValue("end_date", value, {
                                  shouldValidate: true,
                                });
                                clearErrors("end_date");
                              }
                            }}
                          />
                        </Box>
                      </Stack>
                      {upLoadedFileUrls?.length > 0 ? (
                        <PreviewContractFile
                          isEditMode={true}
                          filesData={upLoadedFileUrls}
                          deletedFilesData={deletedFileUrls}
                          onFilesDeleted={(deletedFilesData, filesData) => {
                            setDeletedFileUrls(deletedFilesData);
                            setUpLoadedFileUrls(filesData);
                          }}
                        />
                      ) : (
                        <UploadContractFile
                          onFileUploaded={(files) => {
                            handleFileUpload(files);
                          }}
                          setClientContractFile={setClientContractFile}
                          selectedFiles={selectedFiles}
                          setSelectedFiles={setSelectedFiles}
                          onFileDeleted={onReset}
                        />
                      )}
                    </div>
                  )}
                  {activeStep === 2 && (
                    <div>
                      <Box sx={styles.apContainer}>
                        <TextField
                          sx={{
                            width: "44.5%",
                            marginTop: "10px",
                            marginBottom: "10px",
                          }}
                          id="outlined-select-currency"
                          select
                          label={translate(
                            "ClientPreviewScreen.CLIENT_PAYMENT_TERMS"
                          )}
                          value={paymentTerms}
                          name="paymentTerms"
                          {...register("paymentTerms")}
                        >
                          {paymentTermsOptions.map((option) => (
                            <MenuItem key={option} value={option}>
                              {option}
                            </MenuItem>
                          ))}
                        </TextField>

                        {/* <Typography color="error" variant="error">
                    {errors?.paymentTerms?.message}
                  </Typography>
                  <TextField
                    fullWidth
                    id="outlined-select-currency"
                    select
                    value={clientInvoicingProcess}
                    label={
                      <Box>
                        <MandatoryTextField
                          label={translate(
                            "ClientPreviewScreen.CLIENT_INVOICE_PROCESS"
                          )}
                        />
                      </Box>
                    }
                    name="clientInvoicingProcess"
                    {...register("clientInvoicingProcess")}
                  >
                    {invoicingProcessOptions.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </TextField>
                  <Typography color="error" variant="error">
                    {errors?.clientInvoicingProcess?.message}
                  </Typography> */}
                      </Box>
                      <Box
                        sx={{
                          margin: "15px",
                          fontFamily: "Inter",
                          fontSize: "20px",
                          fontWeight: "700",
                          lineHeight: "29px",
                          color: "#102D58",
                          height: "50px",
                        }}
                      >
                        <span>Client Contacts:</span>
                      </Box>
                      <Box sx={styles.apContainer}>
                        <TextField
                          fullWidth
                          label={translate("ClientPreviewScreen.NAME")}
                          value={clientApName}
                          name="clientApName"
                          inputProps={{ maxLength: 25 }}
                          error={errors?.clientApName}
                          {...register("clientApName")}
                          onChange={(e) => {
                            const newValue = e.target.value.replace(
                              /[^A-Za-z0-9\s]/g,
                              ""
                            );
                            setValue("clientApName", newValue);
                          }}
                        />
                        <TextField
                          fullWidth
                          label={translate("ClientPreviewScreen.EMAIL")}
                          value={clientApEmail}
                          inputProps={{ maxLength: 30 }}
                          name="clientApEmail"
                          error={Boolean(error.email)}
                          helperText={error.email}
                          onChange={handleEmailChange}
                          InputProps={{
                            classes: {
                              root: error.email ? styles.error : "",
                            },
                          }}
                        />

                        <Button
                          sx={{
                            height: "40px",
                            color: "black",
                          }}
                          variant="contained"
                          onClick={handleAddClick}
                          disabled={disableAddAPBtn()}
                          color="secondary"
                        >
                          ADD
                        </Button>
                      </Box>

                      <TableDataComponent
                        data={clientAPList}
                        isEditMode={true}
                        onDeleteRow={onDeleteApRow}
                      />
                    </div>
                  )}

                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "row",
                      float: "right",
                      pt: 2,
                    }}
                  >
                    <Box
                      sx={{
                        mt: 2,
                        display: "flex",
                        justifyContent: "flex-end",
                      }}
                    >
                      {activeStep !== 0 && (
                        <Button
                          onClick={handleBack}
                          variant="outlined"
                          sx={{ mr: 1 }}
                        >
                          Back
                        </Button>
                      )}

                      <Button
                        variant="contained"
                        style={{ color: "black" }}
                        // onClick={handleNext}
                        onClick={
                          activeStep === steps.length - 1
                            ? handleFinish
                            : handleNext
                        }
                        type="submit"
                        disabled={
                          activeStep === steps.length - 1 && isEditMode
                            ? disableButton() || !hasChanges()
                            : disableButton()
                        }
                      >
                        {activeStep === steps.length - 1
                          ? isEditMode
                            ? "Update Client"
                            : "Create Client"
                          : "Next"}
                      </Button>
                    </Box>
                  </Box>
                </React.Fragment>
              )}
            </Box>
          </Box>
        </>
      )}
    </>
  );
}

export const paymentTermsOptions = [
  "Net 15",
  "Net 30",
  "Net 45",
  "Net 60",
  "Net 90",
  "Due on receipt",
];
export const invoicingProcessOptions = [
  "Potential Lead",
  "Onboarded",
  "Active",
  "InActive",
];
