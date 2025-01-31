// component
import Iconify from "../../components/Iconify";
import { PATH_PAGE } from "../../routes/paths";
import MenuClient from "../../assets/svg/menu/MenuClient";
import MenuResource from "../../assets/svg/menu/MenuResource";
import MenuRole from "../../assets/svg/menu/MenuRole";
import MenuSetting from "../../assets/svg/menu/MenuSetting";
import MenuClientDetail from "../../assets/svg/menu/MenuClientDetail";
import MenuEstimation from "../../assets/svg/menu/MenuEstimation";
import MenuTimeSheet from "../../assets/svg/menu/MenuTimeSheet";
import MileStone from "../../assets/svg/menu/Milestone";
import EffortEstimation from "../../assets/svg/menu/EffortEstimations";
import Pricing from "../../assets/svg/menu/pricing";
import Contracts from "../../assets/svg/menu/contracts";
import PurchaseOrder from "../../assets/svg/menu/purchase order";
import MenuAllocation from "../../assets/svg/menu/MenuAllocation";
import MenuInvoicing from "../../assets/svg/menu/MenuInvoicing";
import ResourceMetrixIcon from "../../assets/svg/menu/ResourceMetricsIcon";
import DashboardIcon from "../../assets/svg/menu/DashboardIcon";
import ROLES from "../../routes/Roles";
import ExportIcon from "../../assets/svg/menu/ExportIcon";
import MenuRateCard from "../../assets/svg/menu/MenuRateCard";
import InsightsIcon from "../../assets/svg/menu/InsightsIcon";

