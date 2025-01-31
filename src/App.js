import NotistackProvider from "./components/NotistackProvider";
import Router from "./routes";
import ThemeProvider from "./theme";

import "./index.css";
import { Box } from "@mui/material";
import { useMsal } from "@azure/msal-react";
import { useNavigate } from "react-router-dom";
import { useData } from "./contexts/DataContext";
import InactivityTimer from "./pages/InactivityTimer";
import { PATH_PAGE } from "./routes/paths";
import AlertDialog from "./components/AlertDialog";
import React, { useState } from "react";

function App() {
  const { REACT_APP_SERVER_URL } = process.env;
  const { instance } = useMsal();
  const navigate = useNavigate();
  const { userData } = useData();
  const [showPopup, setShowPopup] = useState(false); // State for showing the popup
  const handleLogout = () => {
    setShowPopup(true);
  };
  const navigateToLogout = () => {
    const logoutRequest = {
      account: instance.getAccountByHomeId(userData?.user_info?.email),
      postLogoutRedirectUri: `${REACT_APP_SERVER_URL}login`,
    };
    instance.logoutRedirect(logoutRequest);
    navigate(PATH_PAGE.login);
  };
  return (
    <Box sx={{ backgroundColor: "background.paper" }}>
      <ThemeProvider>
        <NotistackProvider>
          {showPopup && (
            <AlertDialog
              setShowPopup={setShowPopup}
              showPopup={showPopup}
              navigateLink={navigateToLogout}
            />
          )}
          <InactivityTimer onLogout={handleLogout}></InactivityTimer>
          <Router />
        </NotistackProvider>
      </ThemeProvider>
    </Box>
  );
}

export default App;
