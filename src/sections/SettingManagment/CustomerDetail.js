import * as React from "react";
import Card from "@mui/material/Card";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { Grid } from "@mui/material";
import { useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import CustomerAPI from "../../services/CustomerService";
import Item from "../../common/Item";
import useLocales from "../../hooks/useLocales";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import AddCustomerAccess from "./CustomerAccess";
import { fCapitalizeFirst } from "../../utils/formatString";
import PageHeader from "../../components/PageHeader";
import LoadingScreen from "../../components/LoadingScreen";
import AddFormModal from "../../components/AddFormModal";
const DetailItem = ({ label, value }) => (
  <Item sx={{ alignItems: "baseline" }}>
    <Typography variant="body2" color="textSecondary">
      {label}
    </Typography>
    <Typography
      variant="subtitle2"
      color="textPrimary"
      sx={{
        width: "200px",
        whiteSpace: "normal",
        wordBreak: "break-word",
        marginBottom: "4px", // Adds space between names
        textAlign: "left",
      }}
    >
      {value}
    </Typography>
  </Item>
);

export default function CustomerDetails() {
  const { translate } = useLocales();

  const [isAddModel, setAddModel] = React.useState(false);

  const location = useLocation();
  const axiosPrivate = useAxiosPrivate();

  const uuid = location.state.data;
  const [CustomerData, setCustomerData] = useState(null);
  console.log("Data", CustomerData);

  const openAddCustomerModel = () => {
    setAddModel(true);
  };

  const onCloseAddCustomerModel = () => {
    setAddModel(false);
  };

  async function getSingleCustomer(uuid) {
    try {
      const response = await CustomerAPI.DETAIL(axiosPrivate, uuid);
      setCustomerData(response.data);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    getSingleCustomer(uuid);
  }, [uuid]);

  const onCustomerUpdated = () => {
    onCloseAddCustomerModel();
    getSingleCustomer(uuid);
  };

  function getPagePrimaryText() {
    return (
      fCapitalizeFirst(CustomerData?.customer_name ?? "") +
      " " +
      translate("overview")
    );
  }
  return (
    <>
      <PageHeader
        primaryTitle={getPagePrimaryText()}
        buttonText={translate("edit")}
        showBack={true}
        onClickButton={openAddCustomerModel}
        // buttonStyle={
        //   isButtonDisabled ? { opacity: 0.3, pointerEvents: "none" } : {}
        // }
        // isPricingDisabled={isButtonDisabled}
        screen="Customer"
        showSecondaryTitle={false}
      />
      <Box spacing={2} height="100vh">
        <Box xs={12}>
          {CustomerData === null ? (
            <LoadingScreen isDashboard={false} />
          ) : (
            <>
              <Card>
                <Stack spacing={1} sx={{ p: 3 }}>
                  <Grid container columns={{ xs: 4, sm: 8, md: 12 }}>
                    <Grid xs={2} sm={4} md={4}>
                      <DetailItem
                        label={translate("CustomerAccess.name")}
                        value={CustomerData?.customer_name}
                      />
                    </Grid>
                    <Grid xs={2} sm={4} md={4}>
                      <DetailItem
                        label={translate("CustomerAccess.email")}
                        value={CustomerData?.customer_email}
                      />
                    </Grid>
                    <Grid xs={2} sm={4} md={4}>
                      <DetailItem
                        label={translate("CustomerAccess.associate_clients")}
                        value={
                          CustomerData?.associated_clients
                            ?.map((client) => client.client_name)
                            .join(", ") || "N/A"
                        }
                      />
                    </Grid>
                  </Grid>
                </Stack>
              </Card>
            </>
          )}
        </Box>
      </Box>

      {isAddModel && (
        <AddFormModal onClose={onCloseAddCustomerModel}>
          <AddCustomerAccess
            handleClose={onCloseAddCustomerModel}
            setOpen={isAddModel}
            detailData={CustomerData}
            onCustomerAdded={onCustomerUpdated}
          />
        </AddFormModal>
      )}
    </>
  );
}
