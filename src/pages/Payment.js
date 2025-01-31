import { Card, Container, Grid } from "@mui/material";
import HeaderBreadcrumbs from "../components/HeaderBreadcrumbs";
import Page from "../components/Page";
import useLocales from "../hooks/useLocales";
import { PATH_PAGE } from "../routes/paths";
import Paypal from "../sections/payment/paypal";

function Payment() {
  const { translate } = useLocales();
  return (
    <Page title={translate("payment")}>
      <Container>
        <HeaderBreadcrumbs
          heading={translate("payment")}
          links={[
            { name: translate("dashboard"), href: PATH_PAGE.dashboard },
            { name: translate("payment") },
          ]}
        />
        <Grid container spacing={0}>
          <Grid item xs={12} md={6} lg={6}>
            <Card sx={{ p: 3 }}>
              <Paypal />
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Page>
  );
}

export default Payment;
