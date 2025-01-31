import * as React from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { useState } from "react";

import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import IconButton from "@mui/material/IconButton";
import { fDateMDY } from "../../utils/formatTime";
import { Divider, LinearProgress, Stack, Typography } from "@mui/material";
import useLocales from "../../hooks/useLocales";
import { makeStyles } from "@mui/styles";
import { Edit } from "@mui/icons-material";

const resourceColumn = (translate) => [
  {
    id: "id_role",
    label: translate("resourceRole"),
    align: "center",
    format: (value) => value,
  },
  {
    id: "id_num_of_resources",
    label: translate("Num of Resources"),
    align: "center",
    format: (value) => value,
  },
  {
    id: "id_region",
    label: translate("region"),
    align: "center",
    format: (value) => value,
  },
  {
    id: "id_experience",
    label: translate("Experience"),
    align: "center",
    format: (value) => value,
  },
  {
    id: `id_estimation_hour`,
    label: translate("estimationHrs"),
    align: "center",
    format: (value) => value + (value === 1 ? "Hr" : "Hrs"),
  },
  {
    id: "id_pay_rate",
    label: translate("payRate"),
    align: "center",
    format: (value) => "$" + value,
  },
  {
    id: "id_start_date",
    label: translate("startDate"),
    align: "center",
    format: (value) => fDateMDY(value),
  },
  {
    id: "id_end_date",
    label: translate("endDate"),
    align: "center",
    format: (value) => fDateMDY(value),
  },
];
// const useStyles = makeStyles(() => ({
//   customTableContainer: {
//     overflowX: "unset", // Remove horizontal scroll
//   },
// }));
export function createAddResourceData(
  selectedResource,
  selectedRegion,
  billableOrNonBillable,
  selectedSkill,
  selectedBillAllocation,
  selectedPayRate,
  selectedStartDate,
  selectedEndDate,
  selectedPayRateItem,
  costHrs,
  estimationData,
  timeData,
  totalAvailHours,
  numOfResources,
  selectedExperience,
  InitialDataDateWise,
  checkboxtype
) {
  const skillsArray = Array.isArray(selectedSkill)
    ? selectedSkill
    : [selectedSkill];
  const formattedSkills = skillsArray.join(", ");

  return {
    id_role: selectedResource,
    id_region: selectedRegion,
    id_billability:billableOrNonBillable,
    id_skill: formattedSkills,
    id_estimation_hour: selectedBillAllocation,
    id_pay_rate: selectedPayRateItem.billrate,
    id_start_date: selectedStartDate,
    id_end_date: selectedEndDate,
    id_other_pay_rate_data: selectedPayRateItem,
    id_cost_hrs: costHrs,
    id_estimation_Data: estimationData,
    id_time_data: timeData,
    id_working_hours: totalAvailHours,
    id_num_of_resources: numOfResources,
    id_experience: selectedExperience,
    id_initial_estimation_datewise: InitialDataDateWise,
    id_checkbox: checkboxtype,
  };
}

function ResourceTable({ isEdit = true, tableData, onDeleteRow, onEditRow }) {
  const { translate } = useLocales();
  const columns = resourceColumn(translate);
  const rows = tableData;

  // const classes = useStyles();

  return (
    <>
      <TableContainer
        component={Paper}
        // className={classes.customTableContainer}
      >
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              {columns?.map((column) => (
                <TableCell key={column.id} align={column.align}>
                  {column.label}
                </TableCell>
              ))}
              {isEdit && (
                <>
                  <TableCell>Edit</TableCell>
                  <TableCell>Delete</TableCell>
                </>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows?.map((row, index) => {
              // Calculate the percentage for the progress bar
              const percentage =
                (row.id_estimation_hour / row.id_cost_hrs) * 100;
              // console.log("percentage", percentage, row.id_estimation_hour);

              return (
                <TableRow hover key={index}>
                  {columns?.map((column) => {
                    return (
                      <TableCell key={column.id} align={column.align}>
                        {column.id === "id_estimation_hour" ? (
                          <Stack
                            direction="row"
                            alignItems={"center"}
                            justifyContent={"space-evenly"}
                            fullWidth
                          >
                            <Typography>
                              {column.format(row[column.id])}
                            </Typography>
                            {/* Use the calculated percentage for the progress bar */}
                            {/* <LinearProgress
                              color="success"
                              variant="determinate"
                              value={percentage} // Use the calculated percentage
                              sx={{ width: "100px" }}
                            /> */}
                          </Stack>
                        ) : (
                          <Typography>
                            {column.format(row[column.id])}
                          </Typography>
                        )}
                      </TableCell>
                    );
                  })}
                  {isEdit && (
                    <>
                      <TableCell align="center">
                        <IconButton
                          color="default"
                          aria-label="edit"
                          onClick={() => onEditRow(row)} // Trigger edit action
                        >
                          <EditIcon />
                        </IconButton>
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          color="default"
                          aria-label="delete"
                          onClick={() => onDeleteRow(index)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      <Divider sx={{ height: "5px", bgcolor: "background.divider" }} />
    </>
  );
}

export default ResourceTable;
