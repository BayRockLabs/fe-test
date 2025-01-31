// material
import { Stack, Button, Divider, Typography } from '@mui/material';
import FacebookLogin from '../../components/FacebookLogin';
import GoogleLoginButton from '../../components/GoogleLogin';
// component
import Iconify from '../../components/Iconify';
import useLocales from '../../hooks/useLocales';

// ----------------------------------------------------------------------

export default function AuthSocial() {
  const { translate } = useLocales()
  return (
    <>
    <Divider sx={{ my: 3 }}>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {translate('or')}
        </Typography>
      </Divider>
      <Stack direction="row" spacing={2}>
        <GoogleLoginButton />
        <FacebookLogin />

        <Button fullWidth size="large" color="inherit" variant="outlined">
          <Iconify icon="eva:twitter-fill" color="#1C9CEA" width={22} height={22} />
        </Button>
      </Stack>
    </>
  );
}
