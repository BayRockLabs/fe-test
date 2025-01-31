import * as React from "react";
import PropTypes from "prop-types";
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import useLocales from "../hooks/useLocales";

POExistPopUp.propTypes = {
  onClose: PropTypes.func,
};

export default function POExistPopUp({
  onClose,
  notPO
}) {
  const { translate } = useLocales();
  return (
    <Dialog open={true} onClose={onClose}>
      <DialogContent>
        {notPO? translate("The document you have uploaded is not PO document,Please upload the correct document."):translate("Purchase order document already exists.Please upload a different document.")}
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" onClick={() => onClose()}>
          {translate("cancel")}
        </Button>         
      </DialogActions>
    </Dialog>
  );
}
