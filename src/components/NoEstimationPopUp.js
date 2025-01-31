import * as React from "react";
import PropTypes from "prop-types";
import { Dialog, DialogContent, DialogActions, Button } from "@mui/material";
import useLocales from "../hooks/useLocales";

NoEstimationPopUp.propTypes = {
  handleClose: PropTypes.func,
  handleConsent: PropTypes.func,
};

export default function NoEstimationPopUp({ onClose, onGotoEstimation }) {
  const { translate } = useLocales();
  return (
    <Dialog open={true} onClose={onClose}>
      {/* <DialogTitle>{translate("confirmAmount")}</DialogTitle> */}
      <DialogContent>
        {translate(
          "Estimation data is missing. Please create an estimation first to proceed with pricing."
        )}
      </DialogContent>
      <DialogActions>
        {/* <Button variant="outlined" onClick={() => onClose()}>
          {translate("cancel")}
        </Button> */}
        <Button
          variant="contained"
          sx={{ color: "black" }}
          onClick={() => onGotoEstimation()}
        >
          {translate("Go to Estimation")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
