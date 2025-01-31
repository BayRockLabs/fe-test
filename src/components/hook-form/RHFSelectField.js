import PropTypes from "prop-types";
// form
import { useFormContext, Controller } from "react-hook-form";
// @mui
import { MenuItem, TextField } from "@mui/material";
import { useMemo } from "react";

// ----------------------------------------------------------------------

RHFSelectField.propTypes = {
  name: PropTypes.string,
  options: PropTypes.array,
};

export default function RHFSelectField({
  name,
  options = [],
  format = false,
  ...other
}) {
  const { control } = useFormContext();

  const optionValues = useMemo(() => {
    if (!format) return options;
    return options.map((option) => ({ label: option, value: option }));
  }, [options, format]);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <TextField
          {...field}
          select
          fullWidth
          value={
            typeof field.value === "number" && field.value === 0
              ? ""
              : field.value
          }
          error={!!error}
          helperText={error?.message}
          {...other}
        >
          {optionValues.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
      )}
    />
  );
}
