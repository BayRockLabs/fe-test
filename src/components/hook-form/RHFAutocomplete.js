import PropTypes from "prop-types";
// form
import { useFormContext, Controller } from "react-hook-form";
// @mui
import { Autocomplete, TextField } from "@mui/material";

// ----------------------------------------------------------------------

RHFAutocomplete.propTypes = {
  name: PropTypes.string,
  options: PropTypes.array,
};

export default function RHFAutocomplete({
  name,
  options = [],
  multiple,
  ...other
}) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <Autocomplete
          {...field}
          multiple={multiple}
          options={options}
          defaultValue={!field.value && multiple ? [] : field.value}
          isOptionEqualToValue={(option, selectedOption) =>
            option.value === selectedOption.value
          }
          filterSelectedOptions
          onChange={(e, selectedOptions) =>
            field.onChange(selectedOptions.filter((item) => item.value))
          }
          renderInput={(params) => (
            <TextField
              {...params}
              fullWidth
              error={!!error}
              helperText={error?.message}
              {...other}
            />
          )}
        />
      )}
    />
  );
}
