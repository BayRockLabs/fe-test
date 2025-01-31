import PropTypes from "prop-types";
import useLocales from "../../../hooks/useLocales";
import * as React from "react";
import DeletePopUp from "../../../components/DeletePopUp";
import PricingAPI from "../../../services/PricingService";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import { displayError } from "../../../utils/handleErrors";
import { useSnackbar } from "notistack";
import { TableRowWithDelete } from "../../../components/table";
import { PATH_PAGE } from "../../../routes/paths";
import { useNavigate } from "react-router-dom";
import { fCurrency } from "../../../utils/formatNumber";
import { fCapitalizeFirst } from "../../../utils/formatString";
import { anchorOrigin } from "../../../utils/constants";
// ----------------------------------------------------------------------

PricingTableRow.propTypes = {
  row: PropTypes.object,
  selected: PropTypes.bool,
  onEditRow: PropTypes.func,
  onSelectRow: PropTypes.func,
  onDeleteRow: PropTypes.func,
};

export default function PricingTableRow({
  row,
  onEditRow,
  onItemClick,
  onDeleteRow,
  columns,
}) {
  const { translate } = useLocales();
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
    navigate(PATH_PAGE.estimation.pricingDetail, { state: { data: row.uuid } });
  };

  async function deleteItemRow() {
    try {
      const response = await PricingAPI.DELETE(axiosPrivate, row.uuid);
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

export const Pricing_Table_Header = [
  {
    id: "name",
    label: "Pricing Name",
    align: "left",
    format: (dataItem) =>
      dataItem?.name ? fCapitalizeFirst(dataItem.name) : "--",
  },
  {
    id: "estimation_name",
    label: "Estimation Name",
    align: "left",
    format: (dataItem) =>
      dataItem?.estimation_name
        ? fCapitalizeFirst(dataItem.estimation_name)
        : "--",
  },

  {
    id: "discount",
    label: "Discount",
    align: "center",
    format: (dataItem) =>
      dataItem?.discount !== undefined ? `${dataItem.discount}%` : "--",
  },

  {
    id: "final_offer_price",
    label: "Final Offer Price",
    align: "center",
    format: (dataItem) =>
      dataItem?.final_offer_price
        ? fCurrency(dataItem.final_offer_price)
        : "--",
  },
  {
    id: "final_offer_margin",
    label: "Final Offer GM(%)",
    align: "center",
    format: (dataItem) =>
      dataItem?.final_offer_margin
        ? `${dataItem.final_offer_gross_margin_percentage}%`
        : "--",
  },
];
