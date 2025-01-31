import { useRef, useState } from "react";
// material
import { alpha } from "@mui/material/styles";
import { MenuItem, Stack, IconButton } from "@mui/material";
// components
import MenuPopover from "../../components/MenuPopover";
import useSettings from "../../hooks/useSettings";
import { themeMode } from "../../config";
import Iconify from "../../components/Iconify";
import UserAPI from "../../services/UserService";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { useSnackbar } from "notistack";
import { displayError } from "../../utils/handleErrors";
import useLocales from "../../hooks/useLocales";
import { anchorOrigin } from "../../utils/constants";

// ----------------------------------------------------------------------

export default function ThemePopover() {
  const axiosPrivate = useAxiosPrivate();
  const { enqueueSnackbar } = useSnackbar();
  const anchorRef = useRef(null);
  const [open, setOpen] = useState(false);
  const { theme, setSettings } = useSettings();
  const { translate } = useLocales();

  const currentTheme =
    themeMode.filter((item) => item.value === theme)?.[0] || {};

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleChangeTheme = async (newTheme) => {
    try {
      await UserAPI.Settings(axiosPrivate, { theme: newTheme });
      setSettings((prevSettings) => {
        return { ...prevSettings, theme: newTheme };
      });
      enqueueSnackbar(`${translate('themepreference')} ${translate('message.save')}`, {anchorOrigin});
      handleClose();
    } catch (error) {
      displayError(enqueueSnackbar, error, {anchorOrigin});
    }
  };

  return (
    <>
      <IconButton
        ref={anchorRef}
        onClick={handleOpen}
        sx={{
          padding: 0,
          width: 44,
          height: 44,
          ...(open && {
            bgcolor: (theme) =>
              alpha(
                theme.palette.primary.main,
                theme.palette.action.focusOpacity
              ),
          }),
        }}
      >
        <Iconify icon={currentTheme.icon} width={28} height={28} />
      </IconButton>

      <MenuPopover
        open={open}
        onClose={handleClose}
        anchorEl={anchorRef.current}
        sx={{
          mt: 1.5,
          ml: 0.75,
          width: 180,
          "& .MuiMenuItem-root": {
            px: 1,
            typography: "body2",
            borderRadius: 0.75,
          },
        }}
      >
        <Stack spacing={0.75}>
          {themeMode.map((option) => (
            <MenuItem
              key={option.value}
              selected={option.value === currentTheme.value}
              onClick={() => option.value === currentTheme.value ? '' : handleChangeTheme(option.value)}
              sx={{ cursor: option.value === currentTheme.value ? 'default' : 'pointer'}}
            >
              <Iconify
                icon={option.icon}
                width={28}
                height={28}
                sx={{ mr: 2 }}
              />
              {option.label}
            </MenuItem>
          ))}
        </Stack>
      </MenuPopover>
    </>
  );
}
