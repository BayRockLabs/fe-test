import React from "react";
import { matchPath, useLocation, useNavigate } from "react-router-dom";
// material
import { styled } from "@mui/material/styles";
import { Box, Button, Drawer } from "@mui/material";
import ArrowBack from "@mui/icons-material/ArrowBack";
// hooks
// components
import Scrollbar from "../../components/Scrollbar";
import NavSection from "../../components/NavSection";
//
import { DashboardNavConfig, SelectedClientNavConfig } from "./NavConfig";
import Logo from "../../assets/Budgeto Logo_ white.svg";
import { PATH_PAGE } from "../../routes/paths";
import useClient from "../../hooks/useClient";
import { fCapitalizeFirst } from "../../utils/formatString";
import useLocales from "../../hooks/useLocales";
import { createStyles } from "@mui/styles";
import { useTheme } from "@emotion/react";
import { useMsal } from "@azure/msal-react";
import { useData } from "../../contexts/DataContext";
// ----------------------------------------------------------------------

import CssBaseline from "@mui/material/CssBaseline";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import Toolbar from "@mui/material/Toolbar";

const drawerWidth = 280;

const RootStyle = styled("div")(({ theme }) => ({
  [theme.breakpoints.up("lg")]: {
    flexShrink: 0,
    width: drawerWidth,
  },
}));

// ----------------------------------------------------------------------

DashboardSidebar.propTypes = {};

export default function DashboardSidebar(props) {
  const { window } = props;
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [isClosing, setIsClosing] = React.useState(false);

  const handleDrawerClose = () => {
    setIsClosing(true);
    setMobileOpen(false);
  };

  const handleDrawerTransitionEnd = () => {
    setIsClosing(false);
  };

  const handleDrawerToggle = () => {
    if (!isClosing) {
      setMobileOpen(!mobileOpen);
    }
  };

  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { selectedClient } = useClient();
  const { translate } = useLocales();
  const theme = useTheme();
  const styles = useStyles(theme);
  const { userData } = useData();
  const { REACT_APP_SERVER_URL } = process.env;
  const { instance } = useMsal();
  const isClientSelectedMatch = !!matchPath(
    {
      path: PATH_PAGE.client.root + "/",
      end: false,
      exact: true,
    },
    pathname
  );

  const handleLogoClick = () => {
    navigate(PATH_PAGE.dashboard);
    localStorage.removeItem("selectedClient");
  };

  const handleLogout = (instance) => {
    localStorage.removeItem("selectedClient");
    localStorage.removeItem("userData");
    const logoutRequest = {
      account: instance.getAccountByHomeId(userData?.user_info?.email),
      postLogoutRedirectUri: `${REACT_APP_SERVER_URL}login`,
    };
    instance.logoutRedirect(logoutRequest);
    navigate(PATH_PAGE.login);
  };

  function getTitleName() {
    return (
      fCapitalizeFirst(selectedClient?.name ?? "") + " " + translate("overview")
    );
  }
  const RenderContent = ({ isClientSelectedMatch }) => {
    return (
      <Scrollbar
        sx={{
          height: 1,
          "& .simplebar-content": {
            height: 1,
            display: "flex",
            flexDirection: "column",
          },
          background: "#1C1D24",
        }}
      >
        <Box
          onClick={handleLogoClick}
          sx={{
            px: 2.5,
            py: 3,
            display: "flex",
            flexDirection: "row",
            backgroundColor: "background.dark",
          }}
        >
          <img alt="MAtchPoint" src={Logo} />
        </Box>
        {isClientSelectedMatch && (
          <Box padding={2}>
            <Button
              onClick={handleLogoClick}
              variant="outlined"
              color="secondary"
              startIcon={<ArrowBack />}
              sx={styles.menuButton}
            >
              {translate("mainMenu")}
            </Button>
          </Box>
        )}

        <NavSection
          navConfig={
            isClientSelectedMatch
              ? SelectedClientNavConfig(getTitleName(), translate)
              : DashboardNavConfig(translate)
          }
        />
      </Scrollbar>
    );
  };
  // Remove this const when copying and pasting into your project.
  const container =
    window !== undefined ? () => window().document.body : undefined;
  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <div style={{ backgroundColor: "#1C1D24" }}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: "none" } }}
          >
            <MenuIcon sx={{ color: "white" }} />
          </IconButton>
        </Toolbar>
      </div>
      <Box
        component="nav"
        sx={{ width: { sm: "233px" }, flexShrink: { sm: 0 } }}
      >
        {/* The implementation can be swapped with js to avoid SEO duplication of links. */}
        <Drawer
          container={container}
          variant="temporary"
          open={mobileOpen}
          onTransitionEnd={handleDrawerTransitionEnd}
          onClose={handleDrawerClose}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
        >
          <RenderContent isClientSelectedMatch={isClientSelectedMatch} />
          <Button
            onClick={() => handleLogout(instance)}
            variant="contained"
            color="secondary"
            sx={styles.menuButton}
          >
            {translate("Logout")}
          </Button>
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", sm: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
          open
        >
          <RenderContent isClientSelectedMatch={isClientSelectedMatch} />
          <Button
            onClick={() => handleLogout(instance)}
            variant="contained"
            color="secondary"
            sx={styles.menuButton}
          >
            {translate("Logout")}
          </Button>
        </Drawer>
      </Box>
    </Box>
  );
}
const useStyles = createStyles((theme) => ({
  menuButton: {
    borderRadius: "4px",
    border: `1px solid ${theme.palette.sidebar.border}`,
    background: theme.palette.sidebar.background,
    color: theme.palette.sidebar.color,
  },
}));
