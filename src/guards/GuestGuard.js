import PropTypes from "prop-types";
import { Navigate, useLocation } from "react-router-dom";
import { PATH_PAGE } from "../routes/paths";
import { useIsAuthenticated } from "@azure/msal-react";

// ----------------------------------------------------------------------

GuestGuard.propTypes = {
  children: PropTypes.node,
};

export default function GuestGuard({ children }) {
  const location = useLocation();
  const isAuthenticated = useIsAuthenticated();

  const from = location?.state?.from || PATH_PAGE.dashboard;

  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  return <>{children}</>;
}
