import PropTypes from "prop-types";
import * as Yup from "yup";
import { useCallback, useEffect, useMemo } from "react";
import { useSnackbar } from "notistack";
import { useNavigate } from "react-router-dom";
// form
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
// @mui
import { LoadingButton } from "@mui/lab";
import {
  Box,
  Card,
  Grid,
  Stack,
  Typography,
  IconButton,
  InputAdornment,
} from "@mui/material";
// utils
import { fData } from "../../utils/formatNumber";
// routes
import { PATH_PAGE } from "../../routes/paths";
import {
  FormProvider,
  RHFTextField,
  RHFUploadAvatar,
} from "../../components/hook-form";
import { useState } from "react";
import Iconify from "../../components/Iconify";
import PasswordStrengthBar from "react-password-strength-bar";
import UsersAPI from "../../services/UsersService";
import { displayError } from "../../utils/handleErrors";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import useLocales from "../../hooks/useLocales";
import RHFAutocomplete from "../../components/hook-form/RHFAutocomplete";
import RoleAPI from "../../services/RoleService";
import { anchorOrigin } from "../../utils/constants";

// ----------------------------------------------------------------------

UserNewEditForm.propTypes = {
  isEdit: PropTypes.bool,
  currentUser: PropTypes.object,
};

export default function UserNewEditForm({ isEdit, currentUser }) {
  const navigate = useNavigate();
  const { translate } = useLocales();

  const axiosPrivate = useAxiosPrivate();

  const { enqueueSnackbar } = useSnackbar();

  const [showPassword, setShowPassword] = useState(false);

  const [roleOptions, setRoleOptions] = useState([]);

  // Load Role List
  useEffect(() => {
    const loadRoleList = async () => {
      try {
        const response = await RoleAPI.RoleList(axiosPrivate);
        setRoleOptions(formatRoleOptions(response?.data?.results));
      } catch (error) {
        displayError(enqueueSnackbar, error, {anchorOrigin});
      }
    };
    loadRoleList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatRoleOptions = (roles = []) => {
    return roles.map(role => {
      return { label: role.name, value: role.uuid}
    })
  }

  const passwordSchema = () => {
    if (isEdit) return {};
    return {
      password: Yup.string()
        .required(
          `${translate("password")} ${translate("validation.required")}`
        )
        .min(8, `${translate("password")} ${translate("validation.minlength")}`)
        .matches(
          /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/,
          translate("validation.password")
        ),
      password2: Yup.string().oneOf(
        [Yup.ref("password"), null],
        `${translate("password")} ${translate("validation.match")}`
      ),
    };
  };

  const NewUserSchema = Yup.object().shape({
    // avatarUrl: Yup.mixed().test(
    //   "required",
    //   "Avatar is required",
    //   (value) => value !== ""
    // ),
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
    roles: Yup.array()
      .of(
        Yup.object().shape({
          value: Yup.string(),
          label: Yup.string(),
        })
      )
      .min(1, `${translate("role")} ${translate("validation.required")}`),
    ...passwordSchema(),
  });

  const passwordDefaultValues = () => {
    if (isEdit) return {};
    return {
      password: currentUser.password || "",
      password2: currentUser.password2 || "",
    };
  };

  const defaultValues = useMemo(
    () => ({
      avatarUrl: currentUser?.avatarUrl || "",
      first_name: currentUser.first_name || "",
      last_name: currentUser.last_name || "",
      username: currentUser.username || "",
      email: currentUser.email || "",
      phone_number: currentUser.phone_number || "",
      roles: formatRoleOptions(currentUser?.roles),
      ...passwordDefaultValues(),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentUser]
  );

  const methods = useForm({
    resolver: yupResolver(NewUserSchema),
    defaultValues,
  });

  const {
    reset,
    watch,
    setValue,
    setError,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const values = watch();

  useEffect(() => {
    if (isEdit && currentUser) {
      reset(defaultValues);
    }
    if (!isEdit) {
      reset(defaultValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, currentUser]);

  const onSubmit = async (e) => {
    try {
      const data = {
        ...e,
        roles: e?.roles.map(role => role.value),
      }
      if (!isEdit) {
        await UsersAPI.CreateUser(axiosPrivate, data);
      } else {
        await UsersAPI.UpdateUser(axiosPrivate, currentUser.uuid, data);
      }
      reset();
      enqueueSnackbar(
        `${translate("user")} ${translate(
          !isEdit ? "message.create" : "message.update"
        )}`,
        {anchorOrigin}
      );
      navigate(PATH_PAGE.user.root);
    } catch (error) {
      displayError(enqueueSnackbar, error, setError, {anchorOrigin});
    }
  };

  const handleDrop = useCallback(
    (acceptedFiles) => {
      const file = acceptedFiles[0];

      if (file) {
        setValue(
          "avatarUrl",
          Object.assign(file, {
            preview: URL.createObjectURL(file),
          })
        );
      }
    },
    [setValue]
  );

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card sx={{ py: 10, px: 3 }}>
            {/* Show bagged for enabled or disabled user */}
            {/* {isEdit && (
              <Label
                color={values.status !== "active" ? "error" : "success"}
                sx={{
                  textTransform: "uppercase",
                  position: "absolute",
                  top: 24,
                  right: 24,
                }}
              >
                {values.status}
              </Label>
            )} */}

            <Box sx={{ mb: 5 }}>
              <RHFUploadAvatar
                name="avatarUrl"
                maxSize={3145728}
                onDrop={handleDrop}
                helperText={
                  <Typography
                    variant="caption"
                    sx={{
                      mt: 2,
                      mx: "auto",
                      display: "block",
                      textAlign: "center",
                      color: "text.secondary",
                    }}
                  >
                    {translate("allowed")} *.jpeg, *.jpg, *.png, *.gif
                    <br /> {translate("message.maxsize")} {fData(2000000)}
                  </Typography>
                }
              />
            </Box>

            {/* Checkbox for enable or disable user */}
            {/* {isEdit && (
              <FormControlLabel
                labelPlacement="start"
                control={
                  <Controller
                    name="status"
                    control={control}
                    render={({ field }) => (
                      <Switch
                        {...field}
                        checked={field.value !== "active"}
                        onChange={(event) =>
                          field.onChange(
                            event.target.checked ? "banned" : "active"
                          )
                        }
                      />
                    )}
                  />
                }
                label={
                  <>
                    <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                      Banned
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: "text.secondary" }}
                    >
                      Apply disable account
                    </Typography>
                  </>
                }
                sx={{ mx: 0, mb: 3, width: 1, justifyContent: "space-between" }}
              />
            )} */}
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card sx={{ p: 3 }}>
            <Box
              sx={{
                display: "grid",
                columnGap: 2,
                rowGap: 3,
                gridTemplateColumns: {
                  xs: "repeat(1, 1fr)",
                  sm: "repeat(2, 1fr)",
                },
              }}
            >
              <RHFTextField name="first_name" label={translate("firstname")} />
              <RHFTextField name="last_name" label={translate("lastname")} />

              <RHFTextField name="username" label={translate("username")} />

              <RHFTextField name="email" label={translate("emailaddress")} />

              <RHFTextField
                name="phone_number"
                label={translate("mobile")}
                // sx={{ gridColumn: { sm: "span 2" } }}
              />

              <RHFAutocomplete
                name="roles"
                label={translate("roles")}
                options={roleOptions}
                multiple
              />

              {!isEdit && (
                <>
                  <Stack>
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
                                icon={
                                  showPassword
                                    ? "eva:eye-fill"
                                    : "eva:eye-off-fill"
                                }
                              />
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                    <PasswordStrengthBar password={values.password} />
                  </Stack>

                  <RHFTextField
                    name="password2"
                    label={translate("confirmpassword")}
                    type="password"
                  />
                </>
              )}
            </Box>
            <Stack alignItems="flex-end" sx={{ mt: 3 }}>
              <LoadingButton
                size="large"
                type="submit"
                variant="contained"
                loading={isSubmitting}
              >
                {translate("submit")}
              </LoadingButton>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </FormProvider>
  );
}
