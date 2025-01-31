import * as Yup from "yup";
import { useState } from "react";
// form
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
// @mui
import {
  Link,
  Stack,
  IconButton,
  InputAdornment,
  Alert,
  Typography,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { Link as RouterLink } from "react-router-dom";

// components
import Iconify from "../../../components/Iconify";
import {
  FormProvider,
  RHFTextField,
  RHFCheckbox,
} from "../../../components/hook-form";
import UserAPI from "../../../services/UserService";
import useAuth from "../../../hooks/useAuth";
import { formatError } from "../../../utils/handleErrors";
import useLocales from "../../../hooks/useLocales";
import { useNavigate } from "react-router-dom";
import { PATH_PAGE } from "../../../routes/paths";

// ----------------------------------------------------------------------

export default function LoginForm() {
  const { login } = useAuth();
  const { translate } = useLocales();

  const [showPassword, setShowPassword] = useState(false);

  const LoginSchema = Yup.object().shape({
    emailid: Yup.string().required(
      `${translate("emailid")} ${translate("validation.required")}`
    ),
    password: Yup.string().required(
      `${translate("password")} ${translate("validation.required")}`
    ),
  });

  const defaultValues = {
    username: "",
    password: "",
    remember: true,
  };

  const methods = useForm({
    resolver: yupResolver(LoginSchema),
    defaultValues,
  });

  const {
    reset,
    setError,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = methods;

  const onSubmit = async (data) => {
    try {
      await UserAPI.Login("email", data);
      await login();
      navigate(PATH_PAGE.dashboard);
    } catch (error) {
      reset();
      const message = formatError(error);
      setError("afterSubmit", { ...error, message });
    }
  };
  let navigate = useNavigate();
  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={3}>
        {!!errors.afterSubmit && (
          <Alert severity="error">{errors.afterSubmit.message}</Alert>
        )}
      </Stack>

      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ my: 2 }}
      ></Stack>
    </FormProvider>
  );
}
