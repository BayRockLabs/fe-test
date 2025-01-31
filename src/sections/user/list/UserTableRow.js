import PropTypes from "prop-types";
import { useState } from "react";
import { TableRow, TableCell, MenuItem, Stack } from "@mui/material";
// components
import Iconify from "../../../components/Iconify";
import { TableMoreMenu } from "../../../components/table";
import { fToNow } from "../../../utils/formatTime";
import useLocales from "../../../hooks/useLocales";

// ----------------------------------------------------------------------

UserTableRow.propTypes = {
  row: PropTypes.object,
  selected: PropTypes.bool,
  onEditRow: PropTypes.func,
  onSelectRow: PropTypes.func,
  onDeleteRow: PropTypes.func,
};

export default function UserTableRow({ row, onEditRow, onDeleteRow }) {
  const { translate } = useLocales();
  const {
    first_name,
    last_name,
    username,
    email,
    email_verified,
    phone_number,
    phone_number_verified,
    last_login,
  } = row;

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
        {first_name}
      </TableCell>
      <TableCell align="left">{last_name}</TableCell>
      <TableCell align="left">{username}</TableCell>
      <TableCell align="left">
        {email ? (
          <Stack direction="row" alignItems="center">
            <Iconify
              icon={
                email_verified
                  ? "eva:checkmark-circle-fill"
                  : "eva:clock-outline"
              }
              sx={{
                width: 20,
                height: 20,
                color: "success.main",
                ...(!email_verified && { color: "warning.main" }),
                mr: 1,
              }}
            />{" "}
            {email}
          </Stack>
        ) : (
          email
        )}
      </TableCell>

      <TableCell align="left" valign="center">
        {phone_number ? (
          <Stack direction="row" alignItems="center">
            <Iconify
              icon={
                phone_number_verified
                  ? "eva:checkmark-circle-fill"
                  : "eva:clock-outline"
              }
              sx={{
                width: 20,
                height: 20,
                color: "success.main",
                ...(!phone_number_verified && { color: "warning.main" }),
                mr: 1,
              }}
            />{" "}
            {phone_number}
          </Stack>
        ) : (
          phone_number
        )}
      </TableCell>
      <TableCell align="left">{last_login ? fToNow(last_login) : ""}</TableCell>

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
