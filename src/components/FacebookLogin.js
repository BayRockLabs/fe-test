import { Button } from "@mui/material";
import FacebookLogin from "react-facebook-login/dist/facebook-login-render-props";
import { useLocation, useNavigate } from "react-router-dom";

import useAuth from "../hooks/useAuth";
import UserAPI from "../services/UserService";
import Iconify from "./Iconify";
import { PATH_PAGE } from "../routes/paths";

function FacebookLoginButton() {

  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
 

  const onFacebookSignIn = async (user) => {
    try {
      await UserAPI.Login("facebook", { auth_token: user?.accessToken });
      await login();
      const from = location?.state?.from || PATH_PAGE.dashboard;
      navigate(from, { replace: true });
    } catch {}
  };

  return (
    <FacebookLogin
      appId={process.env.REACT_APP_FACEBOOK_ID}
      callback={onFacebookSignIn}
      render={(renderProps) => (
        <Button
          fullWidth
          size="large"
          color="inherit"
          variant="outlined"
          onClick={renderProps.onClick}
        >
          <Iconify
            icon="eva:facebook-fill"
            color="#1877F2"
            width={22}
            height={22}
          />
        </Button>
      )}
    />
  );
}

export default FacebookLoginButton;
