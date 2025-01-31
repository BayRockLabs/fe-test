import React from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { fDateMDY } from "../../../utils/formatTime";
import { Divider, IconButton, Typography } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { makeStyles } from "@mui/styles";
import { fCurrency } from "../../../utils/formatNumber";
// "startDateValue": "2023-09-29T18:30:00.000Z",
// "milestoneAmount": "2000",
// "milestoneNumber": 1,
// "milestoneDeliverables": "Test"
const columns = [
  {
    id: "milestoneNumber",
    label: "Milestone Number",
    align: "center",
    format: (value) => value,
  },
  {
    id: "startDateValue",
    label: "Milestone Date",
    align: "center",
    format: (value) => (value ? fDateMDY(value) : "--"),
  },
  {
    id: "milestoneDeliverables",
    label: "Milestone Deliverables",
    align: "center",
    format: (value) => value ?? "--",
  },
  {
    id: "milestoneAmount",
    label: "Milestone Amount",
    align: "center",
    format: (value) => (value ? fCurrency(value) : "--"),
  },
  {
    id: "id_delete",
    label: "",
    align: "center",
    format: (value) => value,
  },
];

const useStyles = makeStyles((theme) => ({
  container: {
    width: "100%",
    marginBottom: theme.spacing(2),
  },
  divider: {
    height: "5px",
    backgroundColor: theme.palette.background.divider,
  },
  deleteIconButton: {
    color: theme.palette.text.secondary,
  },
}));

function MilestoneTable({ tableData, onDeleteRow }) {
  const displayDeleteColumn = onDeleteRow !== undefined;
  const styles = useStyles();

  return (
    <>
      <TableContainer component={Paper} className={styles.container}>
        <Table aria-label="simple table">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell key={column.id} align={column.align}>
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {tableData?.map((row, index) => (
              <TableRow hover tabIndex={-1} key={index}>
                {columns.map((column) => (
                  <TableCell key={column.id} align={column.align}>
                    <Typography>
                      {column.id === "id_delete" && displayDeleteColumn ? (
                        <IconButton
                          className={styles.deleteIconButton}
                          aria-label="delete"
                          onClick={() => onDeleteRow(index)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      ) : (
                        column.format(row[column.id])
                      )}
                    </Typography>
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Divider className={styles.divider} />
    </>
  );
}

export default MilestoneTable;
