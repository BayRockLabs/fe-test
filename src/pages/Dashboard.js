import { Container } from "@mui/material";

import Page from "../components/Page";
import ClientList from "../sections/clients/ClientList";

export default function Dashboard() {
  return (
    <Page title={"MPS - C2C"}>
      <Container maxWidth={"lg"}>
        <ClientList />
      </Container>
    </Page>
  );
}
