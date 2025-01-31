import React, { useState } from "react";
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import PdfDocDefault from "../../../assets/svg/PdfDocDefault";
import useLocales from "../../../hooks/useLocales";
import AddFormModal from "../../../components/AddFormModal";
import Item from "../../../common/Item";
import PageHeader from "../../../components/PageHeader";
import { Box, LinearProgress } from "@mui/material";
import AddPurcahseOrderModal from "./AddPurchaseOrderModal";
import PurchaseOrderAPI from "../../../services/PurchaseOrderService";
import { useLocation } from "react-router-dom";
import { fCapitalizeFirst } from "../../../utils/formatString";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import { useEffect } from "react";
import PreviewContractFile from "../PreviewContractFile";
import LoadingScreen from "../../../components/LoadingScreen";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Divider from "@mui/material/Divider";

const DetailItem = ({ label, value }) => (
  <Item sx={{ alignItems: "baseline" }}>
    <Typography
      className="text-base text-gray-900_02 w-auto"
      size="txtInterBold16"
      variant="body1"
    >
      {label}
    </Typography>
    <Typography
      className="text-base text-dark w-auto"
      size="txtInterBold16"
      variant="subtitle2"
      align="center"
    >
      {value}
    </Typography>
  </Item>
);

const PurchaseOrderDetail = () => {
  const { translate } = useLocales();
  const [isAddModel, setAddModel] = useState(false);
  const axiosPrivate = useAxiosPrivate();
  const location = useLocation();
  const id = location.state?.data;

  const [purchaseOrderData, setPurchaseOrderData] = useState(null);

  const navigateToContractModel = () => {
    setAddModel(true);
  };

  const onCloseAddPurchaseOrderModal = () => {
    setAddModel(false);
  };

  const getSinglePurchaseOrder = async (orderId) => {
    try {
      const response = await PurchaseOrderAPI.GetPurchaseOrderDetail(
        axiosPrivate,
        orderId
      );
      setPurchaseOrderData(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (id) {
      getSinglePurchaseOrder(id);
    }
  }, [id]);

  const onDetailUpdated = () => {
    onCloseAddPurchaseOrderModal();
    getSinglePurchaseOrder(id);
  };

  function getPagePrimaryText() {
    return (
      fCapitalizeFirst(purchaseOrderData?.name ?? "") +
      " " +
      translate("overview")
    );
  }
  const purchaseOrderAmount = parseFloat(purchaseOrderData?.po_amount);
  const totalUtilizedAmount = purchaseOrderData?.utilized_amounts.reduce(
    (sum, item) => sum + parseFloat(item.utilized_amount),
    0
  );

  const progressValue = (totalUtilizedAmount / purchaseOrderAmount) * 100;
  const finalValu = progressValue.toFixed(1);
  const progressBarColor = finalValu == 100 ? "primary" : "success";
  const contractSowNames = purchaseOrderData?.utilized_amounts
    .map((item) => item.contractsow_name)
    .join(", ");
  return (
    <>
      <PageHeader
        primaryTitle={getPagePrimaryText()}
        buttonText={translate("edit")}
        showBack={true}
        onClickButton={navigateToContractModel}
        screen="PO"
      />
      <Box spacing={2} height="100vh">
        <Box xs={12}>
          {purchaseOrderData === null ? (
            <LoadingScreen isDashboard={false} />
          ) : (
            <>
              <Card>
                <Stack spacing={1} sx={{ p: 3 }}>
                  <Grid
                    container
                    spacing={{ xs: 2, md: 3 }}
                    columns={{ xs: 4, sm: 8, md: 12 }}
                  >
                    <Grid xs={2} sm={4} md={4}>
                      <DetailItem
                        label={translate("CONTRACTS.CONTRACT_NAME")}
                        value={contractSowNames ? contractSowNames : "NA"}
                      />
                    </Grid>
                    <Grid xs={2} sm={4} md={4}>
                      <DetailItem
                        label={translate("PurchaseOrder.PO_NAME")}
                        value={purchaseOrderData?.purchase_order_name ?? ""}
                      />
                    </Grid>
                    <Grid xs={2} sm={4} md={4}>
                      <DetailItem
                        label={translate("PurchaseOrder.ACCOUNT_NUMBER")}
                        value={purchaseOrderData?.account_number ?? ""}
                      />
                    </Grid>
                    <Grid xs={2} sm={4} md={4}>
                      <DetailItem
                        label={translate("PurchaseOrder.PO_AMOUNT")}
                        value={purchaseOrderData?.po_amount ?? ""}
                      />
                    </Grid>
                    <Grid xs={2} sm={4} md={4}>
                      <DetailItem
                        label={translate("PurchaseOrder.START_DATE")}
                        value={
                          purchaseOrderData?.start_date
                            ? purchaseOrderData?.start_date
                            : "--"
                        }
                      />
                    </Grid>
                    <Grid xs={2} sm={4} md={4}>
                      <DetailItem
                        label={translate("PurchaseOrder.END_DATE")}
                        value={
                          purchaseOrderData?.end_date
                            ? purchaseOrderData?.end_date
                            : "--"
                        }
                      />
                    </Grid>
                    <Grid xs={2} sm={4} md={4}>
                      <DetailItem
                        label={translate("PurchaseOrder.AMOUNT_UTILIZED")}
                      />
                      <Box
                        style={{
                          marginTop: "-12px",
                          display: "flex",
                          alignItems: "center",
                          marginLeft: "13px",
                        }}
                      >
                        <span style={{ marginRight: "10%" }}>{finalValu}%</span>
                        <LinearProgress
                          variant="determinate"
                          value={finalValu}
                          sx={{ width: "30%", height: 8, borderRadius: 5 }}
                          color={progressBarColor}
                        />
                      </Box>
                    </Grid>
                    <Grid xs={2} sm={4} md={4}>
                      {purchaseOrderData?.purchase_order_documents?.length >
                        0 && (
                        <Stack>
                          <Typography
                            variant="body1"
                            color="textSecondary"
                            sx={{ paddingLeft: 2, paddingTop: 2 }}
                          >
                            {translate("PurchaseOrder.PO_DOCUMENT")}
                          </Typography>

                          <PreviewContractFile
                            filesData={
                              purchaseOrderData?.purchase_order_documents
                            }
                          />
                        </Stack>
                      )}
                    </Grid>
                  </Grid>
                </Stack>
              </Card>
              {purchaseOrderData?.utilized_amounts.length > 0 && (
                <Card sx={{ mt: 3 }}>
                  <Box spacing={1} sx={{ p: 2 }}>
                    <Typography variant="h6">
                      {translate(" Contracts")}
                    </Typography>
                  </Box>
                  <TableContainer>
                    <Table>
                      <TableHead sx={{ mt: 5 }}>
                        <TableRow>
                          <TableCell>
                            <strong>{translate("Contract Name")}</strong>
                          </TableCell>
                          <TableCell>
                            <strong>{translate("Amount")}</strong>
                          </TableCell>
                          <TableCell>
                            <strong>{translate("Amount Utilized (%)")}</strong>
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {purchaseOrderData?.utilized_amounts.map(
                          (contract, index) => {
                            const utilizedPercentage = (
                              (parseFloat(contract.utilized_amount) /
                                purchaseOrderAmount) *
                              100
                            ).toFixed(1);

                            return (
                              <React.Fragment key={contract.id}>
                                <TableRow>
                                  <TableCell>
                                    {contract.contractsow_name}
                                  </TableCell>
                                  <TableCell>
                                    $
                                    {parseFloat(
                                      contract.utilized_amount
                                    ).toFixed(2)}
                                  </TableCell>
                                  <TableCell>
                                    <Box display="flex" alignItems="center">
                                      <span style={{ marginRight: "10%" }}>
                                        {utilizedPercentage}%
                                      </span>
                                      <LinearProgress
                                        variant="determinate"
                                        value={utilizedPercentage}
                                        sx={{
                                          width: "30%",
                                          height: 8,
                                          borderRadius: 5,
                                        }}
                                        color={
                                          utilizedPercentage == 100
                                            ? "primary"
                                            : "success"
                                        }
                                      />
                                    </Box>
                                  </TableCell>
                                </TableRow>
                                {index <
                                  purchaseOrderData.utilized_amounts.length -
                                    1 && <Divider />}
                              </React.Fragment>
                            );
                          }
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Card>
              )}
            </>
          )}
        </Box>
      </Box>
      {isAddModel && (
        <AddFormModal onClose={onCloseAddPurchaseOrderModal}>
          <AddPurcahseOrderModal
            handleClose={onCloseAddPurchaseOrderModal}
            setOpen={isAddModel}
            purchaseOrderData={purchaseOrderData}
            onPurchaseOrderAdded={onDetailUpdated}
          />
        </AddFormModal>
      )}
    </>
  );
};

export default PurchaseOrderDetail;
