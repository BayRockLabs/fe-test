import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogTitle from '@mui/material/DialogTitle';

export default function AlertDialog({ setShowPopup, showPopup, navigateLink }) {
    const handleClose = () => {
        localStorage.removeItem("selectedClient");
        localStorage.removeItem("userData");
        navigateLink();
        setShowPopup(false);
    };

    return (
        <React.Fragment>
            <Dialog
                open={showPopup}
                onClose={handleClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    {"Session Expired...!"}
                </DialogTitle>
                <DialogActions>
                    <Button variant="contained" onClick={handleClose}>
                        Ok
                    </Button>
                </DialogActions>
            </Dialog>
        </React.Fragment>
    );
}
