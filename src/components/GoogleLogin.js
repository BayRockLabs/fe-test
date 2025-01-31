import { useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import useScript from "../hooks/useScript";
import UserAPI from "../services/UserService";
import useAuth from "../hooks/useAuth";
import { Button } from "@mui/material";
import { PATH_PAGE } from "../routes/paths";

function GoogleLoginButton() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const googleButtonRef = useRef(null);

  const onGoogleSignIn = async (user) => {
    try {
      await UserAPI.Login("google", { auth_token: user?.credential });
      await login();
      const from = location?.state?.from || PATH_PAGE.dashboard;
      navigate(from, { replace: true });
    } catch {}
  };

  const scriptOnLoad = () => {
    window.google.accounts.id.initialize({
      client_id: process.env.REACT_APP_GOOGLE_ID,
      callback: onGoogleSignIn,
      auto_select: false,
    });

    window.google.accounts.id.prompt();

    window.google.accounts.id.renderButton(googleButtonRef.current, {
      size: "large",
      type: "icon",
    });
  };

  useScript("https://accounts.google.com/gsi/client", scriptOnLoad);

  return (
    <Button fullWidth size="large" color="inherit" variant="outlined">
      <div ref={googleButtonRef}></div>
    </Button>
  );
}

export default GoogleLoginButton;
