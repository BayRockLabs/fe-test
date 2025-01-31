import { capitalCase } from 'change-case';
import { useParams, useLocation } from 'react-router-dom';
// @mui
import { Container } from '@mui/material';
// routes
import { PATH_PAGE } from '../routes/paths';
// hooks
// import useSettings from '../hooks/useSettings';
// components
import Page from '../components/Page';
import HeaderBreadcrumbs from '../components/HeaderBreadcrumbs';
// sections
import UserNewEditForm from '../sections/user/UserNewEditForm';
import { useState } from 'react';
import { useEffect } from 'react';
import UsersAPI from '../services/UsersService';
import useAxiosPrivate from '../hooks/useAxiosPrivate';
import { useSnackbar } from 'notistack';
import { displayError } from '../utils/handleErrors';
import { anchorOrigin } from '../utils/constants';

// ----------------------------------------------------------------------

export default function UserCreate() {
  // const { themeStretch } = useSettings();
  const themeStretch = false

  const { pathname } = useLocation();

  const { id = '' } = useParams();
  
  const axiosPrivate = useAxiosPrivate()

  const { enqueueSnackbar } = useSnackbar();

  const isEdit = pathname.includes('edit');

  const [currentUser, setCurrentUser] = useState({});

  useEffect(() => {
    const loadUser = async () => {
      try {
        const response = await UsersAPI.GetUser(axiosPrivate, id);
        setCurrentUser(response.data);
      } catch (error) {
        displayError(enqueueSnackbar, error, {anchorOrigin})
      }
    };
    if (isEdit) loadUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isEdit]);


  return (
    <Page title="User: Create a new user">
      <Container maxWidth={themeStretch ? false : 'lg'}>
        <HeaderBreadcrumbs
          heading={!isEdit ? 'Create a new user' : 'Edit user'}
          links={[
            { name: 'Dashboard', href: PATH_PAGE.dashboard },
            { name: 'Users', href: PATH_PAGE.user.root },
            { name: !isEdit ? 'New user' : capitalCase(`${currentUser.first_name} ${currentUser.last_name}`) },
          ]}
        />

        <UserNewEditForm isEdit={isEdit} currentUser={currentUser} />
      </Container>
    </Page>
  );
}
