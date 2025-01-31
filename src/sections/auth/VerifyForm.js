import { useState } from "react";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  Alert,
  IconButton,
  InputAdornment,
  Link,
  Stack,
  Typography,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import PasswordStrengthBar from "react-password-strength-bar";

import Iconify from "../../components/Iconify";
import { FormProvider, RHFTextField } from "../../components/hook-form";
import UserAPI from "../../services/UserService";
import { formatError } from "../../utils/handleErrors";
import { PATH_PAGE } from "../../routes/paths";

// ----------------------------------------------------------------------

export default function VerifyForm() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);

  const LoginSchema = Yup.object().shape({
    username: Yup.string()
      .required("Username required")
      .min(4, "Username must be 4 character long")
      .max(50, "Username should not be greater than 50 characters long")
      .matches(
        /^[\w.@+-]+$/,
        "Username allowed alphanumeric, . _ + - @ characters"
      ),
    code: Yup.string()
      .required("Code is required")
      .min(6, "Code must be 6 digit")
      .max(6, "Code must be 6 digit"),
    password: Yup.string()
      .required("Password is required")
      .min(8, "Password must be 8 character long")
      .matches(
        /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/,
        "Password must have atleast one Capital, one special character, one number"
      ),
    password2: Yup.string().oneOf(
      [Yup.ref("password"), null],
      "Passwords must match"
    ),
  });

  const defaultValues = {
    username: "",
    code: "",
    password: "",
    password2: "",
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
    watch,
  } = methods;

  const passwordVal = watch("password");

  const onSubmit = async (data) => {
    UserAPI.PasswordReset(data)
      .then(() => {
        navigate(PATH_PAGE.login, { replace: true });
      })
      .catch((error) => {
        reset();
        const message = formatError(error);
        setError("afterSubmit", { ...error, message });
      });
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={3}>
        {!!errors.afterSubmit && (
          <Alert severity="error">{errors.afterSubmit.message}</Alert>
        )}
        <RHFTextField name="username" label="Username" />
        <RHFTextField name="code" label="Confirmation Code" />
        <RHFTextField
          name="password"
          label="Password"
          type={showPassword ? "text" : "password"}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  edge="end"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <Iconify
                    icon={showPassword ? "eva:eye-fill" : "eva:eye-off-fill"}
                  />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        <PasswordStrengthBar password={passwordVal} />

        <RHFTextField
          name="password2"
          label="Confirm Password"
          type="password"
        />
      </Stack>

      <LoadingButton
        fullWidth
        size="large"
        type="submit"
        variant="contained"
        loading={isSubmitting}
        sx={{ my: 2 }}
      >
        Verify
      </LoadingButton>

      <Typography variant="body2" align="center">
        Don’t have a code? <Link variant="subtitle2">Resend code</Link>
      </Typography>
    </FormProvider>
  );
}
