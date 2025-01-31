import * as React from "react";
import PropTypes from "prop-types";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import useLocales from "../hooks/useLocales";

ConsentPopUp.propTypes = {
  handleClose: PropTypes.func,
  handleConsent: PropTypes.func,
  priceAmount: PropTypes.number,
  fileAmount: PropTypes.number,
  unidentifiedData: PropTypes.bool,
};

export default function ConsentPopUp({
  onClose,
  onConsent,
  priceAmount,
  fileAmount,
  unidentifiedData
}) {
  const { translate } = useLocales();
  return (
    <Dialog open={true} onClose={onClose}>
      {unidentifiedData ? <>
        <DialogTitle>{translate("error.sowExtractFile")}</DialogTitle>
        <DialogContent>
          {translate("CONTRACTS.UNIDENTIFIED_DATA")}

        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={() => onClose()}>
            {translate("NO")}
          </Button>
          <Button
            variant="contained"
            sx={{ color: "black" }}
            onClick={() => onConsent()}
          >
            {translate("Yes")}
          </Button>
        </DialogActions>
      </> :
        <>
          <DialogTitle>{translate("confirmAmount")}</DialogTitle>
          <DialogContent>
            {translate("Total contract amount is")} {priceAmount}{" "}
            {translate("and the")}
            <br />
            {translate("SOW Amount is")} {fileAmount}
          </DialogContent>
          <DialogActions>
            <Button variant="outlined" onClick={() => onClose()}>
              {translate("cancel")}
            </Button>
            <Button
              variant="contained"
              sx={{ color: "black" }}
              onClick={() => onConsent()}
            // color="error"
            >
              {translate("confirm")}
            </Button>
          </DialogActions>

        </>
      }
    </Dialog>
  );
}
