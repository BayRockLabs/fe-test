import {
  Alert,
  Box,
  Card,
  CardHeader,
  IconButton,
  InputAdornment,
  Stack,
} from "@mui/material";
import { useState } from "react";
import { LoadingButton } from "@mui/lab";
import * as Yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useSnackbar } from "notistack";
import PasswordStrengthBar from "react-password-strength-bar";

import { FormProvider, RHFTextField } from "../../components/hook-form";
import Iconify from "../../components/Iconify";
import UserAPI from "../../services/UserService";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { formatError } from "../../utils/handleErrors";
import useLocales from "../../hooks/useLocales";
import { anchorOrigin } from "../../utils/constants";

export default function ChangePassword({ title, subheader, ...other }) {
  const [showCPassword, setShowCPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const axiosPrivate = useAxiosPrivate();
  const { enqueueSnackbar } = useSnackbar();
  const { translate } = useLocales();

  const ChangePasswordSchema = Yup.object().shape({
    current_password: Yup.string()
      .required(`${translate('password')} ${translate('validation.required')}`)
      .min(8, `${translate('password')} ${translate('validation.minlength')}`)
      .matches(
        /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/,
        translate('validation.password')
      ),
    password: Yup.string()
      .required(`${translate('password')} ${translate('validation.required')}`)
      .min(8, `${translate('password')} ${translate('validation.minlength')}`)
      .matches(
        /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/,
        translate('validation.password')
      ),
    password2: Yup.string().oneOf(
      [Yup.ref("password"), null],
      `${translate('password')} ${translate('validation.match')}`
    ),
  });

  const defaultValues = {
    current_password: "",
    password: "",
    password2: "",
  };

  const methods = useForm({
    resolver: yupResolver(ChangePasswordSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setError,
    watch,
  } = methods;

  const passwordVal = watch("password");

  const onSubmit = async (data) => {
    try {
      await UserAPI.ChangePassword(axiosPrivate, data)
      reset();
      enqueueSnackbar(`${translate('password')} ${translate('message.change')}`, {anchorOrigin});
    } catch (error) {
      const message = formatError(error);
      setError("afterSubmit", { ...error, message });
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
            <RHFTextField
              name="current_password"
              label={translate('currentpassword')}
              type={showCPassword ? "text" : "password"}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      edge="end"
                      onClick={() => setShowCPassword(!showCPassword)}
                    >
                      <Iconify
                        icon={
                          showCPassword ? "eva:eye-fill" : "eva:eye-off-fill"
                        }
                      />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <RHFTextField
              name="password"
              label={translate('newpassword')}
              type={showPassword ? "text" : "password"}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      edge="end"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      <Iconify
                        icon={
                          showPassword ? "eva:eye-fill" : "eva:eye-off-fill"
                        }
                      />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <PasswordStrengthBar password={passwordVal} />

            <RHFTextField
              name="password2"
              label={translate('confirmnewpassword')}
              type="password"
            />
          </Stack>
          <Stack spacing={3} alignItems="flex-end" sx={{ my: 3 }}>
            <LoadingButton
              size="large"
              type="submit"
              variant="contained"
              loading={isSubmitting}
            >
              {translate('submit')}
            </LoadingButton>
          </Stack>
        </FormProvider>
      </Box>
    </Card>
  );
}
