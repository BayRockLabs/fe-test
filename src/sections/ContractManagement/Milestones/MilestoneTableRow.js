import PropTypes from "prop-types";
import useLocales from "../../../hooks/useLocales";
import * as React from "react";
import DeletePopUp from "../../../components/DeletePopUp";
import MilestoneAPI from "../../../services/MilestoneService";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import { displayError } from "../../../utils/handleErrors";
import { PATH_PAGE } from "../../../routes/paths";
import { useSnackbar } from "notistack";
import { useNavigate } from "react-router-dom";
import { TableRowWithDelete } from "../../../components/table";
import { fCapitalizeFirst } from "../../../utils/formatString";
import { fCurrency } from "../../../utils/formatNumber";
import { anchorOrigin } from "../../../utils/constants";
// ----------------------------------------------------------------------

MilestoneTableRow.propTypes = {
  row: PropTypes.object,
  selected: PropTypes.bool,
  onEditRow: PropTypes.func,
  onSelectRow: PropTypes.func,
  onDeleteRow: PropTypes.func,
};

export default function MilestoneTableRow({
  row,
  onEditRow,
  onItemClick,
  onDeleteRow,
}) {
  const { enqueueSnackbar } = useSnackbar();
  const { translate } = useLocales();
  const columns = Milestone_Table_Header(translate);
  const axiosPrivate = useAxiosPrivate();
  const [isDeletePopUp, setDeletePopUp] = React.useState(false);
  const navigate = useNavigate();
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
    // navigate(`/PATH_PAGE.contracts.milestoneDetail/${row.uuid}`);
    navigate(PATH_PAGE.contracts.milestoneDetail);
  };

  async function deleteItemRow() {
    try {
      const response = await MilestoneAPI.DeleteClient(axiosPrivate, row.uuid);
      if (response.status >= 200 && response.status < 300) {
        onDeleteRow(row);
        onCloseDeletePopup();
        enqueueSnackbar(translate("message.delete"), {anchorOrigin});
      } else {
        displayError(enqueueSnackbar, {
          message: translate("error.deleteFail"), anchorOrigin
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

export const Milestone_Table_Header = (translate) => [
  {
    id: "milestone_name",
    label: translate("milestoneName"),
    align: "left",
    format: (dataItem) =>
      dataItem?.name ? fCapitalizeFirst(dataItem.name) : "--",
  },
  {
    id: "contractsow_name",
    label: translate("contractName"),
    align: "left",
    format: (dataItem) =>
      dataItem?.contractsow_name
        ? fCapitalizeFirst(dataItem.contractsow_name)
        : "--",
  },

  {
    id: " milestones",
    label: translate("milestones"),
    align: "center",
    format: (dataItem) =>
      `${dataItem?.milestones?.length ?? 0} ${translate("milestones")}`,
  },

  {
    id: "milestone_amount",
    label: translate("milestoneAmount"),
    align: "center",
    format: (dataItem) =>
      dataItem?.milestone_total_amount
        ? fCurrency(dataItem.milestone_total_amount)
        : "--",
  },
];
