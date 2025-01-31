import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import { useTheme } from "@emotion/react";
import { createStyles } from "@mui/styles";
import { fCapitalizeFirst } from "../../utils/formatString";
import DeletePopUp from "../../components/DeletePopUp";
import { useState } from "react";

const useStyles = createStyles((theme) => ({
  rowContainer: {
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
}));

function TableDataComponent({ data, isEditMode = false, onDeleteRow }) {
  const theme = useTheme();
  const styles = useStyles(theme);

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Contact Name</TableCell>
            <TableCell>Contact Email</TableCell>
            {isEditMode && <TableCell></TableCell>}
          </TableRow>
        </TableHead>
        <TableBody>
          {data?.map((item, index) => (
            <TableRow key={index} sx={styles.rowContainer}>
              <TableCell>{fCapitalizeFirst(item.name)}</TableCell>
              <TableCell>{item.email}</TableCell>
              {isEditMode && (
                <TableCell>
                  <IconButton size="small" onClick={() => onDeleteRow(index)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default TableDataComponent;
