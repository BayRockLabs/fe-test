import * as Yup from "yup";
// import { useNavigate } from "react-router-dom";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Alert, Box, Button, Card, CardHeader, Stack } from "@mui/material";
import { LoadingButton } from "@mui/lab";

import { FormProvider, RHFTextField } from "../../components/hook-form";
import useAuth from "../../hooks/useAuth";
import UserAPI from "../../services/UserService";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { formatError } from "../../utils/handleErrors";
import useLocales from "../../hooks/useLocales";
import { useSnackbar } from "notistack";
import { anchorOrigin } from "../../utils/constants";

// ----------------------------------------------------------------------

export default function ProfileForm({ title, subheader, ...other }) {
  const { user = {}, login } = useAuth();
  const axiosPrivate = useAxiosPrivate();
  const { translate } = useLocales();
  const { enqueueSnackbar } = useSnackbar();

  const defaultValues = useMemo(() => {
    const {
      first_name = "",
      last_name = "",
      email = "",
      phone_number = "",
    } = user || {};
    return {
      first_name,
      last_name,
      email,
      phone_number,
    };
  }, [user]);

  const ProfileSchema = Yup.object().shape({
    first_name: Yup.string()
      .required(`${translate('firstname')} ${translate('validation.required')}`)
      .max(120, `${translate('firstname')} ${translate('validation.maxlength')}`)
      .matches(/^[A-Za-z]+$/, `${translate('firstname')} ${translate('validation.onlyalpha')}`),
    last_name: Yup.string()
      .required(`${translate('lastname')} ${translate('validation.required')}`)
      .max(120, `${translate('lastname')} ${translate('validation.maxlength')}`)
      .matches(/^[A-Za-z]+$/, `${translate('lastname')} ${translate('validation.onlyalpha')}`),
    email: Yup.string()
      .email(`${translate('validation.valid')} ${translate('email')}`)
      .required(`${translate('email')} ${translate('validation.required')}`)
      .max(120, `${translate('email')} ${translate('validation.maxlength')}`),
    phone_number: Yup.string().matches(
      /^[6-9]\d{9}$/,
      `${translate('validation.valid')} ${translate('mobile')}`
    ),
  });

  const methods = useForm({
    resolver: yupResolver(ProfileSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    formState: { isSubmitting, isDirty, errors },
    reset,
    setError,
  } = methods;

  useEffect(() => {
    reset(defaultValues);
  }, [reset, defaultValues]);

  const onSubmit = async (data) => {
    try {
      await UserAPI.UpdateUserDetails(axiosPrivate, data);
      await login();
      enqueueSnackbar(`${translate('profile')} ${translate('message.update')}`, {anchorOrigin});
    } catch (error) {
      const message = formatError(error);
      setError("afterSubmit", { ...error, message });
    }
  };

  const resetForm = () => {
    reset(defaultValues);
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
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <RHFTextField name="first_name" label={translate("firstname")} />
              <RHFTextField name="last_name" label={translate("lastname")} />
            </Stack>

            <RHFTextField name="email" label={translate("emailaddress")} />

            <RHFTextField name="phone_number" label={translate("mobile")} />
          </Stack>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            justifyContent="flex-end"
            sx={{ my: 3 }}
          >
            {isDirty && (
              <Button size="large" type="button" onClick={resetForm}>
                {translate("cancel")}
              </Button>
            )}
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
