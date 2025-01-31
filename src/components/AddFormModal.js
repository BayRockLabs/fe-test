import React from "react";

import { Card, Modal, Slide } from "@mui/material";
import { useTheme } from "@emotion/react";
import { createStyles } from "@mui/styles";
import './AddFormModal.css'
const useStyles = createStyles((theme) => ({
  root: {
    width: "78%",
    left: "22%",
    maxHeight: "100vh",
    height: "100%",
    overflowY: "auto",
    borderRadius:'0px !important'
  }
}));
const AddFormModal = ({ onClose, children }) => {
  const theme = useTheme();
  const styles = useStyles(theme);
  const handleClose = () => {
    onClose();
  };

  return (
    <Modal
      aria-labelledby="transition-modal-title"
      aria-describedby="transition-modal-description"
      open={true}
      onClose={handleClose}
      closeAfterTransition
    >
      <Slide
        direction="left"
        in={true}
        mountOnEnter
        unmountOnExit
        sx={styles.root}
      >
        <Card sx={{borderRadius:'0px !important'}}>{children}</Card>
      </Slide>
    </Modal>
  );
};
export default AddFormModal;
