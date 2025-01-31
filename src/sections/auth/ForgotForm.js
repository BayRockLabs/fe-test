import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Alert, Stack } from "@mui/material";
import { LoadingButton } from "@mui/lab";

import { FormProvider, RHFTextField } from "../../components/hook-form";
import UserAPI from "../../services/UserService";
import { formatError } from "../../utils/handleErrors";
import { PATH_PAGE } from "../../routes/paths";

// ----------------------------------------------------------------------

export default function ForgotForm() {
  const navigate = useNavigate();

  const LoginSchema = Yup.object().shape({
    username: Yup.string().required("Username is required"),
  });

  const defaultValues = {
    username: "",
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
    UserAPI.ForgotPassword(data).then(() =>
      navigate(PATH_PAGE.verifyCode, { replace: true })
    ).catch((error) => {
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
      </Stack>

      <LoadingButton
        fullWidth
        size="large"
        type="submit"
        variant="contained"
        loading={isSubmitting}
        sx={{ my: 2 }}
      >
        Send Request
      </LoadingButton>
    </FormProvider>
  );
}
