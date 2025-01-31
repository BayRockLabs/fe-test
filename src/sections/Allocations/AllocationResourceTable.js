import React, { useEffect, useState } from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Paper,
  CircularProgress,
  TextField,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import AllocationAPI from "../../services/AllocationService";
import { axiosPrivate } from "../../services/axios";
import { isValidResponse } from "../../hooks/useAxiosPrivate";
import { fDateMDY } from "../../utils/formatTime";
import { fDateYMD } from "../../utils/formatTime";
import { DatePicker } from "@mui/x-date-pickers";
import SelectResourceDropdown from "./SelectResourceDropdown";
const useStyles = makeStyles((theme) => ({
  table: {
    minWidth: 650,
  },
  footer: {
    backgroundColor: "#DFDAEF",
    fontWeight: 600,
  },
  summaryRow: {
    backgroundColor: "#E0E0E0",
    fontWeight: "bold",
  },
  noDataMessage: {
    padding: theme.spacing(2),
    textAlign: "center",
  },
  loaderContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100px",
  },
  headerCell: {
    fontWeight: "bold",
    backgroundColor: "#F0F0F0",
  },
  customTableContainer: {
    overflowX: "unset", // Remove the overflow-x style
  },
  cellWidth: { padding: "12px" },
}));

const AllocationResourceTable = ({
  resorceData,
  loading,
  onResourceSelect,
  allocationData,
  isEditMode,
  preSelectedResourceData,
  contractDataList,
  setAllocationResCount,
  effDatesMapping,
  setEffDatesMapping,
  setInvalidEffDate,
}) => {
  const classes = useStyles();
  const rows = resorceData || [];
  const [selectedResources, setSelectedResources] = useState(new Map());
  const [resourceSearchQueries, setResourceSearchQueries] = useState({});
  const [searchedResources, setSearchedResources] = useState({});
  const [uniqResourceIds, setUniqueResourceIds] = useState(new Map());

  useEffect(() => {
    if (isEditMode) {
      const newEffDatesMapping = allocationData.resource_data.map(
        (resource, index) => {
          return {
            rowIndex: index,
            change_effective_from: resource.change_effective_from || null,
          };
        }
      );

      // Set the newEffDatesMapping to state
      setEffDatesMapping(newEffDatesMapping);
    }
  }, [allocationData, isEditMode]);

  useEffect(() => {
    console.log("---effDatesMapping", effDatesMapping);
  }, [allocationData, isEditMode, effDatesMapping]);

  useEffect(() => {
    if (isEditMode && resorceData.length > 0) {
      const newSelectedResources = new Map();
      preSelectedResourceData.forEach((preSelected, index) => {
        handleResourceChange(
          preSelected.resource_id,
          index,
          preSelected.role,
          preSelected
        );
      });
      setSelectedResources(newSelectedResources);
      setAllocationResCount(preSelectedResourceData.length);
    }
  }, [preSelectedResourceData, resorceData, isEditMode]);

  useEffect(() => {
    if (isEditMode && resorceData.length > 0) {
      const newSelectedResources = new Map();
      preSelectedResourceData.forEach((preSelected, index) => {
        const uniqueKey = `${preSelected.role}-${index}`;
        newSelectedResources.set(uniqueKey, preSelected.resource_id);
      });
      setSelectedResources(newSelectedResources);
    }
  }, [preSelectedResourceData, resorceData, isEditMode]);

  const summary = rows.reduce(
    (acc, row) => {
      acc.billable_hours += row.billable_hours;
      acc.cost_hours += row.cost_hours;
      acc.unplanned_hours += row.unplanned_hours;
      return acc;
    },
    {
      billable_hours: 0,
      cost_hours: 0,
      unplanned_hours: 0,
    }
  );

  const handleEffDateChange = (newValue, rowIndex) => {
    if (newValue instanceof Date && !isNaN(newValue)) {
      setEffDatesMapping((prevMapping) => {
        return prevMapping.map((item) =>
          item.rowIndex === rowIndex
            ? {
                ...item,
                change_effective_from: newValue.toISOString(),
              }
            : item
        );
      });
    }
  };

  const handleResourceChange = (resourceId, rowIndex, role, resourceData) => {
    setUniqueResourceIds((prev) => {
      const updatedIds = new Map(prev);
      updatedIds.set(rowIndex, resourceId);
      return updatedIds;
    });

    const uniqueKey = `${role}-${rowIndex}`;
    setSelectedResources((prev) => {
      const updatedResources = new Map(prev);
      updatedResources.set(uniqueKey, resourceId);
      if (!isEditMode) {
        setAllocationResCount(updatedResources.size);
      }
      return updatedResources;
    });

    const selectedRow = rows[rowIndex];
    const selectedResource =
      resourceData ||
      selectedRow.resource_data.find(
        (resource) => resource.resource_id === resourceId
      );

    if (selectedResource) {
      const combinedResource = {
        ...selectedResource,
        role: selectedRow.role,
        billable_hours: selectedRow.billable_hours,
        cost_hours: selectedRow.cost_hours,
        unplanned_hours: selectedRow.unplanned_hours,
        start_date: selectedRow.start_date,
        end_date: selectedRow.end_date,
      };
      combinedResource.availability_status =
        selectedResource.availability_status;
      combinedResource.available_hours = selectedResource.available_hours;
      onResourceSelect(combinedResource, rowIndex);
    }
  };

  const handleSearchResource = (e, rowIndex) => {
    const query = e.target.value;
    setResourceSearchQueries((prev) => ({
      ...prev,
      [rowIndex]: query,
    }));

    if (query.length > 2) {
      const payload = {
        name: query,
        start_date: rows[rowIndex].start_date,
        end_date: rows[rowIndex].end_date,
        hours: rows[rowIndex].billable_hours,
      };

      if (!isNaN(payload.hours)) {
        searchResourceData(payload, rowIndex);
      } else {
        throw new Error("Invalid hours format. Hours should be an integer.");
      }
    } else {
      setSearchedResources((prev) => ({
        ...prev,
        [rowIndex]: [],
      }));
    }
  };

  async function searchResourceData(payload, rowIndex) {
    try {
      const response = await AllocationAPI.RESOURCE_SEARCH(
        axiosPrivate,
        payload
      );
      if (isValidResponse(response)) {
        setSearchedResources((prev) => ({
          ...prev,
          [rowIndex]: response?.data,
        }));
      }
    } catch (error) {
      console.error("Error fetching resource data:", error);
    }
  }

  function checkResourceAlreadyAdded(resId) {
    const uniqResIdSet = new Set(uniqResourceIds.values());
    return uniqResIdSet.has(resId);
  }

  const isWeekday = (date) => {
    const day = date.getDay();
    return day === 0 || day === 6;
  };

  return (
    <TableContainer component={Paper} className={classes.customTableContainer}>
      {loading ? (
        <Box className={classes.loaderContainer}>
          <CircularProgress />
        </Box>
      ) : rows.length === 0 ? (
        <Typography className={classes.noDataMessage} variant="h6">
          {contractDataList.length > 0
            ? "Select a contract to begin allocating resources."
            : "You currently have no active contracts for resource allocation."}
        </Typography>
      ) : (
        <Table className={classes.table} aria-label="resource table">
          <TableHead>
            <TableRow>
              <TableCell className={classes.headerCell}>
                Resource Name
              </TableCell>
              {isEditMode && (
                <TableCell className={classes.headerCell}>
                  Select Effective Date
                </TableCell>
              )}
              <TableCell className={classes.headerCell}>Role</TableCell>
              <TableCell className={classes.headerCell}>Start Date</TableCell>
              <TableCell className={classes.headerCell}>End Date</TableCell>
              <TableCell className={classes.headerCell}>
                Billable Hours
              </TableCell>
              <TableCell className={classes.headerCell}>
                Resource Availability
              </TableCell>
              <TableCell className={classes.headerCell}></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, rowIndex) => {
              const uniqueKey = `${row.role}-${rowIndex}`;
              const selectedResourceFromSearched = searchedResources[
                rowIndex
              ]?.find(
                (resource) =>
                  resource.resource_id === selectedResources.get(uniqueKey)
              );
              const selectedResourceFromMain = row.resource_data.find(
                (resource) =>
                  resource.resource_id === selectedResources.get(uniqueKey)
              );
              const toggleText = selectedResourceFromSearched
                ? selectedResourceFromSearched.resource_name
                : selectedResourceFromMain
                ? selectedResourceFromMain.resource_name
                : isEditMode
                ? preSelectedResourceData[rowIndex]?.resource_name
                : "Select Resource";
              const effDate =
                effDatesMapping[rowIndex]?.change_effective_from || null;
              return (
                <TableRow key={rowIndex}>
                  <TableCell>
                    <SelectResourceDropdown
                      toggleText={toggleText}
                      handleSearchResource={handleSearchResource}
                      rowIndex={rowIndex}
                      resourceSearchQueries={resourceSearchQueries}
                      searchedResources={searchedResources}
                      checkResourceAlreadyAdded={checkResourceAlreadyAdded}
                      handleResourceChange={handleResourceChange}
                      row={row}
                    />
                  </TableCell>
                  {isEditMode && (
                    <TableCell style={{ padding: "9px" }}>
                      <DatePicker
                        views={["year", "month", "day"]}
                        value={effDate ? new Date(effDate) : null}
                        onChange={(newValue) =>
                          handleEffDateChange(newValue, rowIndex)
                        }
                        shouldDisableDate={(date) =>
                          date < new Date(row.start_date) ||
                          date > new Date(row.end_date) ||
                          isWeekday(date)
                        }
                        inputFormat="yyyy-MM-dd"
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            helperText={null}
                            // fullWidth
                            error={false}
                          />
                        )}
                      />
                    </TableCell>
                  )}

                  <TableCell className={classes.cellWidth}>
                    {row.role}
                  </TableCell>
                  <TableCell className={classes.cellWidth}>
                    {effDate
                      ? fDateYMD(new Date(effDate))
                      : fDateMDY(row.start_date)}
                  </TableCell>

                  <TableCell className={classes.cellWidth}>
                    {fDateMDY(row.end_date)}
                  </TableCell>

                  <TableCell className={classes.cellWidth}>
                    {row.billable_hours} Hrs
                  </TableCell>
                  <TableCell
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      width: 220,
                    }}
                    className={classes.cellWidth}
                  >
                    <ul style={{ listStyleType: "none", padding: 0 }}>
                      <li style={{ position: "relative", paddingLeft: "1em" }}>
                        <span
                          style={{
                            color: "primary",
                            position: "absolute",
                            left: 0,
                          }}
                        >
                          •
                        </span>
                        Pre-Planned Hrs:{" "}
                        {selectedResources.get(uniqueKey) === undefined
                          ? ""
                          : searchedResources[rowIndex]?.find(
                              (resource) =>
                                resource?.resource_id ===
                                uniqResourceIds?.get(rowIndex)
                            )
                          ? searchedResources[rowIndex]?.find(
                              (resource) =>
                                resource?.resource_id ===
                                uniqResourceIds?.get(rowIndex)
                            )?.pre_planned_hours || 0
                          : row.resource_data.find(
                              (resource) =>
                                resource.resource_id ===
                                selectedResources.get(uniqueKey)
                            )?.pre_planned_hours || 0}
                      </li>
                      <li style={{ position: "relative", paddingLeft: "1em" }}>
                        <span
                          style={{
                            color: "blue",
                            position: "absolute",
                            left: 0,
                          }}
                        >
                          •
                        </span>
                        Available Hrs:{" "}
                        {selectedResources.get(uniqueKey) === undefined
                          ? ""
                          : searchedResources[rowIndex]?.find(
                              (resource) =>
                                resource?.resource_id ===
                                uniqResourceIds?.get(rowIndex)
                            )
                          ? searchedResources[rowIndex]?.find(
                              (resource) =>
                                resource?.resource_id ===
                                uniqResourceIds?.get(rowIndex)
                            )?.available_hours || 0
                          : row.resource_data.find(
                              (resource) =>
                                resource.resource_id ===
                                selectedResources.get(uniqueKey)
                            )?.available_hours || 0}
                      </li>
                    </ul>
                  </TableCell>
                </TableRow>
              );
            })}
            <TableRow className={classes.footer}>
              <TableCell colSpan={2}>
                {rows.length} Allocation{rows.length !== 1 && "s"}
              </TableCell>
              <TableCell></TableCell>
              <TableCell></TableCell>
              <TableCell>{summary.billable_hours} Hrs</TableCell>
              <TableCell></TableCell> <TableCell></TableCell>
            </TableRow>
          </TableBody>
        </Table>
      )}
    </TableContainer>
  );
};

export default AllocationResourceTable;
