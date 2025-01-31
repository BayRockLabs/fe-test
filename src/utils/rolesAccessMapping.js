import ROLES from "../routes/Roles";

export const accessibleFeatures = {
  timesheet: {
    ongoingCompletedProjects: [
      ROLES.SUPER_ADMIN,
      ROLES.TIMESHEET_EMPLOYEE,
      ROLES.TIMESHEET_VIEW,
      ROLES.HR_MANAGER,
      ROLES.PMO_USER,
      ROLES.TIMESHEET_ADMIN,
    ],
    timesheetManagerTab: [
      ROLES.TIMESHEET_VIEW,
      ROLES.GUEST_USER,
      ROLES.SUPER_ADMIN,
      ROLES.HR_MANAGER,
      ROLES.PMO_USER,
      ROLES.TIMESHEET_ADMIN,
    ],
    managerWithEmployeeTable: [
      ROLES.SUPER_ADMIN,
      ROLES.HR_MANAGER,
      ROLES.PMO_USER,
    ],
    terminateEmployee: [ROLES.PMO_USER],
    approveContractTimesheet: [ROLES.TIMESHEET_VIEW, ROLES.GUEST_USER],
    approveAnyTimesheet: [ROLES.TIMESHEET_ADMIN],
    approveUnplannedTimeoff: [ROLES.HR_MANAGER],
    getTimesheetApprovalsCount: [
      ROLES.TIMESHEET_VIEW,
      ROLES.GUEST_USER,
      ROLES.HR_MANAGER,
      ROLES.TIMESHEET_ADMIN,
    ],
    submitTimesheets: [
      ROLES.SUPER_ADMIN,
      ROLES.TIMESHEET_EMPLOYEE,
      ROLES.TIMESHEET_VIEW,
      ROLES.HR_MANAGER,
      ROLES.PMO_USER,
    ],
    exportTimesheets: [
      ROLES.SUPER_ADMIN,
      ROLES.TIMESHEET_EXPORT_USER,
      ROLES.HR_MANAGER,
      ROLES.PMO_USER,
    ],
  },
  // allocation: {},
};

export const hasAccessToFeature = (userData, module, feature) => {
  const userRoles = userData?.user_roles || [];
  return userRoles.some((role) =>
    accessibleFeatures[module]?.[feature]?.includes(role)
  );
};
export const timesheetAccess = {
  ongoingCompletedProjects: (userRoles) =>
    hasAccessToFeature(userRoles, "timesheet", "ongoingCompletedProjects"),

  timesheetManagerTab: (userRoles) =>
    hasAccessToFeature(userRoles, "timesheet", "timesheetManagerTab"),

  managerWithEmployeeTable: (userRoles) =>
    hasAccessToFeature(userRoles, "timesheet", "managerWithEmployeeTable"),

  terminateEmployee: (userRoles) =>
    hasAccessToFeature(userRoles, "timesheet", "terminateEmployee"),

  approveContractTimesheet: (userRoles) =>
    hasAccessToFeature(userRoles, "timesheet", "approveContractTimesheet"),
  approveUnplannedTimeoff: (userRoles) =>
    hasAccessToFeature(userRoles, "timesheet", "approveUnplannedTimeoff"),
  submitTimesheets: (userRoles) =>
    hasAccessToFeature(userRoles, "timesheet", "submitTimesheets"),

  exportTimesheets: (userRoles) =>
    hasAccessToFeature(userRoles, "timesheet", "exportTimesheets"),
  getTimesheetApprovalsCount: (userRoles) =>
    hasAccessToFeature(userRoles, "timesheet", "getTimesheetApprovalsCount"),
  approveAnyTimesheet: (userRoles) =>
    hasAccessToFeature(userRoles, "timesheet", "approveAnyTimesheet"),
};

// export const allocationAccess = {};
