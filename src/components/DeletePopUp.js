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

DeletePopUp.propTypes = {
  handleClose: PropTypes.func,
  handleDelete: PropTypes.func,
};

export default function DeletePopUp({ onClose, onDelete }) {
  const { translate } = useLocales();
  return (
    <Dialog open={true} onClose={onClose}>
      <DialogTitle>{translate("confirmDelete")}</DialogTitle>
      <DialogContent>{translate("message.deleteConfirm")}</DialogContent>
      <DialogActions>
        <Button variant="outlined" onClick={() => onClose()}>
          {translate("cancel")}
        </Button>
        <Button
          onClick={() => onDelete()}
          sx={{ color: "black" }}
          variant="contained"
        >
          {translate("delete")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
