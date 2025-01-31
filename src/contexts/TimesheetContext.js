import React, { createContext, useState, useEffect } from "react";
import TimeSheetAPI from "../services/TimeSheetService";
import { useData } from "./DataContext";
import { axiosPrivate } from "../services/axios";
import { timesheetAccess } from "../utils/rolesAccessMapping";
import ROLES from "../routes/Roles";
const TimesheetContext = createContext({
  pendingApprovalCount: 0,
  setPendingApprovalCount: () => {},
  loading: true,
  setLoading: () => {},
  getPendingApprovalCount: () => {},
});

export const TimesheetProvider = ({ children }) => {
  const { userData } = useData();
  const [pendingApprovalCount, setPendingApprovalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const isTimesheetApprover =
    timesheetAccess.getTimesheetApprovalsCount(userData);
  const isHrManager = timesheetAccess.approveUnplannedTimeoff(userData);
  const isTsContractManager =
    timesheetAccess.approveContractTimesheet(userData);
  const isTimesheetAdmin = timesheetAccess.approveAnyTimesheet(userData);
  const isGuestUser = userData?.user_roles?.includes(ROLES.GUEST_USER);

  const isHrAndProjectManager =
    userData?.user_roles?.includes(ROLES.TIMESHEET_VIEW) &&
    userData?.user_roles?.includes(ROLES.HR_MANAGER);
  const isAdminAndProjectManager =
    userData?.user_roles?.includes(ROLES.TIMESHEET_VIEW) &&
    userData?.user_roles?.includes(ROLES.TIMESHEET_ADMIN);
  const getPendingApprovalCount = async () => {
    try {
      const payload = { approver_email: userData?.user_info?.email };
      const response = await TimeSheetAPI.MANAGER_NOTIFICATION_COUNT(
        axiosPrivate,
        payload
      );
      setPendingApprovalCount(
        response?.data?.timesheet_pending_approval_count || 0
      );
    } catch (error) {
      console.error("Error fetching pending approval count:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userData?.user_info?.email && isTimesheetApprover) {
      getPendingApprovalCount();
    }
  }, [userData?.user_info?.email, isTimesheetApprover]);

  return (
    <TimesheetContext.Provider
      value={{
        pendingApprovalCount,
        setPendingApprovalCount,
        loading,
        setLoading,
        getPendingApprovalCount,
        isTimesheetApprover,
        isHrManager,
        isTsContractManager,
        isTimesheetAdmin,
        isGuestUser,
        isHrAndProjectManager,
        isAdminAndProjectManager,
      }}
    >
      {children}
    </TimesheetContext.Provider>
  );
};

export default TimesheetContext;
