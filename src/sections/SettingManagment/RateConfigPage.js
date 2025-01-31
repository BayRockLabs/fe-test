import { TabContext, TabList, TabPanel } from "@mui/lab";
import { Box, Tab, TextField, Button, Grid, Chip } from "@mui/material";
import { CalendarPicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { format } from "date-fns";
import React, { useState } from "react";

function RateCardConfig() {
  const [value, setValue] = useState("1");

  const [usaForm, setUsaForm] = useState({
    overhead: "",
    grossMargin: "",
    noOfHolidays: "",
    minSellRate: "",
    holidays: [],
  });

  const [indiaForm, setIndiaForm] = useState({
    dollarConversionRate: "",
    overhead: "",
    grossMargin: "",
    noOfHolidays: "",
    minSellRate: "",
    holidays: [],
  });

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleInputChange = (e, tab) => {
    const { name, value } = e.target;
    if (tab === "USA") {
      setUsaForm((prevState) => ({ ...prevState, [name]: value }));
    } else if (tab === "India") {
      setIndiaForm((prevState) => ({ ...prevState, [name]: value }));
    }
  };

  const isUsaFormValid = Object.values(usaForm).every((val) => val !== "");
  const isIndiaFormValid = Object.values(indiaForm).every((val) => val !== "");
  const isFormValid = isUsaFormValid && isIndiaFormValid;

  const handleSubmit = () => {
    const combinedPayload = {
      usaData: {
        overhead: usaForm.overhead,
        grossMargin: usaForm.grossMargin,
        noOfHolidays: usaForm.noOfHolidays,
        minSellRate: usaForm.minSellRate,
        holidays: usaForm.holidays, // Include holidays in the payload.
      },
      indiaData: {
        dollarConversionRate: indiaForm.dollarConversionRate,
        overhead: indiaForm.overhead,
        grossMargin: indiaForm.grossMargin,
        noOfHolidays: indiaForm.noOfHolidays,
        minSellRate: indiaForm.minSellRate,
        holidays: indiaForm.holidays, // Include holidays in the payload
      },
    };
    console.log("Combined Payload:", combinedPayload);
  };

  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedIndiaDate, setSelectedIndiaDate] = useState(null);

  const handleUsaDateChange = (date) => {
    if (
      date &&
      !usaForm.holidays.some(
        (holiday) =>
          format(holiday, "yyyy-MM-dd") === format(date, "yyyy-MM-dd")
      )
    ) {
      setUsaForm((prevState) => ({
        ...prevState,
        holidays: [...prevState.holidays, date],
      }));
    }
    setSelectedDate(date);
  };

  const handleIndiaDateChange = (date) => {
    if (
      date &&
      !indiaForm.holidays.some(
        (holiday) =>
          format(holiday, "yyyy-MM-dd") === format(date, "yyyy-MM-dd")
      )
    ) {
      setIndiaForm((prevState) => ({
        ...prevState,
        holidays: [...prevState.holidays, date],
      }));
    }
    setSelectedIndiaDate(date);
  };

  const removeHoliday = (holiday, tab) => {
    if (tab === "USA") {
      setUsaForm((prevState) => ({
        ...prevState,
        holidays: prevState.holidays.filter(
          (h) => format(h, "yyyy-MM-dd") !== format(holiday, "yyyy-MM-dd")
        ),
      }));
    } else if (tab === "India") {
      setIndiaForm((prevState) => ({
        ...prevState,
        holidays: prevState.holidays.filter(
          (h) => format(h, "yyyy-MM-dd") !== format(holiday, "yyyy-MM-dd")
        ),
      }));
    }
  };

  return (
    <>
      <TabContext value={value}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <TabList onChange={handleChange} aria-label="lab API tabs example">
            <Tab label="USA" value="1" />
            <Tab label="India" value="2" />
          </TabList>
        </Box>

        {/* USA Tab - First Tab */}
        <TabPanel value="1">
          <form>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  label="Overhead"
                  type="number"
                  fullWidth
                  margin="normal"
                  name="overhead"
                  value={usaForm.overhead}
                  onChange={(e) => handleInputChange(e, "USA")}
                />
              </Grid>

              <Grid item xs={6}>
                <TextField
                  label="Gross Margin"
                  type="number"
                  fullWidth
                  margin="normal"
                  name="grossMargin"
                  value={usaForm.grossMargin}
                  onChange={(e) => handleInputChange(e, "USA")}
                />
              </Grid>

              <Grid item xs={6}>
                <TextField
                  label="No of Holidays"
                  type="number"
                  fullWidth
                  margin="normal"
                  name="noOfHolidays"
                  value={usaForm.noOfHolidays}
                  onChange={(e) => handleInputChange(e, "USA")}
                />
              </Grid>

              <Grid item xs={6}>
                <TextField
                  label="Minimum Sell Rate"
                  type="number"
                  fullWidth
                  margin="normal"
                  name="minSellRate"
                  value={usaForm.minSellRate}
                  onChange={(e) => handleInputChange(e, "USA")}
                />
              </Grid>
            </Grid>

            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <Box>
                <h6>Select Holidays for the Year</h6>
                <CalendarPicker
                  date={selectedDate}
                  onChange={handleUsaDateChange}
                  minDate={new Date("2025-01-01")}
                  maxDate={new Date("2025-12-31")}
                />
                {usaForm.holidays.length > 0 && (
                  <Box mt={2}>
                    <h6>Selected Holidays:</h6>
                    <Grid container spacing={1}>
                      {usaForm.holidays.map((holiday, index) => (
                        <Grid item key={index}>
                          <Chip
                            label={format(holiday, "MMM dd, yyyy")}
                            onDelete={() => removeHoliday(holiday, "USA")}
                            color="primary"
                          />
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                )}
              </Box>
            </LocalizationProvider>

            <Button
              variant="contained"
              color="primary"
              onClick={() => setValue("2")}
              sx={{ marginTop: 2 }}
              disabled={!isUsaFormValid} // Disable if USA form is not filled completely
            >
              Next
            </Button>
          </form>
        </TabPanel>

        {/* India Tab - Second Tab */}
        <TabPanel value="2">
          <form>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  label="Dollar Conversion Rate"
                  type="number"
                  fullWidth
                  margin="normal"
                  name="dollarConversionRate"
                  value={indiaForm.dollarConversionRate}
                  onChange={(e) => handleInputChange(e, "India")}
                />
              </Grid>

              <Grid item xs={6}>
                <TextField
                  label="Overhead"
                  type="number"
                  fullWidth
                  margin="normal"
                  name="overhead"
                  value={indiaForm.overhead}
                  onChange={(e) => handleInputChange(e, "India")}
                />
              </Grid>

              <Grid item xs={6}>
                <TextField
                  label="Gross Margin"
                  type="number"
                  fullWidth
                  margin="normal"
                  name="grossMargin"
                  value={indiaForm.grossMargin}
                  onChange={(e) => handleInputChange(e, "India")}
                />
              </Grid>

              <Grid item xs={6}>
                <TextField
                  label="No of Holidays"
                  type="number"
                  fullWidth
                  margin="normal"
                  name="noOfHolidays"
                  value={indiaForm.noOfHolidays}
                  onChange={(e) => handleInputChange(e, "India")}
                />
              </Grid>

              <Grid item xs={6}>
                <TextField
                  label="Minimum Sell Rate"
                  type="number"
                  fullWidth
                  margin="normal"
                  name="minSellRate"
                  value={indiaForm.minSellRate}
                  onChange={(e) => handleInputChange(e, "India")}
                />
              </Grid>
            </Grid>

            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <Box mt={2}>
                <h6>Select Holidays for the Year</h6>
                <CalendarPicker
                  date={selectedIndiaDate}
                  onChange={handleIndiaDateChange}
                  minDate={new Date("2025-01-01")}
                  maxDate={new Date("2025-12-31")}
                />
                {indiaForm.holidays.length > 0 && (
                  <Box mt={2}>
                    <h6>Selected Holidays:</h6>
                    <Grid container spacing={1}>
                      {indiaForm.holidays.map((holiday, index) => (
                        <Grid item key={index}>
                          <Chip
                            label={format(holiday, "MMM dd, yyyy")}
                            onDelete={() => removeHoliday(holiday, "India")}
                            color="primary"
                          />
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                )}
              </Box>
            </LocalizationProvider>

            <Box mt={2}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => setValue("1")}
              >
                Back
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSubmit}
                sx={{ marginTop: 2 }}
                disabled={!isFormValid}
              >
                Submit
              </Button>
            </Box>
          </form>
        </TabPanel>
      </TabContext>
    </>
  );
}
export default RateCardConfig;
