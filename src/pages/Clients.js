import { Outlet } from "react-router-dom";

import { Container } from "@mui/material";

export default function Clients() {
  return (
    <Container maxWidth={"lg"}>
      <Outlet />
    </Container>
  );
}