// ----------------------------------------------------------------------
const getIcon = (name) => <Iconify icon={name} width={22} height={22} />;
export const DashboardNavConfig = (translate) => [
  {
    title: translate("dashboard"),
    path: PATH_PAGE.dashboardPage.root,
    icon: <DashboardIcon />,
    allowedRoles: [DASHBOARD_VIEW, SUPER_ADMIN],
  },
  {
    title: translate("rateCard"),
    path: PATH_PAGE.rateCard.root,
    allowedRoles: [SUPER_ADMIN, EST_ADMIN, PRICING_ADMIN],
    icon: <MenuRateCard />,
  },
  {
    title: translate("clientManagement"),
    path: PATH_PAGE.dashboard,
    icon: <MenuClient />,
    allowedRoles: [
      SUPER_ADMIN,
      ALLOCATION_ADMIN,
      ALLOCATION_VIEW,
      EST_ADMIN,
      EST_VIEW,
      PRICING_ADMIN,
      PRICING_VIEW,
      SOW_ADMIN,
      SOW_VIEW,
      PO_ADMIN,
      PO_VIEW,
      MILESTONE_ADMIN,
      MILESTONE_VIEW,
      VIEWER,
      CLIENT_ADMIN,
      CLIENT_VIEW,
    ],
  },
  {
    title: translate("ResourceManagement"),
    path: PATH_PAGE.resourcesManagement.root,
    icon: <MenuResource />,
    allowedRoles: [RESOURCE_VIEW, SUPER_ADMIN],
    children: [
      {
        title: translate("Resource Metrics"),
        path: PATH_PAGE.resourcesManagement.root,
        subicon: <ResourceMetrixIcon />,
        allowedRoles: [RESOURCE_VIEW, SUPER_ADMIN],
      },
      {
        title: translate("Resource Utilization"),
        path: PATH_PAGE.resourcesManagement.utilization,
        subicon: <ResourceMetrixIcon />,
        allowedRoles: [RESOURCE_VIEW, SUPER_ADMIN],
      },

      // {
      //   title: translate("ResourcesDetail"),
      //   path: PATH_PAGE.resourcesManagement.detail,
      // },
    ],
  },
  {
    title: translate("Timesheets"),
    path: PATH_PAGE.timesheetManagement.empTimesheetOverview,
    icon: <MenuTimeSheet />,
  },
  {
    title: translate("Export Timesheet"),
    path: PATH_PAGE.exportTimesheetManagement.root,
    icon: <ExportIcon />,
  },
  {
    title: translate("settings"),
    path: PATH_PAGE.setting.root,
    icon: <MenuSetting />,
    allowedRoles: [SUPER_ADMIN],
    children: [
      {
        title: translate("Rate Config"),
        path: PATH_PAGE.setting.root,
        subicon: <MenuRateCard />,
        allowedRoles: [SUPER_ADMIN],
      },
      {
        title: translate("Customer Access"),
        path: PATH_PAGE.setting.customeraccess,
        subicon: <MenuRateCard />,
        allowedRoles: [SUPER_ADMIN],
      },
    ],
  },
  // {
  //   title: translate("roles"),
  //   path: PATH_PAGE.pageRoles,
  //   icon: <MenuRole />,
  // },
  // {
  //   title: translate("settings"),
  //   path: PATH_PAGE.pageSettings,
  //   icon: <MenuSetting />,
  // },
];
const {
  ALL,
  ALLOCATION_ADMIN,
  ALLOCATION_VIEW,
  EST_ADMIN,
  EST_VIEW,
  MILESTONE_ADMIN,
  MILESTONE_VIEW,
  PO_ADMIN,
  PO_VIEW,
  PRICING_ADMIN,
  PRICING_VIEW,
  SOW_ADMIN,
  SOW_VIEW,
  SUPER_ADMIN,
  VIEWER,
  DASHBOARD_VIEW,
  RESOURCE_VIEW,
  TIMESHEET_VIEW,
  INVOICE_ADMIN,
  INVOICE_VIEW,
  CLIENT_ADMIN,
  CLIENT_VIEW,
} = ROLES;
export const SelectedClientNavConfig = (clientName, translate) => [
  {
    title: clientName,
    path: PATH_PAGE.client.detail,
    icon: <MenuClientDetail />,
    allowedRoles: [
      SUPER_ADMIN,
      ALLOCATION_ADMIN,
      ALLOCATION_VIEW,
      EST_ADMIN,
      EST_VIEW,
      PRICING_ADMIN,
      PRICING_VIEW,
      SOW_ADMIN,
      SOW_VIEW,
      PO_ADMIN,
      PO_VIEW,
      MILESTONE_ADMIN,
      MILESTONE_VIEW,
      VIEWER,
      CLIENT_ADMIN,
      CLIENT_VIEW,
    ],
  },
  {
    title: translate("estimation"),
    path: PATH_PAGE.estimation.root,
    icon: <MenuEstimation />,
    allowedRoles: [
      EST_ADMIN,
      EST_VIEW,
      PRICING_ADMIN,
      PRICING_VIEW,
      SUPER_ADMIN,
      VIEWER,
    ],
    children: [
      {
        title: translate("EffortEstimation"),
        path: PATH_PAGE.estimation.root,
        subicon: <EffortEstimation />,
        allowedRoles: [EST_ADMIN, EST_VIEW, SUPER_ADMIN, VIEWER],
      },
      {
        title: translate("Pricing"),
        path: PATH_PAGE.estimation.pricing,
        subicon: <Pricing />,
        allowedRoles: [PRICING_ADMIN, PRICING_VIEW, SUPER_ADMIN, VIEWER],
      },
    ],
  },
  {
    title: translate("SOWContract"),
    path: PATH_PAGE.contracts.root,
    icon: getIcon("mdi:credit-card-outline"),
    allowedRoles: [
      SOW_ADMIN,
      SOW_VIEW,
      MILESTONE_ADMIN,
      MILESTONE_VIEW,
      PO_ADMIN,
      PO_VIEW,
      SUPER_ADMIN,
      VIEWER,
    ],
    children: [
      {
        title: translate("Contracts"),
        path: PATH_PAGE.contracts.root,
        subicon: <Contracts />,
        allowedRoles: [SOW_ADMIN, SOW_VIEW, SUPER_ADMIN, VIEWER],
      },
      {
        title: translate("Milestones"),
        path: PATH_PAGE.contracts.milestones,
        subicon: <MileStone />,
        allowedRoles: [MILESTONE_ADMIN, MILESTONE_VIEW, SUPER_ADMIN, VIEWER],
      },
      {
        title: translate("PurchaseOrders"),
        path: PATH_PAGE.contracts.purchaseOrder,
        subicon: <PurchaseOrder />,
        allowedRoles: [PO_ADMIN, PO_VIEW, SUPER_ADMIN, VIEWER],
      },
    ],
  },
  {
    title: translate("Allocations"),
    path: PATH_PAGE.allocation.root,
    icon: <MenuAllocation />,
    allowedRoles: [ALLOCATION_ADMIN, ALLOCATION_VIEW, SUPER_ADMIN, VIEWER],
  },
  {
    title: translate("Invoices"),
    path: PATH_PAGE.invoicing.root,
    icon: <MenuInvoicing />,
    allowedRoles: [INVOICE_ADMIN, INVOICE_VIEW, SUPER_ADMIN, VIEWER],
  },
  {
    title: translate("Insights"),
    path: PATH_PAGE.insights.root,
    icon: <InsightsIcon />,
    allowedRoles: [SUPER_ADMIN, DASHBOARD_VIEW],
  },
];

export const DashboardNavConfigPermissionDenied = (translate) => [
  {
    title: translate("Dashboard"),
    path: PATH_PAGE.dashboardPage.root,
    icon: <DashboardIcon />,
  },
  {
    title: translate("clientManagement"),
    path: PATH_PAGE.dashboard,
    icon: <MenuClient />,
  },
  {
    title: translate("ResourceManagement"),
    path: PATH_PAGE.dashboard,
    icon: <MenuResource />,
  },
  {
    title: translate("Timesheets"),
    path: PATH_PAGE.resourcesManagement.root,
    icon: <MenuTimeSheet />,
  },
  {
    title: translate("roles"),
    path: PATH_PAGE.dashboard,
    icon: <MenuRole />,
  },
  {
    title: translate("settings"),
    path: PATH_PAGE.dashboard,
    icon: <MenuSetting />,
  },
];
