import PropTypes from 'prop-types';
import { Stack, InputAdornment, TextField } from '@mui/material';
// components
import Iconify from '../../components/Iconify';

// ----------------------------------------------------------------------

ResourceTableToolbar.propTypes = {
  filterValue: PropTypes.string,
  onFilter: PropTypes.func,
};

export default function ResourceTableToolbar({ filterValue, onFilter }) {
  return (
    <Stack spacing={2} direction={{ xs: 'column', sm: 'row' }} sx={{ py: 2.5, px: 3, width:'400px' }}>
      <TextField
        fullWidth
        // value={filterValue}
        onChange={(event) => onFilter(event.target.value)}
        placeholder="Search user..."
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Iconify icon={'eva:search-fill'} sx={{ color: 'text.disabled', width: 30, height: 20, }} />
            </InputAdornment>
          ),
        }}
      />
    </Stack>
  );
}
