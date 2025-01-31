import * as React from "react";
import PropTypes from "prop-types";
import {
  Box,
  CssBaseline,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Toolbar,
} from "@mui/material";
import { NavLink } from "react-router-dom";
import { makeStyles } from "@mui/styles";
import Logo from "../../assets/image.svg";
import WorkIcon from "@mui/icons-material/Work";
import GroupsIcon from "@mui/icons-material/Groups";
import SettingsIcon from "@mui/icons-material/Settings";
import { PATH_PAGE } from "../../routes/paths";
import { useNavigate, useLocation } from "react-router-dom";
import palette from "../../theme/palette";

const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
    "& .MuiDrawer-paper": {
      boxSizing: "border-box",
      width: "280px",
      height: "1024px",
      background:palette.dark.primary.green,
      color: palette.common.white,

    },
  },
  logo: {
    left: "45px",
    top: "20px",
    position: "absolute",
    margin: "30px",
    cursor: "pointer",
  },
  listItem: {
    paddingLeft: "40px",
  },
  activeLink: {
    backgroundColor: palette.dark.primary.red,

  },
}));

function ResponsiveDrawer({ window }) {
  const styles = useStyles();
  const container =
    window !== undefined ? () => window().document.body : undefined;
  const navigate = useNavigate();
  const location = useLocation();
  const [activeLink, setActiveLink] = React.useState("");
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const navigateToDashboard = () => {
    navigate(PATH_PAGE.dashboard);
  };

  const drawer = (
    <div className={styles.drawer}>
      <Toolbar />
      <img
        className={styles.logo}
        src={Logo}
        onClick={navigateToDashboard}
        alt="Logo"
      />
      <List>
        {[
          { title: "Client Management", Icon: <WorkIcon />, link: "client" },
          {
            title: "Resources Management",
            Icon: <GroupsIcon />,
            link: "resourcemanagement",
          },
          { title: "Settings", Icon: <SettingsIcon />, link: "settings" },
          { title: "Roles", Icon: <SettingsIcon /> },
        ].map((text, index) => (
          <ListItem key={text} disablePadding>
            <ListItemButton
              component={NavLink}
              to={`/${text.link}`}
              onClick={() => setActiveLink(text.link)}
              selected={location.pathname === `/${text.link}`}
              styles={{
                selected: styles.activeLink,
              }}
            >
              <IconButton>{text.Icon}</IconButton>
              <ListItemText primary={text.title} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </div>
  );

  return (
    <>
      <Box component="div" className={styles.root}>
        <CssBaseline />
        <Box
          component="nav"
          sx={{
            width: { sm: drawerWidth },
            flexShrink: { sm: 0 },
          }}
          aria-label="mailbox folders"
        >
          <Drawer
            container={container}
            variant="temporary"
            open={true} // Change this based on your use case for when the drawer should be open
            onClose={() => {}} // Add an event handler to close the drawer
            ModalProps={{
              keepMounted: true,
            }}
            sx={{
              display: { xs: "none", sm: "block" },
            }}
          >
            {drawer}
          </Drawer>
        </Box>
      </Box>
    </>
  );
}

ResponsiveDrawer.propTypes = {
  /**
   * Injected by the documentation to work in an iframe.
   * You won't need it on your project.
   */
  window: PropTypes.func,
};

export default ResponsiveDrawer;
