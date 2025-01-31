import React from "react";
import { useMsal } from "@azure/msal-react";
import { loginRequest } from "../authConfig";
import { Button, Typography,} from "@mui/material";
import "./SignInButton.css";
import Microsoftlogo from "../assets/Microsoft-logo.png";

/**
 * Renders a button which, when selected, will redirect the page to the login prompt
 */

export const SignInButton = () => {
  const { instance } = useMsal();
  const handleLogin = () => {
    instance
      .loginRedirect(loginRequest)
      .then((response) => {
        console.log("response in sign in comp", response);
        // No need to navigate here; handleRedirect in Login will take care of it
      })
      .catch((e) => {
        console.error("Error in login handle", e);
      });
  };

  return (
    <Button
      // variant="secondary"
      className="SignInBtn"
      onClick={handleLogin}
    >
      <img
        src={Microsoftlogo}
        width="20px"
        height="20px"
        style={{ marginLeft: "30px" }}
      />
      <Typography
        style={{
          marginTop: "-21px",
          fontSize: "12px",
          fontWeight: "600",
          marginLeft: "21px",
        }}
      >
        Login with Microsoft
      </Typography>
    </Button>
  );
};
