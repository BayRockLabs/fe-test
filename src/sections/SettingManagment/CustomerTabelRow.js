import { useSnackbar } from "notistack";
import PropTypes from "prop-types";

import * as React from "react";
import { useNavigate } from "react-router-dom";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { displayError } from "../../utils/handleErrors";
import useLocales from "../../hooks/useLocales";
import { PATH_PAGE } from "../../routes/paths";
import { anchorOrigin } from "../../utils/constants";
import DeletePopUp from "../../components/DeletePopUp";
import { TableRowWithDelete } from "../../components/table";
import CustomerAPI from "../../services/CustomerService";
import { fCapitalizeFirst } from "../../utils/formatString";

// ----------------------------------------------------------------------

CustomerTabelRow.propTypes = {
  row: PropTypes.object,
  selected: PropTypes.bool,
  onEditRow: PropTypes.func,
  onSelectRow: PropTypes.func,
  onDeleteRow: PropTypes.func,
};

export default function CustomerTabelRow({
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
    setDeletePopUp(false);
  };
  const onCloseDeletePopup = () => {
    setDeletePopUp(false);
  };

  const handleDelete = () => {
    deleteItemRow();
  };
  const handleClickRow = () => {
    navigate(PATH_PAGE.setting.customerdeatil, { state: { data: row.id } });
  };

  async function deleteItemRow() {
    try {
      const response = await CustomerAPI.DELETE(axiosPrivate, row.id);
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

export const Customer_Tabel_Header = [
  {
    id: "customer_name",
    label: "Customer Name",
    align: "left",
    format: (dataItem) =>
      dataItem?.customer_name ? fCapitalizeFirst(dataItem.customer_name) : "--",
  },
  {
    id: "customer_email",
    label: "Customer Email",
    align: "left",
    format: (dataItem) =>
      dataItem?.customer_email
        ? fCapitalizeFirst(dataItem.customer_email)
        : "--",
  },

  {
    id: "associated_clients",
    label: "Associated Client",
    align: "center",
    format: (dataItem) =>
      dataItem?.associated_clients
        ?.map((client) => client.client_name)
        .join(", ") || "--",
  },
];
