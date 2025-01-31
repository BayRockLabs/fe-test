import { useContext, useMemo, useState } from "react";
import PropTypes from "prop-types";
import {
  NavLink as RouterLink,
  matchPath,
  useLocation,
} from "react-router-dom";
// material
import { useTheme, styled } from "@mui/material/styles";
import {
  Box,
  List,
  Collapse,
  ListItemText,
  ListItemIcon,
  ListItemButton,
  Tooltip,
} from "@mui/material";
import { tooltipClasses } from "@mui/material/Tooltip";
import { timesheetAccess } from "../utils/rolesAccessMapping";
import Iconify from "./Iconify";
import useLocales from "../hooks/useLocales";
import useAuth from "../hooks/useAuth";
import { useData } from "../contexts/DataContext";
import TimesheetContext from "../contexts/TimesheetContext";
import ROLES from "../routes/Roles";

// ----------------------------------------------------------------------

const ListItemStyle = styled((props) => (
  <ListItemButton disableGutters {...props} />
))(({ theme }) => ({
  ...theme.typography.body2,
  height: 48,
  position: "relative",
  textTransform: "capitalize",
  color: theme.palette.text.secondary,
  borderRadius: theme.shape.borderRadius,
  paddingLeft: theme.spacing(2),
  paddingRight: theme.spacing(1.5),
  marginBottom: theme.spacing(0.5),
}));

const ListItemIconStyle = styled(ListItemIcon)({
  width: 22,
  height: 22,
  color: "inherit",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});
const WhiteTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: theme.palette.grey[900], // Use a darker background color for better contrast
    color: theme.palette.common.white, // Ensure text is readable
    boxShadow: theme.shadows[1],
    fontSize: theme.typography.pxToRem(12),
  },
}));
// ----------------------------------------------------------------------

NavItem.propTypes = {
  item: PropTypes.object,
  active: PropTypes.func,
};

export function NavItem({ item, active, hasAccess }) {
  const theme = useTheme();
  const { translate } = useLocales();
  const { pathname } = useLocation();
  const { userData } = useData();
  const isActiveRoot = active(item.path);
  const { title, path, icon, info, children, allowedRoles } = item;
  const titleTrans = translate(title);
  const [open, setOpen] = useState(isActiveRoot);

  const handleOpen = () => {
    setOpen((prev) => !prev);
  };

  const access =
    !allowedRoles ||
    allowedRoles?.some((role) => userData?.user_roles?.includes(role)) ||
    false;

  const activeRootStyle = {
    color: theme.palette.text.black,
    fontWeight: "bold",
    // bgcolor: theme.palette.primary.main,
    backgroundColor: theme.palette.primary.main,
  };

  const activeSubStyle = {
    color: theme.palette.grey[0],
    fontWeight: "fontWeightMedium",
  };

  if (children) {
    return (
      <>
        <WhiteTooltip
          title={
            !access ? "You don’t have access to this module" : "" // Tooltip title only shows when access is denied
          }
          arrow
          placement="right"
        >
          <Box>
            <ListItemStyle
              onClick={handleOpen}
              sx={{
                ...(isActiveRoot && activeRootStyle),
                "&:hover": {
                  backgroundColor: theme.palette.primary.main, // Ensure it stays blue on hover
                },
                opacity: access ? 1 : 0.5, // Adjust opacity for disabled items
                pointerEvents: access ? "auto" : "none", // Disable clicks if no access
              }}
            >
              <ListItemIconStyle>{icon && icon}</ListItemIconStyle>
              <ListItemText disableTypography primary={titleTrans} />
              {info && info}
              <Iconify
                icon={
                  open
                    ? "eva:arrow-ios-downward-fill"
                    : "eva:arrow-ios-forward-fill"
                }
                sx={{ width: 16, height: 16, ml: 1 }}
              />
            </ListItemStyle>
          </Box>
        </WhiteTooltip>

        <Collapse in={open} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {children.map((item) => {
              const { title, path, subicon, allowedRoles } = item;
              const hasChildAccess = allowedRoles?.some((role) =>
                userData?.user_roles.includes(role)
              );

              const isActiveSub = active(path, true);

              const isActiveRootSub = () => {
                if (pathname.includes("detail")) {
                  const pathSegment = pathname.split("/");
                  const rootPath = pathSegment
                    .slice(0, pathSegment.length - 1)
                    .join("/");
                  return rootPath === path;
                }
              };

              return (
                <WhiteTooltip
                  title={
                    !hasChildAccess
                      ? "You don’t have access to this module"
                      : ""
                  }
                  arrow
                  placement="right"
                >
                  <Box>
                    <ListItemStyle
                      key={title}
                      component={RouterLink}
                      to={path}
                      sx={{
                        ...((isActiveSub || isActiveRootSub()) &&
                          activeSubStyle),
                        paddingLeft: "36px",
                        opacity: hasChildAccess ? 1 : 0.5, // Set opacity based on access

                        pointerEvents: hasChildAccess ? "auto" : "none", // Disable pointer events when no access
                      }}
                      onClick={(e) => {
                        if (!hasChildAccess) e.preventDefault();
                      }}
                    >
                      <ListItemIconStyle>
                        <Box
                          component="span"
                          sx={{
                            width: 4,
                            height: 4,
                            display: "flex",
                            borderRadius: "50%",
                            alignItems: "center",
                            justifyContent: "center",
                            bgcolor: "text.disabled",
                            transition: (theme) =>
                              theme.transitions.create("transform"),
                            ...(isActiveSub && {
                              transform: "scale(2)",
                              bgcolor: "primary.main",
                            }),
                          }}
                        />
                        {subicon}
                      </ListItemIconStyle>
                      <ListItemText disableTypography primary={title} />
                    </ListItemStyle>
                  </Box>
                </WhiteTooltip>
              );
            })}
          </List>
        </Collapse>
      </>
    );
  }

  return (
    <>
      <WhiteTooltip
        title={!access ? "You don’t have access to this module" : ""}
        arrow
        placement="right"
      >
        <Box>
          <ListItemStyle
            component={RouterLink}
            to={path}
            style={{
              ...(isActiveRoot && activeRootStyle),
              opacity: access ? 1 : 0.5,
              pointerEvents: access ? "auto" : "none",
            }}
          >
            <ListItemIconStyle>{icon && icon}</ListItemIconStyle>
            <ListItemText disableTypography primary={titleTrans} />
            {info && info}
          </ListItemStyle>
        </Box>
      </WhiteTooltip>
    </>
  );
}

NavSection.propTypes = {
  navConfig: PropTypes.array,
};

export default function NavSection({ navConfig, ...other }) {
  const { pathname } = useLocation();
  const { pendingApprovalCount } = useContext(TimesheetContext);
  const { userData } = useData();

  const isTimesheetExportUser = timesheetAccess.exportTimesheets(userData);

  const match = (path, isEnd = false) => {
    return path ? !!matchPath({ path, end: isEnd }, pathname) : false;
  };

  return (
    <Box {...other}>
      <List disablePadding sx={{ px: 2 }}>
        {navConfig.map((item) => {
          if (item.title === "Export Timesheet" && !isTimesheetExportUser) {
            return null;
          }

          const titleWithCount =
            item.title === "Timesheets" && pendingApprovalCount > 0
              ? `${item.title} (${pendingApprovalCount})`
              : item.title;

          return (
            <NavItem
              key={item.title}
              item={{ ...item, title: titleWithCount }}
              active={match}
            />
          );
        })}
      </List>
    </Box>
  );
}
