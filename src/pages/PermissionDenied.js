import { useState } from "react";
import { PATH_PAGE } from "../routes/paths";
import Page from "../components/Page";
import React from "react";
import { Box, Typography } from "@mui/material";
import { styled } from "@mui/system";
import permissionDeniedlogo from "../assets/permission-denied-logo.svg";
import { useData } from "../contexts/DataContext";
import { useMsal } from "@azure/msal-react";
import { useNavigate } from "react-router-dom";
import DashboardSidebarPermissionDenied from "../layouts/dashboard/DashboardSidebarPermissionDenied";

// ----------------------------------------------------------------------

export default function PermissionDenied() {
  const [role, setRole] = useState("admin");
  const { userData } = useData();
  const { REACT_APP_SERVER_URL } = process.env;
  const { instance } = useMsal();
  const navigate = useNavigate();

  const handleChangeRole = (event, newRole) => {
    if (newRole !== null) {
      setRole(newRole);
    }
  };

  const handleLogout = (instance) => {
    const logoutRequest = {
      account: instance.getAccountByHomeId(userData?.user_info?.email),
      postLogoutRedirectUri: `${REACT_APP_SERVER_URL}login`,
    };
    instance.logoutRedirect(logoutRequest);
    navigate(PATH_PAGE.login);
  };

  const CenteredBox = styled(Box)({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    textAlign: "center",
    backgroundColor: "#f0f0f0",
    marginLeft: "15%",
  });

  const Image = styled("img")({
    width: "150px", // Adjust size as needed
    marginTop: "30px",
  });
  return (
    <Page title="Permission Denied">
      <DashboardSidebarPermissionDenied />
      <CenteredBox>
        <Typography variant="h4" component="h1" gutterBottom>
          Permission Denied
        </Typography>
        <Typography variant="body1" gutterBottom>
          You do not have permission to access this page. Please contact your
          system administrator for further assistance.
          <br />
          You can go back to the
          <a
            style={{ textDecoration: "none", marginLeft: "5px" }}
            href="#"
            onClick={() => handleLogout(instance)}
          >
            Login Page
          </a>
          .
        </Typography>
        <Image src={permissionDeniedlogo} alt="Stop Sign" />
      </CenteredBox>
    </Page>
  );
}
