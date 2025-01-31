export const PATH_PAGE = {
  client: {
    root: getClientPath(),
    detail: getClientPath("/detail"),
  },
  estimation: {
    root: getEstimationPath(),
    detail: getEstimationPath("/detail"),
    pricing: getEstimationPath("/pricing"),
    pricingDetail: getEstimationPath("/pricing/pricing-detail"),
  },
  contracts: {
    root: getContractPath(),
    detail: getContractPath("/detail"),
    milestones: getContractPath("/milestone"),
    milestoneDetail: getContractPath("/milestone/milestone-detail"),
    purchaseOrder: getContractPath("/purchase-order"),
    purchaseOrderDetail: getContractPath(
      "/purchase-order/purchase-order-detail"
    ),
  },
  allocation: {
    root: getallocationPath(),
    detail: getallocationPath("/detail"),
  },
  invoicing: {
    root: getInvoicingPath(),
  },
  insights: {
    root: getInsightsPath(),
  },

  resourcesManagement: {
    root: getResourcesManagementPath(),
    detail: getResourcesManagementPath("/resources/details"),
    utilization: getResourcesManagementPath("/utilization"),
  },
  exportTimesheetManagement: {
    root: getExportTimesheetManagementPath(),
  },
  timesheetManagement: {
    root: getTimesheetMangmentPath(),
    timesheetOverview: getTimesheetMangmentPath("/overview"),
    empTimesheetOverview: getTimesheetMangmentPath("/empTimesheet"),
    ongoinProjectTimesheetList: getTimesheetMangmentPath(
      "/empTimesheet/ongoingProject"
    ),
    empTimesheetTotalHrs: getTimesheetMangmentPath(
      "/empTimesheet/ongoingProject/totalHrscount"
    ),
    missingTimesheets: getTimesheetMangmentPath(
      "/empTimesheet/missingTimesheets"
    ),
  },
  dashboardPage: {
    root: getDashBoardPath(),
  },
  rateCard: {
    root: getRateCardPath(),
  },
  setting: {
    root: settingPath(),
    customeraccess: settingPath("/customer-access"),
    customerdeatil: settingPath("/customer-access/details"),
  },
  dashboard: "/dashboard",
  login: "/login",
  page404: "/404",
  pageRoles: "/roles",
  pageSettings: "/settings",
  pageInvoicing: getClientPath("/invoicing"),
  permissionDenied: "/permissionDenied",
};

function getClientPath(path) {
  return "/client" + (path ?? "");
}

function getEstimationPath(path) {
  return getClientPath() + "/estimation" + (path ?? "");
}

function getContractPath(path) {
  return getClientPath() + "/contracts" + (path ?? "");
}

function getallocationPath(path) {
  return getClientPath() + "/allocations" + (path ?? "");
}

function getResourcesManagementPath(path) {
  return "/resources" + (path ?? "");
}
function getExportTimesheetManagementPath(path) {
  return "/exportTimesheet" + (path ?? "");
}

function getInvoicingPath(path) {
  return getClientPath() + "/invoices" + (path ?? "");
}

function getInsightsPath(path) {
  return getClientPath() + "/insights" + (path ?? "");
}
function getDashBoardPath(path) {
  return "/dashboardpage" + (path ?? "");
}
function getRateCardPath(path) {
  return "/rateCard" + (path ?? "");
}
function settingPath(path) {
  return "/setting" + (path ?? "");
}
function getTimesheetMangmentPath(path) {
  return "/timesheet" + (path ?? "");
}
