import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  TextField,
  Button,
  MenuItem,
  Typography,
  Stack,
  Autocomplete,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  Paper,
  TableBody,
  InputAdornment,
} from "@mui/material";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import useLocales from "../../../hooks/useLocales";
import { createStyles, useTheme } from "@mui/styles";
import useClient from "../../../hooks/useClient";
import useAxiosPrivate, {
  isValidResponse,
} from "../../../hooks/useAxiosPrivate";
import ContractAPI from "../../../services/ContractService";
import { useSnackbar } from "notistack";
import { displayError } from "../../../utils/handleErrors";
import { fCurrency, fPercent } from "../../../utils/formatNumber";
import MandatoryTextField from "../../../pages/MandatoryTextField";
import { TableRowWithDelete } from "../../../components/table";
import PurchaseOrderAPI from "../../../services/PurchaseOrderService";
import { anchorOrigin } from "../../../utils/constants";

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

  subText: {
    color: theme.palette.text.main,
    fontFamily: "Inter",
    fontSize: "13px",
    fontStyle: "normal",
    fontWeight: 500,
    lineHeight: "normal",
  },

  subTextValue: {
    color: theme.palette.text.primary,
  },
}));

function AssignContractModal({
  handleClose,
  onPurchaseOrderAdded,
  purchaseOrderData,
}) {
  const isEditMode = purchaseOrderData ? true : false;

  const { translate } = useLocales();

  const { selectedClient } = useClient();
  const axiosPrivate = useAxiosPrivate();
  const [contractDataList, setContractDataList] = useState([]);
  const [selectedContract, setSelectedContract] = useState({});

  const [poList, setPOList] = useState([]);
  const [selectedPOs, setSelectedPos] = useState([]);
  const [focusedInput, setFocusedInput] = useState(null);
  const inputRefs = useRef({});
  const [isDropdownClicked, setIsDropdownClicked] = useState(false);
  const handleDropdownOpen = () => {
    if (!isDropdownClicked) {
      setIsDropdownClicked(true);
    }
  };

  const { enqueueSnackbar } = useSnackbar();
  const [isContractSelected, setIsContractSelected] = useState(false);
  const theme = useTheme();
  const styles = useStyles(theme);
  const [amountExceed, setAmountExceeds] = useState(false);
  const [lessAssignAmount, setLessAssignAMount] = useState(false);
  const [formObject, setFormObject] = useState(getDefaultFormData());
  const [totalAssignAmount, setTotalAssignAmount] = useState("");
  const handleContractChange = (event) => {
    const newValue = event?.target?.value;
    setSelectedContract(newValue);
    setIsContractSelected(Boolean(newValue));
  };
  const [errormessages, setErrorMessages] = useState({});
  const handleAssignAmountChange = (index, value) => {
    const updatedSelectedPOs = selectedPOs.map((po, i) => {
      if (i === index) {
        return {
          ...po,
          utilized_amount: value,
        };
      }
      return po;
    });
    const totalAssignAmount = updatedSelectedPOs.reduce((total, po) => {
      return total + parseFloat(po.utilized_amount);
    }, 0);
    if (totalAssignAmount.toString() === "NaN") {
      setAmountExceeds(false);
    }
    const checkAmount = checktotalAssignAmount(totalAssignAmount.toString());
    setAmountExceeds(checkAmount);
    const exceedsRemaining =
      parseFloat(value || 0) >
      parseFloat(selectedPOs[index].remaining_amount || 0);

    if (exceedsRemaining) {
      setErrorMessages((prevErrors) => ({
        ...prevErrors,
        [index]: "The assigned amount exceeds the Po available amount.",
      }));
    } else {
      setErrorMessages((prevErrors) => {
        const updatedErrors = { ...prevErrors };
        delete updatedErrors[index];
        return updatedErrors;
      });
    }

    setTotalAssignAmount(totalAssignAmount.toString());
    setSelectedPos(updatedSelectedPOs);
  };

  const checktotalAssignAmount = (amount) => {
    let amountFloat = parseFloat(amount);
    let totalContractAmountFloat = parseFloat(
      selectedContract?.total_contract_amount
    );
    if (amountFloat === totalContractAmountFloat) {
      setLessAssignAMount(false);
      setAmountExceeds(false);
      return false;
    }
    if (amountFloat < totalContractAmountFloat) {
      setLessAssignAMount(true);
      setAmountExceeds(false);
    }
    if (amountFloat > totalContractAmountFloat) {
      setAmountExceeds(true);
      return true;
    }
    if (amountFloat === 0) {
      setLessAssignAMount(true);
    }
  };

  const handleFocus = (id) => {
    setFocusedInput(id);
  };

  useEffect(() => {
    const totalAmount = selectedPOs.reduce((total, po) => {
      return total + parseFloat(po.utilized_amount);
    }, 0);
    setTotalAssignAmount(totalAmount.toString());
    if (selectedPOs.length === 0) {
      setAmountExceeds(false);
    }
  }, [selectedPOs]);

  useEffect(() => {
    // Focus on the input field after updating the state
    if (focusedInput !== null && inputRefs.current[focusedInput]) {
      inputRefs.current[focusedInput].focus();
    }
  }, [selectedPOs]);

  const handleCloseModal = () => {
    handleClose();
  };
  const onError = (message) => {
    enqueueSnackbar("PO - " + message, {
      anchorOrigin,
      variant: "error",
    });
  };
  useEffect(() => {
    fetchContracts();
    fetchPOs();
  }, []);

  function getDefaultFormData() {
    return {
      purchaseOrderName: purchaseOrderData?.purchase_order_name ?? "",
      accountNumber: purchaseOrderData?.account_number ?? "",
      amountUtilized: purchaseOrderData?.amount_utilized ?? "",
      poAmount: purchaseOrderData?.po_amount ?? "",
      client: purchaseOrderData?.client ?? "",
      contractsowId: purchaseOrderData?.contract_sow_id ?? "",
    };
  }

  function callOnError() {
    onError(translate(isEditMode ? "error.update" : "error.create"));
  }

  const onAddedSuccess = () => {
    enqueueSnackbar(
      translate(isEditMode ? "message.update" : "message.create"),
      { anchorOrigin }
    );
    onPurchaseOrderAdded();
  };

  async function fetchContracts() {
    if (selectedClient.uuid) {
      try {
        const response = await PurchaseOrderAPI.GET_AVAILABLE_CONTRACT(
          axiosPrivate,
          selectedClient.uuid
        );

        if (isValidResponse(response)) {
          setContractDataList(response?.data?.result);
        } else {
          onError("Invalid response from Contract List API");
        }
      } catch (error) {
        console.error("Error in fetchContracts:", error);
        onError(translate("error.fetch"));
      }
    }
  }

  async function fetchPOs() {
    if (selectedClient.uuid) {
      try {
        const response = await PurchaseOrderAPI.GET_AVAILABLE_PO(
          axiosPrivate,
          selectedClient.uuid
        );

        if (isValidResponse(response)) {
          setPOList(response?.data?.result);
        } else {
          onError("Invalid response from PO List API");
        }
      } catch (error) {
        console.error("Error in fetchContracts:", error);
        onError(translate("error.fetch"));
      }
    }
  }
  async function requestAddAssignPurchaseOrder(payload) {
    try {
      const response = isEditMode
        ? await PurchaseOrderAPI.UPDATE(axiosPrivate)
        : await PurchaseOrderAPI.ADD_ASSIGN_PO(axiosPrivate, payload);
      if (isValidResponse(response)) {
        onAddedSuccess();
      } else {
        callOnError();
      }
    } catch (error) {
      console.log("Error in requestAddAssignPurchaseOrder ", error);
    }
  }

  const handleSubmit = async () => {
    if (selectedClient.uuid && selectedContract.uuid) {
      try {
        const totalUtilizedAmount = selectedPOs.reduce(
          (total, po) => total + (parseFloat(po.utilized_amount) || 0),
          0
        );
        const postData = {
          total_amount: totalUtilizedAmount.toString(),
          purchase_order: selectedPOs.map((po) => ({
            id: po.id,
            utilized_amount: po.utilized_amount,
          })),
          sow_contract: selectedContract.uuid,
        };

        if (!postData.sow_contract) {
          console.error("Contract SOW UUID is missing in the API request.");
          return;
        }

        requestAddAssignPurchaseOrder(postData);
        handleCloseModal();
        onPurchaseOrderAdded();
      } catch (error) {
        console.error("Error:", error);
      }
    }
  };

  function isCreateDisabled() {
    return (
      !selectedContract ||
      selectedPOs.length === 0 ||
      selectedPOs.some((po) => !po.utilized_amount)
    );
  }

  const POTable = ({ columns, rows }) => {
    return (
      <TableContainer
        component={Paper}
        sx={{
          minHeight: 200,
          paddingLeft: 1,
          paddingRight: 1,
          marginTop: 1,
        }}
      >
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              {columns?.map((column) => (
                <TableCell key={column.id} align={column.align}>
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows?.map((row, index) => {
              return (
                <TableRow hover key={index}>
                  {columns?.map((column) => {
                    return (
                      <TableCell
                        display="flex"
                        flexDirection="column"
                        key={column.id}
                        align={column.align}
                      >
                        {column.id === "assignAmount" ? (
                          <TextField
                            sx={{ width: "300px" }}
                            key={index}
                            type="number"
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  $
                                </InputAdornment>
                              ),
                            }}
                            error={
                              !!errormessages[index] ||
                              amountExceed ||
                              lessAssignAmount
                            }
                            helperText={
                              errormessages[index] ||
                              (amountExceed
                                ? translate(
                                    "The assigned amount exceeds the contract amount."
                                  )
                                : lessAssignAmount
                                ? translate(
                                    "The assigned amount is less than the contract amount."
                                  )
                                : "")
                            }
                            onChange={(e) => {
                              const value = e?.target?.value;
                              handleAssignAmountChange(index, value);
                              setFocusedInput(index); // Update focused input
                            }}
                            value={row.utilized_amount ?? 0}
                            inputRef={(input) =>
                              (inputRefs.current[index] = input)
                            }
                            onFocus={() => handleFocus(index)}
                          />
                        ) : (
                          <Typography>{column.format(row)}</Typography>
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  return (
    <>
      <Box sx={styles.header}>
        <HighlightOffIcon onClick={handleClose} sx={styles.closeButton} />
        <span>
          {translate(
            isEditMode
              ? "PurchaseOrder.EDIT_PURCHASE_ORDER"
              : "PurchaseOrder.ASSIGN_PURCHASE_ORDER"
          )}
        </span>
      </Box>

      <Box>
        <Box sx={styles.formContainer}>
          <TextField
            select
            fullWidth
            error={isDropdownClicked && contractDataList?.length === 0}
            helperText={
              isDropdownClicked && contractDataList?.length === 0
                ? translate("No contracts available")
                : ""
            }
            label={
              <MandatoryTextField
                label={translate("CONTRACTS.CONTRACT_NAME")}
              />
            }
            onChange={handleContractChange}
            SelectProps={{
              onOpen: handleDropdownOpen,
            }}
            value={selectedContract}
          >
            {contractDataList?.map((item) => {
              return (
                <MenuItem key={item.uuid} value={item}>
                  {item.contractsow_name}
                </MenuItem>
              );
            })}
          </TextField>

          <Autocomplete
            disabled={!isContractSelected}
            fullWidth
            multiple
            options={poList}
            getOptionLabel={(option) => option?.purchase_order_name ?? ""}
            onChange={(e, selectedOptions) => {
              setSelectedPos(selectedOptions);
            }}
            filterSelectedOptions
            renderInput={(params) => (
              <TextField
                disabled={!isContractSelected}
                {...params}
                fullWidth
                label={
                  <MandatoryTextField
                    label={translate("PurchaseOrder.PO_NAME")}
                  />
                }
              />
            )}
          />
        </Box>
      </Box>

      <Stack direction={"row"} margin={3} justifyContent={"space-between"}>
        <Typography sx={styles.subText}>
          {translate("CONTRACTS.TOTAL_CONTRACT_AMOUNT")}
          {" : "}
          <span style={{ ...styles.subText, ...styles.subTextValue }}>
            {fCurrency(selectedContract?.total_contract_amount)}
          </span>
        </Typography>
        <Typography sx={styles.subText}>
          {translate("CONTRACTS.TOTAL_ASSIGN_AMOUNT")}
          {" : "}
          <span style={{ ...styles.subText, ...styles.subTextValue }}>
            {fCurrency(totalAssignAmount)}
          </span>
        </Typography>
      </Stack>

      <POTable columns={poColumns(translate)} rows={selectedPOs} />

      <Button
        sx={styles.button}
        variant="contained"
        onClick={handleSubmit}
        disabled={
          isCreateDisabled() ||
          lessAssignAmount ||
          amountExceed ||
          contractDataList?.length === 0 ||
          Object.keys(errormessages).length > 0
        }
      >
        {translate(
          isEditMode
            ? "PurchaseOrder.UPDATE_PURCHASE_ORDER"
            : "PurchaseOrder.ASSIGN_PURCHASE_ORDER"
        )}
      </Button>
    </>
  );
}
export default AssignContractModal;

const poColumns = (translate) => [
  {
    id: "name",
    label: translate("PurchaseOrder.PO_NAME"),
    align: "center",
    format: (item) => {
      return item?.purchase_order_name ?? "--";
    },
  },
  {
    id: "amount",
    label: translate("PurchaseOrder.TOTAL_PO_AMOUNT"),
    align: "center",
    format: (item) => {
      return fCurrency(item?.po_amount ?? 0);
    },
  },
  {
    id: "availableAmount",
    label: translate("PurchaseOrder.PO_AVAILABLE_AMOUNT"),
    align: "center",
    format: (item) => {
      return fCurrency(item?.remaining_amount);
    },
  },
  {
    id: "assignAmount",
    label: (
      <MandatoryTextField label={translate("PurchaseOrder.ASSIGN_AMOUNT")} />
    ),
    align: "center",
    format: (item) => {
      return "--";
    },
  },
];
