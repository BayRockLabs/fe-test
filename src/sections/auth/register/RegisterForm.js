import * as Yup from "yup";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
// form
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
// @mui
import { Stack, IconButton, InputAdornment } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import PasswordStrengthBar from "react-password-strength-bar";
// components
import Iconify from "../../../components/Iconify";
import { FormProvider, RHFTextField } from "../../../components/hook-form";
import UserAPI from "../../../services/UserService";
import useLocales from "../../../hooks/useLocales";
import { PATH_PAGE } from "../../../routes/paths";

// ----------------------------------------------------------------------

export default function RegisterForm() {
  const navigate = useNavigate();
  const { translate } = useLocales();

  const [showPassword, setShowPassword] = useState(false);

  const RegisterSchema = Yup.object().shape({
    first_name: Yup.string()
      .required(`${translate("firstname")} ${translate("validation.required")}`)
      .max(
        120,
        `${translate("firstname")} ${translate("validation.maxlength")}`
      )
      .matches(
        /^[A-Za-z]+$/,
        `${translate("firstname")} ${translate("validation.onlyalpha")}`
      ),
    last_name: Yup.string()
      .required(`${translate("lastname")} ${translate("validation.required")}`)
      .max(120, `${translate("lastname")} ${translate("validation.maxlength")}`)
      .matches(
        /^[A-Za-z]+$/,
        `${translate("lastname")} ${translate("validation.onlyalpha")}`
      ),
    username: Yup.string()
      .required(`${translate("username")} ${translate("validation.required")}`)
      .min(4, `${translate("username")} ${translate("validation.minlength")}`)
      .max(50, `${translate("username")} ${translate("validation.maxlength")}`)
      .matches(/^[\w.@+-]+$/, translate("validation.username")),
    email: Yup.string()
      .email(`${translate("validation.valid")} ${translate("email")}`)
      .required(`${translate("email")} ${translate("validation.required")}`)
      .max(120, `${translate("email")} ${translate("validation.maxlength")}`),
    phone_number: Yup.string().matches(
      /^[6-9]\d{9}$/,
      `${translate("validation.valid")} ${translate("mobile")}`
    ),
    password: Yup.string()
      .required(`${translate("password")} ${translate("validation.required")}`)
      .min(8, `${translate("password")} ${translate("validation.minlength")}`)
      .matches(
        /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/,
        translate("validation.password")
      ),
    password2: Yup.string().oneOf(
      [Yup.ref("password"), null],
      `${translate("password")} ${translate("validation.match")}`
    ),
  });

  const defaultValues = {
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    phone_number: "",
    password: "",
    password2: "",
  };

  const methods = useForm({
    resolver: yupResolver(RegisterSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
    watch,
  } = methods;

  const passwordVal = watch("password");

  const onSubmit = async (data) => {
    UserAPI.Register(data).then(() =>
      navigate(PATH_PAGE.login, { replace: true })
    );
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={3}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <RHFTextField name="first_name" label={translate("firstname")} />
          <RHFTextField name="last_name" label={translate("lastname")} />
        </Stack>

        <RHFTextField name="username" label={translate("username")} />

        <RHFTextField name="email" label={translate("emailaddress")} />

        <RHFTextField name="phone_number" label={translate("mobilenumber")} />

        <RHFTextField
          name="password"
          label={translate("password")}
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
          label={translate("confirmpassword")}
          type="password"
        />

        <LoadingButton
          fullWidth
          size="large"
          type="submit"
          variant="contained"
          loading={isSubmitting}
        >
          {translate("register")}
        </LoadingButton>
      </Stack>
    </FormProvider>
  );
}
