import * as React from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import InputAdornment from '@mui/material/InputAdornment';
import OutlinedInput from '@mui/material/OutlinedInput';
import dayjs from 'dayjs';
import Stack from '@mui/material/Stack';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import Button from '@mui/material/Button';
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { PATH_PAGE } from "../routes/paths";
import MenuItem from '@mui/material/MenuItem';

export default function FormPropsTextFields() {
    // const [value, setValue] = React.useState(dayjs('2022-04-07'));
    // const [open, setOpen] = React.useState(false);
    // const handleOpen = () => setOpen(true);
    // const handleClose = () => setOpen(false);
    // const navigate = useNavigate();


    const currencies = [
        {
          value: 'USD',
          label: '$',
        },
        {
          value: 'EUR',
          label: '€',
        },
        {
          value: 'BTC',
          label: '฿',
        },
    ];
  return (
   
    <div>
     <> 
         
      
      <Box sx={{display:'flex',gap:'30px', flexDirection: 'row',direction:'revert',margin:'16px'}}>
     
        <TextField
        fullWidth
          id="outlined-select-currency"
          select
          label="Client Payment Terms"
          defaultValue="EUR"
        //   helperText="Please select your currency"
        >
          {currencies.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
        <TextField
        fullWidth
          id="outlined-select-currency-native"
          select
          label="Client Invoicing Process"
          defaultValue="EUR"
          SelectProps={{
            native: true,
          }}
        >
          {currencies.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </TextField>

      </Box>
      <Box sx={{display:'flex',gap:'30px', flexDirection: 'row',direction:'revert',margin:'16px'}}>
       
       <FormControl fullWidth>
           <InputLabel htmlFor="outlined-adornment-clientapname">Client AP Name</InputLabel>
           <OutlinedInput
             id="outlined-adornment-clientapname"
             // startAdornment={<InputAdornment position="start">$</InputAdornment>}
             label="Client AP Name"
           />
         </FormControl>
         
         <FormControl fullWidth>
           <InputLabel htmlFor="outlined-adornment-clientapemail">Client AP Email</InputLabel>
           <OutlinedInput
             id="outlined-adornment-clientapemail"
             // startAdornment={<InputAdornment position="start">$</InputAdornment>}
             label="Client AP Email"
           />
         </FormControl>
 
       </Box>
      {/* <Button sx={{float:'right',backgroundColor:'#2F7FF6',color:'white',margin:'30px',borderRadius:'12px',width:'120px',height:'40px'}} onClick={handleOpen}>Next</Button> */}
  {/* <Button onClick={event =>  window.location.href='/dashboard'}
             sx={{float:'right',backgroundColor:'#2F7FF6',color:'white',margin:'30px',borderRadius:'12px',width:'120px',height:'40px'}}
              variant="contained"
              component={RouterLink}
              to={PATH_PAGE.user.new}
             
            >
              Next
            </Button> */}
      </>
    </div>
      
    // </Box>
  );
}