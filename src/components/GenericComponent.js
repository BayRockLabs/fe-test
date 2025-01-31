import React, { useState, useEffect } from "react";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import PurchaseOrderAPI from "../services/PurchaseOrderService";

function AutocompleteWithAPI({  label, value, onChange }) {
  const [options, setOptions] = useState([]);

  useEffect(() => {
    fetchOptionsFromAPI();
  }, []);
  const isValidResponse = (response) => {
    return response && response.status === 200 && response.data;
  };
  const fetchOptionsFromAPI = async () => {
    try {
      const response = await PurchaseOrderAPI(); 

      if (isValidResponse(response)) {
        const fetchedOptions = response.data; 
        setOptions(fetchedOptions);
      } else {
        onError("Invalid response from API");
      }
    } catch (error) {
      console.error("Error fetching options:", error);
      onError("Error fetching options");
    }
  };

  const onError = (message) => {
    console.error("Error:", message);
  };

  return (
    <Autocomplete
      options={options}
      getOptionLabel={(option) => (option ? option.label : "")}
      value={value}
      onChange={onChange}
      renderInput={(params) => (
        <TextField {...params} label={label} size="medium" variant="outlined" />
      )}
    />
  );
}

export default AutocompleteWithAPI;
