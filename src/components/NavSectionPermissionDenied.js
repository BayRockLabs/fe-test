import { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
// material
import {styled } from "@mui/material/styles";
import {
  Box,
  List,
  ListItemText,
  ListItemIcon,
  ListItemButton,
} from "@mui/material";

import useLocales from "../hooks/useLocales";
import useAuth from "../hooks/useAuth";
import { PERMISSIONS } from "../config";

// ----------------------------------------------------------------------

const ListItemStyle = styled((props) => (
  <ListItemButton disableGutters {...props} />
))(({ theme }) => ({
  ...theme.typography.body2,
  height: 48,
  position: "relative",
  textTransform: "capitalize",
  color: theme.palette.text.secondary,
  borderRadius: theme.shape.borderRadius,
  paddingLeft: theme.spacing(2),
  paddingRight: theme.spacing(1.5),
  marginBottom: theme.spacing(0.5),
}));

const ListItemIconStyle = styled(ListItemIcon)({
  width: 22,
  height: 22,
  color: "inherit",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});

// ----------------------------------------------------------------------

NavItem.propTypes = {
  item: PropTypes.object,
  active: PropTypes.func,
};

export function NavItem({ item }) {
  const { translate } = useLocales();
  const { title, icon, info } = item;
  const titleTrans = translate(title);

  
  return (
    <>
      <ListItemStyle
        component=""
        to=""
      >
        <ListItemIconStyle>{icon}</ListItemIconStyle>
        <ListItemText disableTypography primary={titleTrans} />
        {info}
      </ListItemStyle>
    </>
  );
}

NavSectionPermissionDenied.propTypes = {
  navConfig: PropTypes.array,
};

export default function NavSectionPermissionDenied({ navConfig, ...other }) {
  const { user } = useAuth();
  const currentPermissions = useMemo(() => {
    return user?.permissions?.map((item) => item.uuid) || [];
  }, [user?.permissions]);

  const [nav, setNav] = useState([]);

  useEffect(() => {
    const filterNav = navConfig.filter((item) => {
      return PERMISSIONS[item.title]
        ? currentPermissions.includes(PERMISSIONS[item.title])
        : true;
    });
    setNav(filterNav);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPermissions]);

  return (
    <Box {...other}>
      <List disablePadding sx={{ px: 2, py: 4 }}>
        {nav.map((item) => (
          <NavItem key={item.title} item={item} />
        ))}
      </List>
    </Box>
  );
}
