import {
  Autocomplete,
  Box,
  Button,
  FormControl,
  FormHelperText,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import MandatoryTextField from "../../pages/MandatoryTextField";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import useLocales from "../../hooks/useLocales";
import { createStyles, useTheme } from "@mui/styles";
import useClient from "../../hooks/useClient";
import AllocationAPI from "../../services/AllocationService";
import { useEffect, useState } from "react";
import useAxiosPrivate, { isValidResponse } from "../../hooks/useAxiosPrivate";
import AllocationResourceTable from "./AllocationResourceTable";
import { useSnackbar } from "notistack";
import { anchorOrigin } from "../../utils/constants";
import { useNavigate } from "react-router-dom";
import { PATH_PAGE } from "../../routes/paths";
import axios from "axios";
import TimeSheetAPI from "../../services/TimeSheetService";

function AllocationForm({
  handleClose,
  onAllocationAdded,
  allocationData,
  preSelectedResourceData,
  oldResData,
}) {
  const isEditMode = allocationData ? true : false;
  const [contractDataList, setContractDataList] = useState([]);
  const [selectedContract, setSelectedContract] = useState({});
  const [selectedEstimation, setSelectedEstimation] = useState({});
  const [resourceData, setResourceData] = useState([]);
  const [allocationName, setAllocationName] = useState("");
  const [selectedResources, setSelectedResources] = useState([]); // Array to store selected resources
  const [loading, setLoading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const [allocationExists, setAllocationExists] = useState(false); // State to store if allocation exists
  const [errorMessage, setErrorMessage] = useState(""); // State
  const [allocationRedirectionId, setAllocationRedirectionId] = useState("");
  const [allocationResCount, setAllocationResCount] = useState(0);
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [effDatesMapping, setEffDatesMapping] = useState([]);
  const [approvers, setApprovers] = useState([]);
  const [selectedApprovers, setSelectedApprovers] = useState([]);
  const [approverErrorMessage, setApproverErrorMessage] = useState("");
  useEffect(() => {
    const checkApproverSelection = () => {
      if (
        selectedApprovers.length === 1 &&
        selectedResources.some(
          (resource) =>
            resource.resource_id === selectedApprovers[0].approver_id
        )
      ) {
        setApproverErrorMessage(
          "You must select at least one approver other than the selected resource."
        );
      } else if (selectedApprovers.length > 1) {
        setApproverErrorMessage("");
      } else {
        setApproverErrorMessage("");
      }
    };

    checkApproverSelection();
  }, [selectedApprovers, selectedResources]);
  const handleInputChange = (event) => {
    const value = event.target.value;
    let validationError = "";
    
    // Check for special characters or leading/trailing spaces
    if (/[^a-zA-Z0-9\s]/.test(value)) {
      validationError = "Special characters are not allowed.";
    } else if (/^\s|\s$/.test(value)) {
      validationError = "Leading and trailing spaces are not allowed.";
    }    
    setError(validationError);
    setAllocationName(value); // Allow leading and trailing spaces
  };

  const { translate } = useLocales();
  const theme = useTheme();
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
  const styles = useStyles(theme);
  const { selectedClient } = useClient();
  const axiosPrivate = useAxiosPrivate();
  useEffect(() => {
    const fetchApprovers = async () => {
      if (selectedClient?.uuid) {
        try {
          const payload = {
            client_id: selectedClient.uuid,
          };
          const response = await TimeSheetAPI.TIMESHEET_APPROVER_SEARCH(
            axiosPrivate,
            payload
          );
          setApprovers(response.data);
        } catch (error) {
          console.error("Error fetching approvers:", error);
        }
      }
    };

    fetchApprovers();
  }, [selectedClient?.uuid]);

  useEffect(() => {
    fetchSOWContracts();
  }, []);

  useEffect(() => {
    if (isEditMode) {
      setAllocationName(allocationData.name);
      setSelectedApprovers(
        allocationData.approver?.length ? allocationData.approver : []
      );
      const initialContract = contractDataList.find(
        (contract) => contract.uuid === allocationData.contract_sow
      );
      console.log(initialContract);
      if (initialContract) {
        setSelectedContract(initialContract);
        console.log(contractDataList);
        fetchResData(initialContract.uuid, initialContract.estimation_uuid);
        setSelectedEstimation(initialContract.estimation_uuid);
      }
    }
  }, [allocationData, contractDataList]);

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

  const onSucces = (message) => {
    enqueueSnackbar(
      translate(isEditMode ? "message.update" : "message.create"),
      { anchorOrigin }
    );
    if (!isEditMode) {
      onAllocationAdded();
    }
  };

  async function fetchResData(contractUuid, estimationUuid) {
    if (selectedClient.uuid && contractUuid && estimationUuid) {
      try {
        const response = await AllocationAPI.GET_RES(
          axiosPrivate,
          contractUuid,
          estimationUuid
        );

        if (isValidResponse(response)) {
          const resourceData = response.data.resource; // Assuming this is an array of objects
          const expandedResources = [];
          resourceData.forEach((singleEntryData) => {
            for (let i = 0; i < singleEntryData.num_of_resources; i++) {
              expandedResources.push({ ...singleEntryData }); // Add a copy of the entry to expandedResources
            }
          });
          setResourceData(expandedResources);
        }
      } catch (error) {
        console.log("Error in fetchResData: ", error);
      } finally {
        setLoading(false);
      }
    }
  }

  useEffect(() => {
    if (selectedContract && selectedEstimation) {
      fetchResData(selectedContract.uuid, selectedEstimation.estimation_uuid);
    }
  }, [selectedContract, selectedEstimation]);

  function updatePayloadData(payloadResData, oldResDataArr) {
    for (let i = 0; i < payloadResData.length; i++) {
      const payloadResourceId = payloadResData[i].resource_id;

      const matchingOldResource = oldResDataArr.find(
        (item) => item.resource_id === payloadResourceId
      );

      if (matchingOldResource) {
        payloadResData[i] = {
          ...payloadResData[i],
          ...matchingOldResource,
          change_effective_from:
            payloadResData[i].change_effective_from ||
            matchingOldResource.change_effective_from,
        };
      }
    }

    return payloadResData;
  }

  const handleSubmit = async () => {
    if (selectedResources.length === 0) {
      console.log("No resources selected");
      return;
    }

    setLoading(true);

    const totalBillableHours = selectedResources.reduce(
      (acc, resource) => acc + (resource.billable_hours || 0),
      0
    );

    const totalCostHours = selectedResources.reduce(
      (acc, resource) => acc + (resource.cost_hours || 0),
      0
    );

    const totalUnplannedHours = selectedResources.reduce(
      (acc, resource) => acc + (resource.unplanned_hours || 0),
      0
    );

    const payload = {
      name: allocationName.trim(),
      contract_sow: selectedContract.uuid,
      estimation: selectedEstimation,
      client: selectedClient.uuid,
      total_billable_hours: totalBillableHours,
      total_cost_hours: totalCostHours,
      total_unplanned_hours: totalUnplannedHours,
      allocations_count: selectedResources.length,
      resource_data: selectedResources.map((resource) => ({
        role: resource.role || "",
        billable_hours: resource.available_hours || 0,
        cost_hours: resource.billable_hours || 0,
        resource_id: resource.resource_id,
        resource_name: resource.resource_name,
        unplanned_hours: resource.unplanned_hours || 0,
        start_date: resource.start_date || "",
        end_date: resource.end_date || "",
      })),
      approver: selectedApprovers.map((approver) => ({
        approver_id: approver.approver_id,
        approver_name: approver.approver_name,
      })),
    };

    if (oldResData) {
      const payloadResData = payload.resource_data;
      payloadResData.forEach((resource, index) => {
        const effDate = effDatesMapping.find(
          (effData) => effData.rowIndex === index
        );
        if (effDate && effDate.change_effective_from) {
          resource["change_effective_from"] = effDate.change_effective_from;
        } else {
          console.log(
            `No valid change_effective_from for resource at index ${index}, skipping...`
          );
        }
      });
      const updatedPayloadResData = updatePayloadData(
        payloadResData,
        oldResData
      );
      payload.resource_data = updatedPayloadResData;
    }

    try {
      const response = isEditMode
        ? await AllocationAPI.UPDATE(axiosPrivate, allocationData.uuid, payload)
        : await AllocationAPI.ADD(axiosPrivate, payload);

      if (isValidResponse(response)) {
        handleClose();
        onSucces(response?.data);
      } else {
        console.log("Failed to create allocation");
      }
    } catch (error) {
      if (
        (error.response &&
          error.response.data &&
          error.response.status === 400) ||
        error.response.status === 409
      ) {
        const backendError = error.response.data;
        if (backendError.name) {
          const errorMessage = backendError.name.join(" ");
          enqueueSnackbar(errorMessage, { anchorOrigin, variant: "error" });
        } else if (backendError.details) {
          if (Array.isArray(backendError.details)) {
            const errorMessages = backendError.details
              .map((detail) => {
                if (detail.resource_id && detail.date && detail.total_hours) {
                  return `Resource ID: ${detail.resource_id} on ${detail.date} exceeded limit. Total Hours: ${detail.total_hours}, Limit: ${detail.limit}`;
                } else if (
                  detail.resource_name &&
                  detail.role &&
                  detail.error
                ) {
                  return `${detail.resource_name} (${detail.role}): ${detail.error},`;
                }
                return "";
              })
              .filter(Boolean) // Remove empty strings
              .join("\n");

            enqueueSnackbar(`${backendError.error}:\n${errorMessages}`, {
              anchorOrigin,
              variant: "error",
            });
            console.error("Validation errors:", backendError.details);
          } else {
            enqueueSnackbar(`${backendError.error}`, {
              anchorOrigin,
              variant: "error",
            });
          }
        } else {
          console.log("Error creating allocation:", error);
          enqueueSnackbar("An unexpected error occurred.", {
            anchorOrigin,
            variant: "error",
          });
        }
      }
    } finally {
      setLoading(false);
    }
  };
  const handleResourceSelect = (resource, rowIndex) => {
    setSelectedResources((prev) => {
      const updatedResources = [...prev];
      updatedResources[rowIndex] = resource;
      return updatedResources;
    });
  };
  const [invalidEffDate, setInvalidEffDate] = useState(false);

  const isButtonDisabled =
    !selectedContract ||
    selectedResources.length === 0 ||
    allocationExists ||
    !allocationName ||
    invalidEffDate ||
    approverErrorMessage !== "";

  function isDisabled() {
    return resourceData.length !== allocationResCount;
  }
  console.log(isButtonDisabled);
  console.log(
    `Button Disabled: ${
      isButtonDisabled || loading || isDisabled() || error !== ""
    }`
  );

  async function checkAllocationExist(contract_sow_id) {
    try {
      const response = await AllocationAPI.ALLOCOATION_CHECK(
        axiosPrivate,
        contract_sow_id
      );
      console.log("res", response);

      const allocationExists = response?.data?.exist;
      setAllocationExists(allocationExists);
      setErrorMessage(
        allocationExists
          ? "An allocation with this contract and estimation combination already exists."
          : ""
      );

      // Set redirection ID based on allocation existence
      if (allocationExists && response.data.allocations.length > 0) {
        setAllocationRedirectionId(response.data.allocations[0].uuid);
      } else {
        setAllocationRedirectionId("");
      }
    } catch (error) {
      console.log("Error in checking allocation existence: ", error);
    }
  }

  const gotoAllocationPage = () => {
    navigate(PATH_PAGE.allocation.detail, {
      state: { uuid: allocationRedirectionId },
    });
  };

  return (
    <>
      <Box padding={"2% 2% 10% 2%"}>
        <Stack {...styles.titleStackParams}>
          <HighlightOffIcon onClick={handleClose} />
          <Typography noWrap variant="h4">
            {isEditMode
              ? translate("Allocation.UPDATE")
              : translate("Allocation.ADD")}
          </Typography>
        </Stack>
        {allocationExists && allocationRedirectionId && (
          <Box>
            <Typography color="error" variant="body2">
              {errorMessage}
            </Typography>
            <Typography
              onClick={gotoAllocationPage}
              sx={{
                color: "blue",
                fontSize: "12px",
                cursor: "pointer",
                textDecoration: "underline",
              }}
            >
              Click here to view
            </Typography>
          </Box>
        )}

        <Stack direction="row" spacing={2} paddingTop="27px">
          <TextField
            disabled={isEditMode}
            select
            fullWidth
            label={
              <MandatoryTextField
                label={translate("CONTRACTS.CONTRACT_NAME")}
              />
            }
            value={selectedContract}
            onChange={(event) => {
              const contract = event.target.value;
              setSelectedContract(contract);
              setSelectedEstimation(contract.estimation_uuid);
              fetchResData(contract.uuid, contract.estimation_uuid);
              checkAllocationExist(contract.uuid);
            }}
          >
            {contractDataList?.map((item) => (
              <MenuItem key={item.uuid} value={item}>
                {item.contractsow_name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            disabled={true}
            InputLabelProps={{ shrink: true }}
            fullWidth
            label={
              <MandatoryTextField
                label={translate("Estimations.ESTIMATION_NAME")}
              />
            }
            value={
              contractDataList.find(
                (item) => item.uuid === selectedContract?.uuid
              )?.estimation_name || ""
            }
            onChange={(event) => setSelectedEstimation(event.target.value)}
          />

          <FormControl fullWidth>
            <TextField
              inputProps={{ maxLength: 25 }}
              label={
                <MandatoryTextField label={translate("Allocation.NAME")} />
              }
              value={allocationName}
              onChange={handleInputChange}
              error={!!error}
              fullWidth
            />
            {error && <FormHelperText error>{error}</FormHelperText>}
          </FormControl>
        </Stack>
        <Grid container spacing={2} marginTop={2}>
          <Grid item xs={12} sm={4} md={4}>
            <Autocomplete
              multiple
              options={approvers || []}
              getOptionLabel={(option) => option.approver_name}
              value={selectedApprovers}
              onChange={(event, newValue) => setSelectedApprovers(newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Search Approvers"
                  placeholder="Enter Approver's Name"
                  variant="outlined"
                />
              )}
            />
            <Typography
              color="error"
              sx={{
                fontSize: "14px",
                marginTop: "5px",
                textAlign: "start",
              }}
            >
              {approverErrorMessage}
            </Typography>
          </Grid>
        </Grid>
      </Box>
      {!allocationExists ? (
        <AllocationResourceTable
          resorceData={resourceData}
          loading={loading}
          onResourceSelect={handleResourceSelect}
          allocationData={allocationData}
          isEditMode={isEditMode}
          preSelectedResourceData={preSelectedResourceData}
          contractDataList={contractDataList}
          setAllocationResCount={setAllocationResCount}
          setEffDatesMapping={setEffDatesMapping}
          effDatesMapping={effDatesMapping}
          setInvalidEffDate={setInvalidEffDate}
        />
      ) : null}
      <Button
        style={{
          float: "right",
          margin: "30px",
          borderRadius: "4px",
          height: "40px",
          backgroundColor: theme.palette.background.primar,
          color: "black",
        }}
        variant="contained"
        color="primary"
        onClick={handleSubmit}
        disabled={isButtonDisabled || loading || isDisabled() || error !== ""}
      >
        {isEditMode
          ? translate("Allocation.UPDATE")
          : translate("Allocation.CREATE")}
      </Button>
    </>
  );
}

export default AllocationForm;
