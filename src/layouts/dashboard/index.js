import { useState } from "react";
import { Outlet } from "react-router-dom";
// material
import { styled } from "@mui/material/styles";
//
import DashboardSidebar from "./DashboardSidebar";
import { ClientProvider } from "../../contexts/ClientContext";
import { TimesheetProvider } from "../../contexts/TimesheetContext";

// ----------------------------------------------------------------------

const RootStyle = styled("div")({
  display: "flex",
  minHeight: "100%",
  overflow: "hidden",
});

const MainStyle = styled("div")(({ theme }) => ({
  flexGrow: 1,
  overflow: "auto",
  minHeight: "100%",
  paddingBottom: theme.spacing(10),
  backgroundColor: theme.palette.common.white,
}));

// ----------------------------------------------------------------------

export default function DashboardLayout() {
  const [open, setOpen] = useState(false);

  return (
    <RootStyle>
      <ClientProvider>
        <TimesheetProvider>
          <DashboardSidebar
            isOpenSidebar={open}
            onCloseSidebar={() => setOpen(false)}
          />

          <MainStyle>
            <Outlet />
          </MainStyle>
        </TimesheetProvider>
      </ClientProvider>
    </RootStyle>
  );
}
