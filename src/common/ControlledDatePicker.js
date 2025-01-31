import React from "react";
import { Controller } from "react-hook-form";
import TextField from "@mui/material/TextField";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker as MuiDatePicker } from "@mui/x-date-pickers/DatePicker";

function ControlledDatePicker({
  control,
  label,
  name,
  disableWeekends,
  disableFuture,
  disablePast,
  error,
  helperText,
  ...otherProps
}) {
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <MuiDatePicker
            label={label}
            inputFormat="yyyy-MM-dd"
            className="w-full"
            value={field.value || null}
            onChange={(newValue) => {
              field.onChange(newValue);
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                error={!!error}
                helperText={helperText}
                sx={{ width: "-webkit-fill-available" }}
              />
            )}
            disableMaskedInput={false} // Allows free entry of date
            openTo="day"
            views={["year", "month", "day"]}
            disablePast={disablePast}
            disableFuture={disableFuture}
            shouldDisableDate={disableWeekends}
            disableOpenPicker={false} // Allows users to open the calendar and choose a date
            {...(disableWeekends ? { shouldDisableDate: disableWeekends } : {})}
            {...otherProps}
          />
        )}
      />
    </LocalizationProvider>
  );
}

export default ControlledDatePicker;
