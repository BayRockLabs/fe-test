// material
import { styled } from "@mui/material/styles";
import { Box, Drawer } from "@mui/material";
import useResponsive from "../../hooks/useResponsive";
// components
import Scrollbar from "../../components/Scrollbar";
import NavSectionPermissionDenied from "../../components/NavSectionPermissionDenied";
//
import { DashboardNavConfigPermissionDenied } from "./NavConfig";
import MpsLogo from "../../assets/bayrock-logo.png";
import useLocales from "../../hooks/useLocales";

// ----------------------------------------------------------------------

const DRAWER_WIDTH = 280;

const RootStyle = styled("div")(({ theme }) => ({
  [theme.breakpoints.up("lg")]: {
    flexShrink: 0,
    width: DRAWER_WIDTH,
  },
}));

// ----------------------------------------------------------------------
export default function DashboardSidebarPermissionDenied() {
  const isDesktop = useResponsive("up", "lg");
  const { translate } = useLocales();

  const RenderContent = () => {
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
          sx={{
            px: 2.5,
            py: 3,
            display: "flex",
            flexDirection: "row",
            backgroundColor: "background.dark",
          }}
        >
          <img alt="MAtchPoint" src={MpsLogo} />
        </Box>

        <NavSectionPermissionDenied 
          navConfig={
            DashboardNavConfigPermissionDenied(translate)
          }
        />
      </Scrollbar>
    );
  };

  return (
    <RootStyle>
      {!isDesktop && (
        <Drawer
          PaperProps={{
            sx: { width: DRAWER_WIDTH },
          }}
        >
          <RenderContent/>
        </Drawer>
      )}

      {isDesktop && (
        <Drawer
          open
          variant="persistent"
          PaperProps={{
            sx: {
              width: DRAWER_WIDTH,
              bgcolor: "background.default",
              borderRightStyle: "dashed",
            },
          }}
        >
          <RenderContent />
        </Drawer>
      )}
    </RootStyle>
  );
}
