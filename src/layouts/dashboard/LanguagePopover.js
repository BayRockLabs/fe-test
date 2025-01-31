import { useRef, useState } from "react";
// material
import { alpha } from "@mui/material/styles";
import { Box, MenuItem, Stack, IconButton } from "@mui/material";
// components
import MenuPopover from "../../components/MenuPopover";
import useSettings from "../../hooks/useSettings";
import { allLangs } from "../../config";
import UserAPI from "../../services/UserService";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { useSnackbar } from "notistack";
import { displayError } from "../../utils/handleErrors";
import useLocales from "../../hooks/useLocales";
import { anchorOrigin } from "../../utils/constants";

// ----------------------------------------------------------------------

export default function LanguagePopover() {
  const axiosPrivate = useAxiosPrivate();
  const { enqueueSnackbar } = useSnackbar();
  const anchorRef = useRef(null);
  const [open, setOpen] = useState(false);
  const { language, setSettings } = useSettings();
  const { translate } = useLocales();
  const currentLang =
    allLangs.filter((item) => item.value === language)?.[0] || {};

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleChangeLang = async (newLang) => {
    try {
      await UserAPI.Settings(axiosPrivate, { language: newLang });
      setSettings((prevSettings) => {
        return { ...prevSettings, language: newLang };
      });
      enqueueSnackbar(`${translate('languagepreference')} ${translate('message.save')}`,{ anchorOrigin});
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
        <img src={currentLang.icon} alt={currentLang.label} />
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
          {allLangs.map((option) => (
            <MenuItem
              key={option.value}
              selected={option.value === currentLang.value}
              onClick={() => option.value === currentLang.value ? '' : handleChangeLang(option.value)}
              sx={{ cursor: option.value === currentLang.value ? 'default' : 'pointer'}}
            >
              <Box
                component="img"
                alt={option.label}
                src={option.icon}
                sx={{ width: 28, mr: 2 }}
              />

              {option.label}
            </MenuItem>
          ))}
        </Stack>
      </MenuPopover>
    </>
  );
}
