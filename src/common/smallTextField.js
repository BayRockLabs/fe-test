// SmallTextField.js
import React from "react";
import { TextField } from "@mui/material";
import { makeStyles } from "@mui/styles";

const useStyles = makeStyles((theme) => ({
  smallTextField: {
    padding: "8px",
    width: "60px",
    marginLeft:"1px",
    fontWeight:"500",
    borderRadius:"4px",
    alignContent:"center",
  },
}));

export default function SmallTextField() {
  const classes = useStyles();
  return (
    <TextField
      variant="outlined"
      size="small"
      inputProps={{
        className: classes.smallTextField,
      }}
    />
  );
}
