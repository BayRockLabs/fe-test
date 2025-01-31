import React, { useEffect, useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { PDFDownloadLink, pdf } from '@react-pdf/renderer';
import Invoice from './Invoice';
import PdfDocDefault from '../../assets/svg/PdfDocDefault';
import { Box, Typography } from '@mui/material';

const CustomPaper = (props) => {
  return (
    <div
      {...props}
      style={{
        position: 'fixed',
        bottom: 0,
        right: 0,
        width: '30%',
        height: '80%',
        borderRadius: '8px',
        overflow: 'hidden',
        background:"white",
      }}
    />
  );
};

const PDFDialog = ({ onClose, handleSendEmailClick, row }) => {
  const [emails, setEmails] = useState("");
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [isValidEmail, setIsValidEmail] = useState(true);

  useEffect(() => {
    validateEmails(emails);
  }, [emails]);

  const validateEmails = (emailString) => {
    const emailArray = emailString.split(',').map(email => email.trim());
    const isValid = emailArray.every(email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));
    setIsValidEmail(isValid);
  };

  const isFormValid = () => {
    return emails.trim() !== '' && subject.trim() !== '' && body.trim() !== '' && isValidEmail;
  };

  const handleSend = async () => {
    const pdfBlob = await generatePDFBlob();
    const result = {
      "files": pdfBlob,
      "to_email": emails,
      "email_subject": subject,
      "email_body": body,
    };
    if(result){
        handleSendEmailClick(result);
    }
  };

  const generatePDFBlob = async () => {
    const pdfBlob = await pdf(<Invoice row={row}/>).toBlob();
    console.log(pdfBlob);
    return pdfBlob;
  };

  return (
    <Dialog
      open={true}
      onClose={onClose}
      PaperComponent={CustomPaper}
      sx={{
        '& .MuiDialog-paper': {
          boxShadow: 'none', // Removes the default shadow
        }
      }}
    >
      <DialogTitle>
        Send Mail
        <IconButton
          edge="end"
          color="inherit"
          onClick={onClose}
          aria-label="close"
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <TextField
          label="Recipient Emails (comma-separated)"
          fullWidth
          margin="normal"
          value={emails}
          onChange={(e) => setEmails(e.target.value)}
        />
        <TextField
          label="Subject"
          fullWidth
          margin="normal"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />
        <TextField
          label="Body"
          fullWidth
          margin="normal"
          multiline
          value={body}
          rows={3}
          onChange={(e) => setBody(e.target.value)}
        />
        <Box style={{ textAlign: 'left'}}>
          <PDFDownloadLink
            document={<Invoice row={row}/>}
            fileName="invoice.pdf"
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <PdfDocDefault />
              <Typography sx={{ textDecoration: 'none' }}>Attached Invoice</Typography>
            </Box>
          </PDFDownloadLink>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
        <Button
          onClick={handleSend}
          color="primary"
          disabled={!isFormValid()}
          variant="contained"
        >
          Send
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PDFDialog;
