import PropTypes from "prop-types";
import * as Yup from "yup";
import { useEffect, useMemo } from "react";
import { useSnackbar } from "notistack";
import { useNavigate } from "react-router-dom";
// form
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
// @mui
import { LoadingButton } from "@mui/lab";
import {
  Card,
  CardHeader,
  Checkbox,
  Grid,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
} from "@mui/material";
// routes
import { PATH_PAGE } from "../../routes/paths";
import { FormProvider, RHFTextField } from "../../components/hook-form";
import useTable from "../../hooks/useTable";
import RoleAPI from "../../services/RoleService";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { displayError } from "../../utils/handleErrors";
import { useState } from "react";
import useLocales from "../../hooks/useLocales";
import RHFAutocomplete from "../../components/hook-form/RHFAutocomplete";
import UsersAPI from "../../services/UsersService";
import { anchorOrigin } from "../../utils/constants";

// ----------------------------------------------------------------------

RoleNewEditForm.propTypes = {
  isEdit: PropTypes.bool,
  currentRole: PropTypes.object,
};

export default function RoleNewEditForm({ isEdit, currentRole }) {
  const navigate = useNavigate();
  const axiosPrivate = useAxiosPrivate();
  const { translate } = useLocales();

  const { enqueueSnackbar } = useSnackbar();

  const { selected, onSelectRow } = useTable();

  const [permissionList, setPermissionList] = useState([]);
  const [userOptions, setUserOptions] = useState([]);

  // Load Permission List
  useEffect(() => {
    const loadPermissionList = async () => {
      try {
        const response = await RoleAPI.GetPermissions(axiosPrivate);
        setPermissionList(response?.data?.results || []);
      } catch (error) {
        displayError(enqueueSnackbar, error, {anchorOrigin});
      }
    };
    loadPermissionList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load User List
  useEffect(() => {
    const loadUserList = async () => {
      try {
        const response = await UsersAPI.UsersList(axiosPrivate);
        setUserOptions(formatUserOptions(response?.data?.results));
      } catch (error) {
        displayError(enqueueSnackbar, error, {anchorOrigin});
      }
    };
    loadUserList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatUserOptions = (users = []) => {
    return users.map(user => {
      return { label: `${user.first_name} ${user.last_name}`, value: user.uuid}
    })
  }

  const NewUserSchema = Yup.object().shape({
    name: Yup.string()
      .required(`${translate("rolename")} ${translate("validation.required")}`)
      .trim(),
    description: Yup.string()
      .required(`${translate("roledesc")} ${translate("validation.required")}`)
      .trim(),
    users: Yup.array()
      .of(
        Yup.object().shape({
          value: Yup.string(),
          label: Yup.string(),
        })
      )
      .min(1, `${translate("user")} ${translate("validation.required")}`),
  });

  const defaultValues = useMemo(
    () => ({
      name: currentRole?.name || "",
      description: currentRole?.description || "",
      users: formatUserOptions(currentRole?.users),
    }),
    [currentRole]
  );

  const methods = useForm({
    resolver: yupResolver(NewUserSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    setError,
    formState: { isSubmitting },
  } = methods;

  useEffect(() => {
    if (isEdit && currentRole) {
      reset(defaultValues);
    }
    if (!isEdit) {
      reset(defaultValues);
    }
    if (currentRole.permissions)
      onSelectRow(
        currentRole.permissions.map((permission) => permission.uuid) || []
      );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, currentRole]);

  const onSubmit = async (e) => {
    if (!selected.length) {
      enqueueSnackbar(
        `${translate("permissions")} ${translate("validation.required")}`,
        { variant: "error" },
        {anchorOrigin}
      );
      return;
    }
    try {
      const data = {
        ...e,
        users: e?.users.map(user => user.value),
        permissions: [...selected],
      }
      if (!isEdit) {
        await RoleAPI.CreateRole(axiosPrivate, data);
      } else {
        await RoleAPI.UpdateRole(axiosPrivate, currentRole.uuid, data);
      }
      reset();
      enqueueSnackbar(
        `${translate("role")} ${translate(
          !isEdit ? "message.create" : "message.update"
        )}`,
        {anchorOrigin}
      );
      navigate(PATH_PAGE.role.root);
    } catch (error) {
      displayError(enqueueSnackbar, error, setError, {anchorOrigin});
    }
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 3 }}>
            <Stack spacing={3}>
              <RHFTextField name="name" label={translate("rolename")} />
              <RHFTextField
                name="description"
                multiline
                rows={4}
                label={`${translate("rolename")}...`}
              />
              <RHFAutocomplete
                name="users"
                label={translate("users")}
                options={userOptions}
                multiple
              />
            </Stack>

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

        <Grid item xs={12} md={6}>
          <Card sx={{ p: 3 }}>
            <CardHeader
              title={translate("permissions")}
              subheader={translate("permissiondesc")}
              sx={{ mb: 3, p: 0 }}
            />
            <Table size="small">
              <TableBody>
                {permissionList.map((row) => {
                  const checked = selected.includes(row.uuid);
                  return (
                    <TableRow key={row.uuid} hover selected={checked}>
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={checked}
                          onClick={() => onSelectRow(row.uuid)}
                        />
                      </TableCell>

                      <TableCell align="left">
                        <Typography variant="subtitle2" noWrap>
                          {row.name}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Card>
        </Grid>
      </Grid>
    </FormProvider>
  );
}
