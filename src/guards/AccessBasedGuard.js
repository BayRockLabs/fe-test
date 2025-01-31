import { useData } from "../contexts/DataContext";
import { Navigate } from "react-router-dom";
import { PATH_PAGE } from "../routes/paths";
import LoadingScreen from "../components/LoadingScreen";

const AccessBasedGuard = ({ children, allowedRoles }) => {
  const { userData, loading } = useData();
  if (loading || !userData) {
    return <LoadingScreen />;
  }
  return userData?.user_roles?.some((i) => allowedRoles?.includes(i)) ? (
    children
  ) : (
    <Navigate to={PATH_PAGE.timesheetManagement.empTimesheetOverview} />
  );
};

export default AccessBasedGuard;
