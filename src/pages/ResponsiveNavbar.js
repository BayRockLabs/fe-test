import * as React from "react";
import PropTypes from "prop-types";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";

import InboxIcon from "@mui/icons-material/MoveToInbox";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import MenuIcon from "@mui/icons-material/Menu";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Logo from "../assets/image.svg";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import WorkIcon from "@mui/icons-material/Work";
import GroupsIcon from "@mui/icons-material/Groups";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import ManageAccounts from "@mui/icons-material/ManageAccounts";
import SettingsIcon from "@mui/icons-material/Settings";
import IconNoResults from "../assets/icon_noresults.png";
import client from "../pages/Client";
import "../index.css";
import { useNavigate, useLocation } from "react-router-dom";
import { SignOutButton } from "../components/SignOutButton";
import palette from "../theme/palette";
import { PATH_PAGE } from "../routes/paths";
const drawerWidth = 240;

function ResponsiveDrawer(props) {
  const { window } = props;
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [activeLink, setActiveLink] = React.useState("");

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };
  const navigateToModal = () => {
    navigate("/modal");
  };
  const navigateToDashboard = () => {
    // 👇️ navigate to /contacts
    navigate(PATH_PAGE.dashboard);
  };
  const navigateToResourceManagement = () => {
    navigate(PATH_PAGE.resourceManagement);
  };

  const drawer = (
    <div>
      <Toolbar />

      {/* <Divider /> */}
      <img
        sx={{ left: "45px", top: "20px", position: "absolute", margin: "30px" }}
        src={Logo}
        onClick={navigateToDashboard}
      />

      <List>
        {[
          { title: "Client Management", Icon: <WorkIcon />, link: "client" },
          //  { title: 'Contract Management', Icon: <InsertDriveFileIcon /> },
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
              onClick={() => {
                navigate(`/${text.link}`);
                setActiveLink(text.link);
              }}
              selected={location.pathname === `/${text.link}`}
            >
              <IconButton>{text.Icon}</IconButton>
              <ListItemText primary={text.title} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </div>
  );

  const container =
    window !== undefined ? () => window().document.body : undefined;

  return (
    <>
      <Box sx={{ display: "flex" }}>
        <CssBaseline />

        <Box
          component="nav"
          sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
          aria-label="mailbox folders"
        >
          <Drawer
            variant="permanent"
            sx={{
              display: { xs: "none", sm: "block" },
              "& .MuiDrawer-paper": {
                boxSizing: "border-box",
                width: "280px",
                height: "1024px",
                backgroundColor: "#102A50",
                color: "whitesmoke",
              },
            }}
            open
          >
            {drawer}
          </Drawer>
        </Box>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

      <Typography
        variant="h5"
        color={palette.dark.primary.blue}
        fontWeight="700"
        fontSize="32px"
        fontFamily="Inter"
        marginTop="20px"
        paddingLeft="301px"
      >
        Client Management
      </Typography>
      <Button
        sx={{
          color: 'white',
          fontSize: '13px',
          padding: '7px 16px',
          borderRadius: '8px',
          backgroundColor: '#01CCFF',
          fontFamily: 'Inter',
        }}
        onClick={navigateToModal}
      >
        Add Client
      </Button>
    </Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          // marginTop: "288px",
          paddingLeft: "750px",
          paddingRight: "500px",
          marginTop: "324px",
          marginBottom: "392px",
          flexDirection: "column",
        }}
      >
        <img
          sx={{ width: "80px", height: "80px", flexShrink: "0" }}
          src={IconNoResults}
        />
        <Typography
          sx={{
            textAlign: "center",
            color: "#737881",
            fontFamily: "Inter",
            fontSize: "13px",
            fontStyle: "normal",
            fontWeight: "400",
            marginBottom: "8px",
          }}
        >
          No Data Found
        </Typography>
        <Typography
          sx={{
            textAlign: "center",
            color: "#737881",
            display: "inline-block",
            fontFamily: "Inter",
            fontSize: "13px",
            fontStyle: "normal",
            fontWeight: "600",
            lineHeight: "normal",
          }}
        >
          Add client to view Details
        </Typography>
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
