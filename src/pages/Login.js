import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Typography } from "@mui/material";
import Logo from "../assets/Budgeto Logo_ white.svg";
import { SignInButton } from "../components/SignInButton";
import UserAPI from "../services/Register";
import { useMsal } from "@azure/msal-react";
import { useData } from "../contexts/DataContext";
import "../pages/Login.css";
import LoadingScreen from "../components/LoadingScreen";
import getDefaultRole from "../utils/getDefaultRoles";
import TimesheetContext from "../contexts/TimesheetContext";

export default function Login() {
  const {
    setUserData,
    loading: dataLoading,
    setLoading: setContextLoading,
  } = useData();
  const navigate = useNavigate();
  const { instance } = useMsal();
  const [redirectHandled, setRedirectHandled] = useState(false);
  const [loading, setLoading] = useState(true);
  const { getPendingApprovalCount, isTimesheetApprover } =
    useContext(TimesheetContext);

  const handleRedirect = async () => {
    try {
      const response = await instance.handleRedirectPromise();
      if (response && response.accessToken) {
        const auth_token = response.accessToken;
        localStorage.setItem("microsoft_code", auth_token);

        try {
          const loginResponse = await UserAPI.Login({ auth_token });
          if (loginResponse.status === 200) {
            setUserData(loginResponse?.data);
            localStorage.setItem(
              "userData",
              JSON.stringify(loginResponse?.data)
            );
            console.log("login res", loginResponse?.data);

            localStorage.removeItem("selectedClient");
            if (isTimesheetApprover) {
              getPendingApprovalCount();
            }
            setLoading(false);
            setContextLoading(false);

            if (loginResponse?.data?.user_roles?.length !== 0) {
              const defaultRole = getDefaultRole(
                loginResponse?.data?.user_roles
              );
              console.log("default role", defaultRole);

              navigate(defaultRole);
            }
          }
        } catch (error) {
          console.error("Error during login:", error);
        }
      }
    } catch (error) {
      console.error("Error during redirect handling:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!redirectHandled) {
      handleRedirect()
        .then(() => setRedirectHandled(true))
        .catch((error) =>
          console.error("Error during initial redirect handling:", error)
        );
    }
  }, [redirectHandled]);

  if (loading || dataLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="LoginPage">
      <div className="section left-section">
        <img src={Logo} alt="Logo" className="logo" />
        <div className="center-container">
          <h3>Welcome</h3>
          <hr className="divider" />
          <span>
            Effortlessly manage{" "}
            <span style={{ color: "#01CCFF" }}>
              estimates, contracts, and financials
            </span>{" "}
            in one centralized platform.
          </span>
        </div>
      </div>
      <div className="section right-section">
        <div className="form-container">
          <Typography variant="h3" className="login-heading">
            Login
          </Typography>
          <Typography variant="subtitle1" className="login-subtext">
            Login to your BayRockLabs account
          </Typography>
          <SignInButton />
        </div>
      </div>
    </div>
  );
}
