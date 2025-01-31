import PropTypes from "prop-types";
import useLocales from "../../hooks/useLocales";
import * as React from "react";
import DeletePopUp from "../../components/DeletePopUp";
import ContractAPI from "../../services/ContractService";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { displayError } from "../../utils/handleErrors";
import { useSnackbar } from "notistack";
import { TableRowWithDelete } from "../../components/table";
import { PATH_PAGE } from "../../routes/paths";
import { useNavigate } from "react-router-dom";
import { fDateMDY } from "../../utils/formatTime";
import { fCurrency } from "../../utils/formatNumber";
import { fCapitalizeFirst } from "../../utils/formatString";
import { anchorOrigin } from "../../utils/constants";
// ----------------------------------------------------------------------

ContractTableRow.propTypes = {
  row: PropTypes.object,
  selected: PropTypes.bool,
  onEditRow: PropTypes.func,
  onSelectRow: PropTypes.func,
  onDeleteRow: PropTypes.func,
};

export default function ContractTableRow({
  row,
  onEditRow,
  onItemClick,
  onDeleteRow,
  columns,
}) {
  const { translate } = useLocales();
  const { enqueueSnackbar } = useSnackbar();
  const axiosPrivate = useAxiosPrivate();
  const navigate = useNavigate();
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
  const handleClickRow = (row) => {
    const uuid = row.uuid;
    navigate(PATH_PAGE.contracts.detail, { state: { uuid } });
  };

  async function deleteItemRow() {
    try {
      const response = await ContractAPI.DELETE(axiosPrivate, row.uuid);
      if (response.status >= 200 && response.status < 300) {
        onDeleteRow(row);
        onCloseDeletePopup();
        enqueueSnackbar(translate("message.delete"), {anchorOrigin});
      } else {
        displayError(enqueueSnackbar, {
          message: translate("error.deleteFail"),
          anchorOrigin
        });
      }
    } catch (error) {
      displayError(enqueueSnackbar, error, {anchorOrigin});
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

export const Contract_Table_Header = [
  {
    id: "contract_name",
    label: "Contract Name",
    align: "left",
    format: (dataItem) =>
      dataItem?.contractsow_name
        ? fCapitalizeFirst(dataItem.contractsow_name)
        : "--",
  },
  {
    id: "contract_amount",
    label: "Amount",
    align: "center",
    format: (dataItem) =>
      dataItem?.total_contract_amount !== undefined
        ? (dataItem.total_contract_amount === 0
            ? "$ 0" 
            : fCurrency(dataItem.total_contract_amount) 
          )
        : "--",
  },
  {
    id: "tstart_date",
    label: "Start Date",
    align: "center",
    format: (dataItem) =>
      dataItem?.start_date ? fDateMDY(dataItem.start_date) : "--",
  },
  {
    id: "end_date",
    label: "End Date",
    align: "center",
    format: (dataItem) =>
      dataItem?.end_date ? fDateMDY(dataItem.end_date) : "--",
  },
  {
    id: "contract_type",
    label: "Contract Type",
    align: "center",
    format: (dataItem) =>
      dataItem?.contractsow_type ? dataItem.contractsow_type : "--",
  },
  {
    id: "pt_contract",
    label: "Payment Terms",
    align: "center",
    format: (dataItem) =>
      dataItem?.payment_term_contract ? dataItem.payment_term_contract : "--",
  },
];
