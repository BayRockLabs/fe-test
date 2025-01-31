import React, { useEffect, useState } from "react";
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { SvgIcon } from "@mui/material";
import PdfDocDefault from "../../../assets/svg/PdfDocDefault";
import NoDataFound from "../../../assets/svg/no-results.svg";

import useLocales from "../../../hooks/useLocales";
import AddFormModal from "../../../components/AddFormModal";
import Item from "../../../common/Item";
import palette from "../../../theme/palette";
import PageHeader from "../../../components/PageHeader";
import { Box } from "@mui/material";
import MilestoneTable from "./MilestoneTable";
import AddMilestoneModal from "./AddMilestoneModal";
import { makeStyles } from "@mui/styles";
import MilestoneAPI from "../../../services/MilestoneService";
import useAxiosPrivate, {
  isValidResponse,
} from "../../../hooks/useAxiosPrivate";
import { useSnackbar } from "notistack";
import { displayError } from "../../../utils/handleErrors";
import { useLocation } from "react-router-dom";
import { fCurrency } from "../../../utils/formatNumber";
import LoadingScreen from "../../../components/LoadingScreen";
import { anchorOrigin } from "../../../utils/constants";

const useStyles = makeStyles((theme) => ({
  root: {
    height: "100vh",
  },
  card: {
    marginTop: theme.spacing(2),
    padding: theme.spacing(1),
  },
  title: {
    margin: theme.spacing(2),
  },
  tableContainer: {
    width: "100%",
  },
}));

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

const MilestoneDetail = () => {
  const styles = useStyles();
  const { translate } = useLocales();
  const axiosPrivate = useAxiosPrivate();
  const { enqueueSnackbar } = useSnackbar();
  const [detailData, setDetailData] = useState({});
  const [isAddModel, setAddModel] = useState(false);
  const { state } = useLocation();
  const uuid = state?.uuid;

  useEffect(() => {
    getDetail();
  }, []);

  const navigateToMilestoneModel = () => {
    setAddModel(true);
  };

  const onCloseAddMilestoneModel = () => {
    setAddModel(false);
  };

  const onDetailUpdated = () => {
    onCloseAddMilestoneModel();
    getDetail();
  };

  const onError = (message) => {
    enqueueSnackbar("MilestoneDetail - " + message, {
      anchorOrigin,
      variant: "error",
    });
  };

  async function onDetailLoaded(data) {
    setDetailData(data);
  }

  async function getDetail() {
    try {
      const response = await MilestoneAPI.DETAIL(axiosPrivate, uuid);

      if (isValidResponse(response)) {
        onDetailLoaded(response.data);
      } else {
        onError(translate("error.fetch"));
      }
    } catch (error) {
      console.log("Error in Contract.getClientDetail() - ", error);
      onError(translate("error.fetch"));
    }
  }

  function getFormattedValue(value) {
    return value ?? "--";
  }

  return (
    <>
      <div className={styles.root}>
        <PageHeader
          primaryTitle={translate("Milestones")}
          buttonText={translate("edit")}
          showBack={true}
          onClickButton={navigateToMilestoneModel}
          screen="Milestone"
        />
        <Box spacing={2} height="100vh">
          <Box xs={12}>
            {detailData === null ? (
              <LoadingScreen isDashboard={false} />
            ) : (
              <>
                <Card className={styles.card}>
                  <Stack spacing={1}>
                    <Grid
                      container
                      spacing={{ xs: 2, md: 3 }}
                      columns={{ xs: 4, sm: 8, md: 12 }}
                    >
                      <Grid xs={2} sm={4} md={4}>
                        <DetailItem
                          label={translate("MILESTONES.MILESTONE_NAME")}
                          value={getFormattedValue(detailData.name)}
                        />
                      </Grid>
                      <Grid xs={2} sm={4} md={4}>
                        <DetailItem
                          label={translate("CONTRACTS.CONTRACT_NAME")}
                          value={getFormattedValue(detailData.contractsow_name)}
                        />
                      </Grid>
                      <Grid xs={2} sm={4} md={4}>
                        <DetailItem
                          label={translate("milestoneAmount")}
                          value={
                            detailData.milestone_total_amount
                              ? fCurrency(detailData.milestone_total_amount)
                              : "--"
                          }
                        />
                      </Grid>
                    </Grid>
                  </Stack>
                </Card>
                <Card className={styles.card} sx={{ marginTop: "20px" }}>
                  <Box spacing={1} sx={{ p: 2 }}>
                    <Typography variant="h6">
                      {translate(" Milestones")}
                    </Typography>
                  </Box>
                  <Box className={styles.tableContainer}>
                    <MilestoneTable tableData={detailData.milestones ?? []} />
                  </Box>
                </Card>
              </>
            )}
          </Box>
        </Box>
        {isAddModel && (
          <AddFormModal onClose={onCloseAddMilestoneModel}>
            <AddMilestoneModal
              mileStoneData={detailData}
              handleClose={onCloseAddMilestoneModel}
              setOpen={isAddModel}
              onAddMilestone={onDetailUpdated}
            />
          </AddFormModal>
        )}
      </div>
    </>
  );
};

export default MilestoneDetail;
