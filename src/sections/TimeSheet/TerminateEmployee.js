import React, { useState } from "react";
import {
  Box,
  Grid,
  Button,
  Typography,
  TextField,
  RadioGroup,
  FormControlLabel,
  Radio,
  Paper,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import { useSnackbar } from "notistack";
import PageHeader from "../../components/PageHeader";

export default function TerminateEmployee() {
  const [terminationOption, setTerminationOption] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const handleOptionChange = (event) => {
    setTerminationOption(event.target.value);
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const handleTerminate = () => {
    setOpenDialog(true);
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
  };

  const handleConfirmTerminate = () => {
    setOpenDialog(false);
    enqueueSnackbar("Employee terminated successfully!", {
      variant: "success",
    });
  };

  return (
    <Box padding={3}>
      <PageHeader
        primaryTitle="Terminate Employee"
        showBack={true}
        showSecondaryTitle={false}
      />
      <Paper elevation={3} sx={{ padding: 3, marginTop: 2 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <RadioGroup
              value={terminationOption}
              onChange={handleOptionChange}
              row
            >
              <FormControlLabel
                value="immediate"
                control={<Radio />}
                label="Immediate Effect"
              />
              <FormControlLabel
                value="contractEnd"
                control={<Radio />}
                label="On Close of Contract"
              />
              <FormControlLabel
                value="specificDate"
                control={<Radio />}
                label="Specific Date"
              />
            </RadioGroup>
          </Grid>
          {terminationOption && (
            <Grid item xs={12}>
              <Box
                sx={{
                  padding: 2,
                  border: "1px solid #ccc",
                  borderRadius: 1,
                  backgroundColor: "#f9f9f9",
                }}
              >
                {(terminationOption === "immediate" ||
                  terminationOption === "specificDate") && (
                  <DatePicker
                    label="Select Termination Date"
                    value={selectedDate}
                    onChange={handleDateChange}
                    renderInput={(params) => (
                      <TextField fullWidth {...params} />
                    )}
                  />
                )}
                {terminationOption === "contractEnd" && (
                  <Typography>
                    The employee will be terminated after the contract closes.
                  </Typography>
                )}
              </Box>
            </Grid>
          )}
          <Grid item xs={12} sx={{ textAlign: "right" }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleTerminate}
              disabled={!terminationOption}
            >
              Terminate Employee
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Dialog open={openDialog} onClose={handleDialogClose}>
        <DialogTitle>Confirm Termination</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to terminate this employee?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleConfirmTerminate} color="error">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
