import PropTypes from "prop-types";
import { Navigate, useLocation } from "react-router-dom";

import useAuth from "../hooks/useAuth";
import LoadingScreen from "../components/LoadingScreen";
import { PATH_PAGE } from "../routes/paths";
import { useIsAuthenticated } from "@azure/msal-react";

// ----------------------------------------------------------------------

AuthGuard.propTypes = {
  children: PropTypes.node,
};

export default function AuthGuard({ children }) {
  const { isInitialized } = useAuth();
  const isAuthenticated = useIsAuthenticated();
  const { pathname } = useLocation();

  if (!isInitialized) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to={PATH_PAGE.login} replace state={{ from: pathname }} />;
  }

  return <>{children}</>;
}
