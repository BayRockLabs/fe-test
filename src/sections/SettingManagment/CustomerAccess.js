import {
  Autocomplete,
  Box,
  Button,
  Chip,
  Grid,
  TextField,
} from "@mui/material";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import palette from "../../theme/palette";
import MandatoryTextField from "../../pages/MandatoryTextField";
import useLocales from "../../hooks/useLocales";
import { useState } from "react";
import CustomerAPI from "../../services/CustomerService";
import { displayError } from "../../utils/handleErrors";
import { axiosPrivate } from "../../services/axios";
import { useSnackbar } from "notistack";
import { anchorOrigin } from "../../utils/constants";

const AddCustomerAccess = ({ detailData, handleClose, onCustomerAdded }) => {
  const isEditMode = detailData ? true : false;
  console.log("detail data", detailData, isEditMode);

  const { translate } = useLocales();
  const { enqueueSnackbar } = useSnackbar();
  const [customerName, setCustomerName] = useState(detailData?.customer_name);
  const [customerEmail, setCustomerEmail] = useState(
    detailData?.customer_email
  );
  const [associatedClients, setAssociatedClients] = useState(
    detailData?.associated_clients?.length ? detailData?.associated_clients : []
  );
  const [emailError, setEmailError] = useState(false);
  const [isFormChanged, setIsFormChanged] = useState(false);
  const activeClients = [
    { client_id: 101, client_name: "Acme Inc." },
    { client_id: 102, client_name: "Global Tech Solutions" },
    { client_id: 103, client_name: "NextGen Innovations" },
  ];
  const onCstomerAddedSuccess = () => {
    enqueueSnackbar(
      translate(isEditMode ? "message.update" : "message.create"),
      { anchorOrigin }
    );
    onCustomerAdded();
  };
  async function requestAddCustomer(payload) {
    try {
      const response = isEditMode
        ? await CustomerAPI.UPDATE(axiosPrivate, detailData.client_id, payload)
        : await CustomerAPI.ADD(axiosPrivate, payload);
      onCstomerAddedSuccess();
    } catch (error) {
      console.log("Error in requestAddPricing ", error);
      displayError(enqueueSnackbar, error, { anchorOrigin });
    }
  }
  const handleCreateCustomer = async () => {
    const payload = {
      customer_name: customerName,
      customer_email: customerEmail,
      associated_clients: [
        {
          client_id: associatedClients.client_id,
          client_name: associatedClients.client_name,
        },
      ],
    };

    console.log("Payload:", payload);
    requestAddCustomer(payload);
    // Add your API call here
  };
  const validateEmail = (email) => {
    // Simple email validation regex
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email);
  };
  const handleCustomerNameChange = (e) => {
    setCustomerName(e.target.value);
    setIsFormChanged(true);
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setCustomerEmail(value);
    setEmailError(!validateEmail(value));
    setIsFormChanged(true);
  };
  const isFormValid =
    customerName?.trim() &&
    customerEmail?.trim() &&
    !emailError &&
    associatedClients &&
    (!isEditMode || isFormChanged);
  return (
    <>
      <Box
        sx={{
          margin: "15px",
          fontFamily: "Inter",
          fontSize: "24px",
          fontWeight: "700",
          lineHeight: "29px",
          color: palette.dark.common.black,
          height: "50px",
        }}
      >
        <HighlightOffIcon
          onClick={handleClose}
          sx={{ height: "50px", width: "30px", margin: "10px" }}
        />
        <span>
          {translate(isEditMode ? "CustomerAccess.Edit" : "CustomerAccess.Add")}
        </span>
      </Box>
      <Grid container spacing={2} sx={{ p: 2 }}>
        {/* Customer Name */}
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label={
              <MandatoryTextField label={translate("CustomerAccess.name")} />
            }
            value={customerName}
            inputProps={{ maxLength: 25 }}
            onChange={handleCustomerNameChange}
          />
        </Grid>

        {/* Customer Email */}
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label={
              <MandatoryTextField label={translate("CustomerAccess.email")} />
            }
            value={customerEmail}
            error={emailError}
            helperText={emailError ? "Invalid email format" : ""}
            inputProps={{ maxLength: 50 }}
            onChange={handleEmailChange}
          />
        </Grid>

        {/* Associated Clients Multi-Select */}
        <Grid item xs={12} sm={6}>
          <Autocomplete
            multiple
            options={activeClients}
            getOptionLabel={(option) => option.client_name}
            value={associatedClients}
            onChange={(event, newValue) => {
              setAssociatedClients(newValue);
              setIsFormChanged(true);
            }}
            isOptionEqualToValue={(option, value) =>
              option.client_id === value.client_id
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label={
                  <MandatoryTextField
                    label={translate("CustomerAccess.associate_clients")}
                  />
                }
                placeholder="Enter Client's Name"
                variant="outlined"
              />
            )}
            renderTags={(selected, getTagProps) =>
              selected.map((option, index) => (
                <Chip
                  key={option.client_id}
                  label={option.client_name}
                  {...getTagProps({ index })}
                />
              ))
            }
          />
        </Grid>
      </Grid>
      <Button
        sx={{
          float: "right",
          m: 6,
        }}
        variant="contained"
        disabled={!isFormValid}
        onClick={handleCreateCustomer}
      >
        {isEditMode
          ? translate("CustomerAccess.update")
          : translate("CustomerAccess.create")}
      </Button>
    </>
  );
};
export default AddCustomerAccess;
