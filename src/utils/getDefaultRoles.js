import { PATH_PAGE } from "../routes/paths";
import ROLES from "../routes/Roles";

const roleRoutes = {
  [ROLES.RESOURCE_VIEW]: PATH_PAGE.resourcesManagement.root,
  [ROLES.DASHBOARD_VIEW]: PATH_PAGE.dashboardPage.root,
};
const getDefaultRole = (roles) => {
  for (let role of roles) {
    if (roleRoutes[role]) {
      // console.log("route", roleRoutes[role]);

      return roleRoutes[role]; // Return the first matching route
    }
  }
  return PATH_PAGE.dashboard;
};
export default getDefaultRole;
