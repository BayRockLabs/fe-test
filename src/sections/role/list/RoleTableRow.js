import PropTypes from "prop-types";
import { useState } from "react";
// @mui
import { TableRow, TableCell, Typography, MenuItem } from "@mui/material";
import Iconify from "../../../components/Iconify";
import { TableMoreMenu } from "../../../components/table";
import useLocales from "../../../hooks/useLocales";

// ----------------------------------------------------------------------

RoleTableRow.propTypes = {
  row: PropTypes.object,
  onEditRow: PropTypes.func,
  onDeleteRow: PropTypes.func,
};

export default function RoleTableRow({ row, onEditRow, onDeleteRow }) {
  const { translate } = useLocales();
  const { name, description, users = [] } = row;

  const [openMenu, setOpenMenuActions] = useState(null);

  const handleOpenMenu = (event) => {
    setOpenMenuActions(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setOpenMenuActions(null);
  };

  return (
    <TableRow hover>
      <TableCell
        align="left"
        onClick={onEditRow}
        sx={{ cursor: "pointer", textDecoration: "underline" }}
      >
        <Typography variant="subtitle2" noWrap>
          {name}
        </Typography>
      </TableCell>

      <TableCell align="left">{description}</TableCell>

      <TableCell align="center">{users.length}</TableCell>

      <TableCell align="right">
        <TableMoreMenu
          open={openMenu}
          onOpen={handleOpenMenu}
          onClose={handleCloseMenu}
          actions={
            <>
              <MenuItem
                onClick={() => {
                  onDeleteRow();
                  handleCloseMenu();
                }}
                sx={{ color: "error.main" }}
              >
                <Iconify icon={"eva:trash-2-outline"} />
                {translate("delete")}
              </MenuItem>
              <MenuItem
                onClick={() => {
                  onEditRow();
                  handleCloseMenu();
                }}
              >
                <Iconify icon={"eva:edit-fill"} />
                {translate("edit")}
              </MenuItem>
            </>
          }
        />
      </TableCell>
    </TableRow>
  );
}
