import PropTypes from "prop-types";
import { m } from "framer-motion";
// @mui
import { Container, Typography } from "@mui/material";
// hooks
import useAuth from "../hooks/useAuth";
// components
import { MotionContainer, varBounce } from "../components/animate";
// assets
import { ForbiddenIllustration } from "../assets";
import { Navigate, useLocation } from "react-router-dom";
import { PATH_PAGE } from "../routes/paths";

// ----------------------------------------------------------------------

RoleBasedGuard.propTypes = {
  redirect: PropTypes.bool,
  permission: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

export default function RoleBasedGuard({
  redirect,
  permission,
  children,
}) {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const currentPermissions = user?.permissions || [];

  if (
    typeof permission !== "undefined" &&
    !currentPermissions.some((item) => item.uuid === permission)
  ) {
    return redirect ? (
      <Navigate
        to={PATH_PAGE.permissionDenied}
        replace
        state={{ from: pathname }}
      />
    ) : (
      <Container component={MotionContainer} sx={{ textAlign: "center" }}>
        <m.div variants={varBounce().in}>
          <Typography variant="h3" paragraph>
            Permission Denied
          </Typography>
        </m.div>

        <m.div variants={varBounce().in}>
          <Typography sx={{ color: "text.secondary" }}>
            You do not have permission to access this page
          </Typography>
        </m.div>

        <m.div variants={varBounce().in}>
          <ForbiddenIllustration sx={{ height: 260, my: { xs: 5, sm: 10 } }} />
        </m.div>
      </Container>
    );
  }

  return <>{children}</>;
}
