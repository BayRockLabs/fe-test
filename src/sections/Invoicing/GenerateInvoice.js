import * as React from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { Box,FormControlLabel, Radio, RadioGroup, Typography } from '@mui/material';

export default function RegenrateFormDialog({ onClose, handleRegenerate,row, }) {
    const [value, setValue] = React.useState('');
    const [amount, setAmount] = React.useState(null);

    const handleChange = (event) => {
        setValue(event.target.value);
        if (event.target.value === "system") {
            setAmount(0);
        } else {
            setAmount(null);
        }
    };

    const onGenerateClick = () => {
        if (value === "system") {
            handleRegenerate({
                "regenerate": true,
                "invoice_amount": 0
            });
        }
        if (value === "manual") {
            handleRegenerate({
                "regenerate": false,
                "invoice_amount": amount
            });
        }
    };

    const isGenerateButtonDisabled = () => {
        return value === '' || (value === 'manual' && !amount);
    };

    return (
        <Dialog open={true} onClose={onClose}>
            <DialogTitle>Generate Invoice</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Current generated invoice amount is {row.c2c_invoice_amount}
                </DialogContentText>
                <Box>
                    <RadioGroup
                        aria-labelledby="demo-controlled-radio-buttons-group"
                        name="controlled-radio-buttons-group"
                        value={value}
                        onChange={handleChange}
                    >
                        <FormControlLabel value="system" control={<Radio />} label="Generate from system" />
                        <FormControlLabel value="manual" control={<Radio />} label="Generate manually" />
                    </RadioGroup>

                </Box>
                {value === 'manual' && (
                    <Box sx={{ padding: 2, backgroundColor: "#f8f6f0", width: "60%" }}>
                        <Typography>Enter amount *</Typography>
                        <TextField
                            onChange={(e) => setAmount(e.target.value)}
                            sx={{ backgroundColor: "white" }}
                            value={amount}
                            type="number"
                        />
                    </Box>
                )}
            </DialogContent>
            <DialogActions>
                <Button variant="outlined" onClick={() => onClose()}>Cancel</Button>
                <Button
                    variant="contained"
                    onClick={onGenerateClick}
                    disabled={isGenerateButtonDisabled()}
                >
                    Generate
                </Button>
            </DialogActions>
        </Dialog>
    );
}