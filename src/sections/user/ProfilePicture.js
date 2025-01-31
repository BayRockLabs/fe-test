import { useCallback } from "react";
import * as Yup from "yup";
import { Card, Typography } from "@mui/material";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { LoadingButton } from "@mui/lab";
import { useSnackbar } from "notistack";

import { fData } from "../../utils/formatNumber";
import { FormProvider, RHFUploadAvatar } from "../../components/hook-form";
import useLocales from "../../hooks/useLocales";
import { anchorOrigin } from "../../utils/constants";

function ProfilePicture() {
  const { enqueueSnackbar } = useSnackbar();
  const { translate } = useLocales();

  const PhotoFormSchema = Yup.object().shape({
    photoURL: Yup.string().required(
      `${translate("photo")} ${translate("validation.required")}`
    ),
  });

  const defaultValues = {
    photoURL: "",
  };

  const methods = useForm({
    resolver: yupResolver(PhotoFormSchema),
    defaultValues,
  });

  const {
    setValue,
    handleSubmit,
    formState: { isSubmitting, isDirty },
  } = methods;

  const onSubmit = async (data) => {
    console.log(data.photoURL);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      enqueueSnackbar(`${translate("photo")} ${translate("message.save")}`, {anchorOrigin});
    } catch (error) {
      console.error(error);
    }
  };

  const handleDrop = useCallback(
    (acceptedFiles) => {
      const file = acceptedFiles[0];

      if (file) {
        setValue(
          "photoURL",
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
      <Card sx={{ py: 5, px: 3, textAlign: "center" }}>
        <RHFUploadAvatar
          name="photoURL"
          maxSize={2000000}
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
              {translate("allowed")} *.jpeg, *.jpg, *.png
              <br /> {translate("maxsize")} {fData(2000000)}
            </Typography>
          }
        />
        <LoadingButton
          fullWidth
          size="large"
          type="submit"
          variant="contained"
          loading={isSubmitting}
          sx={{ my: 2 }}
          disabled={!isDirty}
        >
          {translate("upload")}
        </LoadingButton>
      </Card>
    </FormProvider>
  );
}

export default ProfilePicture;
