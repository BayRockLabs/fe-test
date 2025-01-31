import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
  Button,
  Typography,
} from "@mui/material";
import PropTypes from "prop-types";

ManualPOEntryPopup.propTypes = {
  open: PropTypes.bool.isRequired,
  onProceed: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

function ManualPOEntryPopup({ open, onProceed, onCancel }) {
  return (
    <Dialog open={open} onClose={onCancel}>
      <DialogTitle>Unable to Read Document</DialogTitle>
      <DialogContent>
        <Typography>
          Our system was unable to read your uploaded document. Please proceed
          by filling out the PO form manually.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} color="primary">
          Cancel
        </Button>
        <Button onClick={onProceed} color="primary" variant="contained">
          Proceed
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ManualPOEntryPopup;
