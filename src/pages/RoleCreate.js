import { capitalCase } from "change-case";
import { useParams, useLocation } from "react-router-dom";
// @mui
import { Container } from "@mui/material";
// routes
import { PATH_PAGE } from "../routes/paths";
// hooks
// import useSettings from '../hooks/useSettings';
// components
import Page from "../components/Page";
import HeaderBreadcrumbs from "../components/HeaderBreadcrumbs";
// sections
import RoleNewEditForm from "../sections/role/RoleNewEditForm";
import { useEffect } from "react";
import { useState } from "react";
import RoleAPI from "../services/RoleService";
import { displayError } from "../utils/handleErrors";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import { useSnackbar } from "notistack";
import useLocales from "../hooks/useLocales";
import { anchorOrigin } from "../utils/constants";

// ----------------------------------------------------------------------

export default function RoleCreate() {
  // const { themeStretch } = useSettings();
  const themeStretch = false;

  const { pathname } = useLocation();

  const { id = "" } = useParams();

  const axiosPrivate = useAxiosPrivate()

  const { enqueueSnackbar } = useSnackbar();

  const { translate } = useLocales();

  const isEdit = pathname.includes("edit");

  const [currentRole, setCurrentRole] = useState({});

  useEffect(() => {
    const loadRole = async () => {
      try {
        const response = await RoleAPI.GetRole(axiosPrivate, id);
        setCurrentRole(response.data);
      } catch (error) {
        displayError(enqueueSnackbar, error, {anchorOrigin})
      }
    };
    if (isEdit) loadRole();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isEdit]);

  return (
    <Page title={`${translate('role')}: ${translate('createrole')}`}>
      <Container maxWidth={themeStretch ? false : "lg"}>
        <HeaderBreadcrumbs
          heading={!isEdit ? translate('createrole') : `${translate('edit')} ${translate('role')}`}
          links={[
            { name: translate('dashboard'), href: PATH_PAGE.dashboard },
            { name: translate('roles'), href: PATH_PAGE.role.root },
            { name: !isEdit ? `${translate('new')} ${translate('role')}` : capitalCase(currentRole.name || '') },
          ]}
        />
        <RoleNewEditForm isEdit={isEdit} currentRole={currentRole} />
      </Container>
    </Page>
  );
}
