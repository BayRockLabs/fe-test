import PropTypes from "prop-types";
import useLocales from "../../../hooks/useLocales";
import * as React from "react";
import DeletePopUp from "../../../components/DeletePopUp";
import PurchaseOrderAPI from "../../../services/PurchaseOrderService";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import { displayError } from "../../../utils/handleErrors";
import { useSnackbar } from "notistack";
import LinearProgress from "@mui/material/LinearProgress";
import pdfImage from "../../../assets/svg/image.svg";
import { TableRowWithDelete } from "../../../components/table";
import { Box } from "@mui/material";
import { PATH_PAGE } from "../../../routes/paths";
import { useNavigate } from "react-router-dom";
import { anchorOrigin } from "../../../utils/constants";
// ----------------------------------------------------------------------

PurchaseOrderTableRow.propTypes = {
  row: PropTypes.object,
  selected: PropTypes.bool,
  onEditRow: PropTypes.func,
  onSelectRow: PropTypes.func,
  onDeleteRow: PropTypes.func,
};

export default function PurchaseOrderTableRow({
  row,
  onEditRow,
  onItemClick,
  onDeleteRow,
}) {
  const { translate } = useLocales();

  const columns = PurchaseOrderTableHeader(translate);

  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const axiosPrivate = useAxiosPrivate();
  const [isDeletePopUp, setDeletePopUp] = React.useState(false);

  const onOpenDeletePopup = () => {
    setDeletePopUp(true);
  };

  const onCloseDeletePopup = () => {
    setDeletePopUp(false);
  };

  const handleDelete = () => {
    deleteItemRow();
  };

  const handleClickRow = () => {
    navigate(PATH_PAGE.contracts.purchaseOrderDetail, {
      state: { data: row.id },
    });
  };
  async function deleteItemRow() {
    try {
      const response = await PurchaseOrderAPI.DELETE(axiosPrivate, row.uuid);
      if (response.status >= 200 && response.status < 300) {
        onDeleteRow(row);
        onCloseDeletePopup();
        enqueueSnackbar(translate("message.delete"), { anchorOrigin });
      } else {
        displayError(enqueueSnackbar, {
          message: translate("error.deleteFail"),
          anchorOrigin,
        });
      }
    } catch (error) {
      displayError(enqueueSnackbar, error, { anchorOrigin });
    }
  }

  return (
    <>
      <TableRowWithDelete
        row={row}
        columns={columns}
        onEditRow={onEditRow}
        onDeleteRow={onOpenDeletePopup}
        onItemClick={handleClickRow}
      />

      {isDeletePopUp && (
        <DeletePopUp onClose={onCloseDeletePopup} onDelete={handleDelete} />
      )}
    </>
  );
}
export const PurchaseOrderTableHeader = (translate) => [
  // {
  //   id: "contractsow_name",
  //   label: translate("PurchaseOrder.CONTRACT_NAME"),
  //   align: "left",
  //   format: (dataItem) => {
  //     console.log(dataItem, "data");
  //     return dataItem?.contract_sow_name ?? "--";
  //   },
  // },
  {
    id: "purchase_order_name",
    label: translate("PurchaseOrder.PO_NAME"),
    align: "left",
    format: (dataItem) =>
      dataItem?.purchase_order_name ? dataItem.purchase_order_name : "--",
  },

  {
    id: "contract_sow_name",
    label: "Contract Name",
    align: "left",
    format: (dataItem) => {
      if (dataItem?.utilized_amounts && dataItem.utilized_amounts.length > 0) {
        return dataItem.utilized_amounts
          .map((item) => item.contractsow_name)
          .join(", ");
      }
      return "NA";
    },
  },
  {
    id: "account_number",
    label: translate("PurchaseOrder.ACCOUNT_NUMBER"),
    align: "left",
    format: (dataItem) =>
      dataItem?.account_number ? dataItem.account_number : "--",
  },
  {
    id: "po_amount",
    label: translate("PurchaseOrder.PO_AMOUNT"),
    align: "center",
    format: (dataItem) =>
      dataItem?.po_amount ? parseFloat(dataItem.po_amount).toFixed(2) : "--",
  },
  {
    id: "amount_utilized",
    label: translate("PurchaseOrder.AMOUNT_UTILIZED"),
    align: "center",
    format: (dataItem) => {
      if (dataItem?.utilized_amounts !== undefined) {
        // Calculate the total utilized amount
        const totalUtilizedAmount = dataItem.utilized_amounts.reduce(
          (sum, item) => sum + parseFloat(item.utilized_amount),
          0
        );

        // Calculate the percentage of the utilized amount relative to the purchase order amount
        const purchaseOrderAmount = dataItem.po_amount; // Assuming purchase_order_amount is available in dataItem
        const progressValue = (totalUtilizedAmount / purchaseOrderAmount) * 100;
        const finalValu = progressValue.toFixed(1);
        const progressBarColor = finalValu == 100 ? "primary" : "success";

        return (
          <Box style={{ display: "flex", alignItems: "center" }}>
            <span style={{ marginRight: "10%" }}>{finalValu}%</span>
            <LinearProgress
              variant="determinate"
              value={finalValu}
              sx={{ width: "30%", height: 8, borderRadius: 5 }}
              color={progressBarColor}
            />
          </Box>
        );
      } else {
        return "--";
      }
    },
  },

  {
    id: "start_date",
    label: translate("PurchaseOrder.START_DATE"),
    align: "center",
    format: (dataItem) => (dataItem?.start_date ? dataItem.start_date : "--"),
  },
  // {
  //   id: "end_date",
  //   label: translate("PurchaseOrder.END_DATE"),
  //   align: "center",
  //   format: (dataItem) => (dataItem?.end_date ? dataItem.end_date : "--"),
  // },
];
