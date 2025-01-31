import { Alert, Box, Card, CardHeader, Stack } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import * as Yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useSnackbar } from "notistack";

import { FormProvider, RHFSelectField } from "../../components/hook-form";
import UserAPI from "../../services/UserService";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { displayError } from "../../utils/handleErrors";
import { themeMode, allLangs } from "../../config";
import useSettings from "../../hooks/useSettings";
import useLocales from "../../hooks/useLocales";
import { anchorOrigin } from "../../utils/constants";

export default function SettingsForm({ title, subheader, ...other }) {
  const axiosPrivate = useAxiosPrivate();
  const { enqueueSnackbar } = useSnackbar();
  const { theme, language, setSettings } = useSettings();
  const { translate } = useLocales();

  const SettingsSchema = Yup.object().shape({
    theme: Yup.string().required(
      `${translate("theme")} ${translate("validation.required")}`
    ),
    language: Yup.string().required(
      `${translate("language")} ${translate("validation.required")}`
    ),
  });

  const defaultValues = {
    theme: theme || "",
    language: language || "",
  };

  const methods = useForm({
    resolver: yupResolver(SettingsSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
    setError,
    reset
  } = methods;

  const onSubmit = async (data) => {
    try {
      await UserAPI.Settings(axiosPrivate, data);
      setSettings((prevSettings) => {
        return { ...prevSettings, ...data };
      });
      reset(data)
      enqueueSnackbar(`${translate("settings")} ${translate("message.save")}`, {anchorOrigin});
    } catch (error) {
      displayError(enqueueSnackbar, error, setError, {anchorOrigin});
    }
  };

  return (
    <Card {...other}>
      <CardHeader title={title} subheader={subheader} sx={{ mb: 3 }} />

      <Box sx={{ mx: 3 }} dir="ltr">
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={3}>
            {!!errors.afterSubmit && (
              <Alert severity="error">{errors.afterSubmit.message}</Alert>
            )}

            <RHFSelectField
              name="theme"
              label={translate("theme")}
              options={themeMode}
            />

            <RHFSelectField
              name="language"
              label={translate("language")}
              options={allLangs}
            />
          </Stack>
          <Stack spacing={3} alignItems="flex-end" sx={{ my: 3 }}>
            <LoadingButton
              size="large"
              type="submit"
              variant="contained"
              loading={isSubmitting}
              disabled={!isDirty}
            >
              {translate("submit")}
            </LoadingButton>
          </Stack>
        </FormProvider>
      </Box>
    </Card>
  );
}
