import { Box, Container, Grid, Tab, Typography } from "@mui/material";
import { TabContext, TabList, TabPanel } from "@mui/lab";

import Page from "../components/Page";
import ChangePassword from "../sections/user/ChangePassword";
import ProfileForm from "../sections/user/ProfileForm";
import { useState } from "react";
import ProfilePicture from "../sections/user/ProfilePicture";
import Iconify from "../components/Iconify";
import SettingsForm from "../sections/user/SettingsForm";
import useLocales from "../hooks/useLocales";

const Profile = () => {
  const [currentTab, setCurrentTab] = useState("profile");
  const { translate } = useLocales();

  const handleTabChange = (e, newValue) => {
    setCurrentTab(newValue);
  };

  return (
    <Page title="User">
      <Container maxWidth="xl">
        <Typography variant="h4" sx={{ mb: 5 }}>
          {translate("Profile")}
        </Typography>

        <TabContext value={currentTab}>
          <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 5 }}>
            <TabList onChange={handleTabChange} aria-label="">
              <Tab
                sx={{ minHeight: 48 }}
                icon={
                  <Iconify
                    icon="bxs:user-rectangle"
                    style={{ fontSize: "24px" }}
                  />
                }
                iconPosition="start"
                label={translate("profile")}
                value="profile"
              />
              <Tab
                sx={{ minHeight: 48 }}
                icon={
                  <Iconify
                    icon="ic:baseline-vpn-key"
                    style={{ fontSize: "24px" }}
                  />
                }
                iconPosition="start"
                label={translate("changepassword")}
                value="changepassword"
              />
              <Tab
                sx={{ minHeight: 48 }}
                icon={
                  <Iconify
                    icon="ant-design:setting-filled"
                    style={{ fontSize: "24px" }}
                  />
                }
                iconPosition="start"
                label={translate("settings")}
                value="settings"
              />
            </TabList>
          </Box>
          <TabPanel value="profile" sx={{ px: 0 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6} lg={4}>
                <ProfilePicture />
              </Grid>
              <Grid item xs={12} md={6} lg={8}>
                <ProfileForm />
              </Grid>
            </Grid>
          </TabPanel>
          <TabPanel value="changepassword" sx={{ px: 0 }}>
            <Grid container spacing={0}>
              <Grid item xs={12} md={6} lg={8}>
                <ChangePassword />
              </Grid>
            </Grid>
          </TabPanel>
          <TabPanel value="settings" sx={{ px: 0 }}>
            <Grid container spacing={0}>
              <Grid item xs={12} md={6} lg={8}>
                <SettingsForm />
              </Grid>
            </Grid>
          </TabPanel>
        </TabContext>
      </Container>
    </Page>
  );
};

export default Profile;
