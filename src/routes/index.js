import { Suspense, lazy } from "react";
import { Navigate, useRoutes, useLocation } from "react-router-dom";

import LogoOnlyLayout from "../layouts/LogoOnlyLayout";
// guards
import GuestGuard from "../guards/GuestGuard";
import AuthGuard from "../guards/AuthGuard";

// components
import LoadingScreen from "../components/LoadingScreen";
import { PATH_PAGE } from "./paths";
import DashboardLayout from "../layouts/dashboard";
import WorkInProgress from "../../src/pages/WorkInProgress"; // Update the path
import PermissionDenied from "../pages/PermissionDenied";
import AccessBasedGuard from "../guards/AccessBasedGuard";
import ROLES from "./Roles";
import MissingTimesheets from "../sections/TimeSheet/MissingTimesheets";
import ResourceUtilization from "../sections/Resource/ResourceUtilization";
import DashBoardCustomView from "../sections/DashBoard/DashBoardView";

//----------------------------------------------------------------------
const Loadable = (Component) => (props) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { pathname } = useLocation();

  return (
    <Suspense
      fallback={
        <LoadingScreen isDashboard={pathname.includes(PATH_PAGE.dashboard)} />
      }
    >
      <Component {...props} />
    </Suspense>
  );
};

export default function Router() {
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
    INVOICE_ADMIN,
    INVOICE_VIEW,
  } = ROLES;
  return useRoutes([
    { path: "/", element: <Navigate to={PATH_PAGE.login} replace /> },
    {
      path: PATH_PAGE.permissionDenied,
      element: <PermissionDenied />,
    },
    {
      path: "",
      element: (
        <GuestGuard>
          <LogoOnlyLayout />
        </GuestGuard>
      ),
      children: [{ path: PATH_PAGE.login, element: <Login /> }],
    },

    // Dashboard Routes
    {
      path: "",
      element: (
        <AuthGuard>
          <DashboardLayout />
        </AuthGuard>
      ),
      children: [
        {
          path: PATH_PAGE.dashboard,
          element: (
            <AccessBasedGuard allowedRoles={ROLES.ALL}>
              {" "}
              <Dashboard />
            </AccessBasedGuard>
          ),
        },
        {
          path: PATH_PAGE.rateCard.root,
          element: (
            <AccessBasedGuard
              allowedRoles={[SUPER_ADMIN, EST_ADMIN, PRICING_ADMIN]}
            >
              {" "}
              <RateCardPage />
            </AccessBasedGuard>
          ),
        },
        {
          path: PATH_PAGE.dashboardPage.root,
          element: (
            <AccessBasedGuard
              allowedRoles={[SUPER_ADMIN, VIEWER, DASHBOARD_VIEW]}
            >
              <DashBoardCustomView />
            </AccessBasedGuard>
          ),
        },
        { path: PATH_PAGE.pageRoles, element: <WorkInProgress /> },
        { path: PATH_PAGE.pageSettings, element: <WorkInProgress /> },
        { path: PATH_PAGE.pageInvoicing, element: <WorkInProgress /> },
        {
          path: "",
          element: <Clients />,
          children: [
            {
              path: PATH_PAGE.client.detail,
              element: (
                <AccessBasedGuard allowedRoles={ALL}>
                  <ClientDetail />
                </AccessBasedGuard>
              ),
            },
            {
              path: "",
              element: <Estimations />,
              children: [
                {
                  path: PATH_PAGE.estimation.root,
                  element: (
                    <AccessBasedGuard
                      allowedRoles={[EST_VIEW, VIEWER, EST_ADMIN, SUPER_ADMIN]}
                    >
                      <EstimationList />
                    </AccessBasedGuard>
                  ),
                },
                {
                  path: PATH_PAGE.estimation.detail,
                  element: <EstimationDetail />,
                },
                {
                  path: PATH_PAGE.estimation.pricing,
                  element: (
                    <AccessBasedGuard
                      allowedRoles={[
                        VIEWER,
                        PRICING_VIEW,
                        PRICING_ADMIN,
                        SUPER_ADMIN,
                      ]}
                    >
                      <Pricing />
                    </AccessBasedGuard>
                  ),
                },
                {
                  path: PATH_PAGE.estimation.pricingDetail,
                  element: <PricingDetail />,
                },
              ],
            },
            {
              path: "",
              element: <Contracts />,
              children: [
                {
                  path: PATH_PAGE.contracts.root,
                  element: (
                    <AccessBasedGuard
                      allowedRoles={[VIEWER, SOW_ADMIN, SOW_VIEW, SUPER_ADMIN]}
                    >
                      <ContractList />
                    </AccessBasedGuard>
                  ),
                },
                {
                  path: PATH_PAGE.contracts.detail,
                  element: <ContractDetail />,
                },
                {
                  path: PATH_PAGE.contracts.milestones,
                  element: (
                    <AccessBasedGuard
                      allowedRoles={[
                        VIEWER,
                        MILESTONE_ADMIN,
                        MILESTONE_VIEW,
                        SUPER_ADMIN,
                      ]}
                    >
                      {" "}
                      <MilestonesList />
                    </AccessBasedGuard>
                  ),
                },
                {
                  path: PATH_PAGE.contracts.milestoneDetail,
                  element: <MilestoneDetail />,
                },
                {
                  path: PATH_PAGE.contracts.purchaseOrder,
                  element: (
                    <AccessBasedGuard
                      allowedRoles={[VIEWER, PO_ADMIN, PO_VIEW, SUPER_ADMIN]}
                    >
                      <PurchaseOrderList />
                    </AccessBasedGuard>
                  ),
                },
                {
                  path: PATH_PAGE.contracts.purchaseOrderDetail,
                  element: <PurchaseOrderDetail />,
                },
              ],
            },
            {
              path: PATH_PAGE.allocation.root,
              element: (
                <AccessBasedGuard
                  allowedRoles={[
                    VIEWER,
                    ALLOCATION_ADMIN,
                    ALLOCATION_VIEW,
                    SUPER_ADMIN,
                  ]}
                >
                  <AllocationList />
                </AccessBasedGuard>
              ),
            },
            {
              path: PATH_PAGE.allocation.detail,
              element: <AllocationDetail />,
            },
            {
              path: PATH_PAGE.invoicing.root,
              element: (
                <AccessBasedGuard
                  allowedRoles={[
                    INVOICE_VIEW,
                    INVOICE_ADMIN,
                    SUPER_ADMIN,
                    VIEWER,
                  ]}
                >
                  <InvoicingList />
                </AccessBasedGuard>
              ),
            },
            {
              path: PATH_PAGE.insights.root,
              element: (
                <AccessBasedGuard allowedRoles={[SUPER_ADMIN, DASHBOARD_VIEW]}>
                  <ClientInsights />
                </AccessBasedGuard>
              ),
            },
            {
              path: "",
              element: <ResourcesManagement />,
              children: [
                {
                  path: PATH_PAGE.resourcesManagement.root,
                  element: (
                    <AccessBasedGuard
                      allowedRoles={[RESOURCE_VIEW, SUPER_ADMIN, VIEWER]}
                    >
                      {" "}
                      <ResourceMetricsScreen />
                    </AccessBasedGuard>
                  ),
                },
                {
                  path: PATH_PAGE.resourcesManagement.detail,
                  element: <WorkInProgress />,
                },
                {
                  path: PATH_PAGE.resourcesManagement.utilization,
                  element: <ResourceUtilizationPage />,
                },
                {
                  path: PATH_PAGE.timesheetManagement.root,
                  element: <TimeSheetList />,
                },
                {
                  path: PATH_PAGE.timesheetManagement.timesheetOverview,
                  element: <TimesheetOverview />,
                },
                {
                  path: PATH_PAGE.timesheetManagement.empTimesheetOverview,
                  element: <EmpTimesheetOverview />,
                },
                {
                  path: PATH_PAGE.timesheetManagement
                    .ongoinProjectTimesheetList,
                  element: <EmpTimesheetOngoingProjectList />,
                },
                {
                  path: PATH_PAGE.timesheetManagement.missingTimesheets,
                  element: <MissingTimesheets />,
                },
                {
                  path: PATH_PAGE.timesheetManagement.empTimesheetTotalHrs,
                  element: <EmpTimesheetTotalHrsCountList />,
                },
              ],
            },
            {
              path: PATH_PAGE.exportTimesheetManagement.root,
              element: <ExportTimesheet />,
            },
            {
              path: "",
              element: <SettingManagment />,
              children: [
                {
                  path: PATH_PAGE.setting.root,
                  element: (
                    <AccessBasedGuard allowedRoles={[SUPER_ADMIN]}>
                      {" "}
                      <RateCardConfigPage />
                    </AccessBasedGuard>
                  ),
                },
                {
                  path: PATH_PAGE.setting.customeraccess,
                  element: <CustomerAccessPage />,
                },
                {
                  path: PATH_PAGE.setting.customerdeatil,
                  element: <CustomerDetail />,
                },
              ],
            },
          ],
        },
      ],
    },

    { path: PATH_PAGE.page404, element: <Page404 /> },
    { path: "*", element: <Navigate to={PATH_PAGE.page404} replace /> },
  ]);
}

// AUTHENTICATION
const Login = Loadable(lazy(() => import("../pages/Login")));

const ClientDetail = Loadable(
  lazy(() => import("../sections/clients/ClientDetails"))
);

const Dashboard = Loadable(lazy(() => import("../pages/Dashboard")));
const ResourcesManagement = Loadable(
  lazy(() => import("../pages/ResourceManagement"))
);
const Clients = Loadable(lazy(() => import("../pages/Clients")));
const Estimations = Loadable(lazy(() => import("../pages/Estimations")));
const EstimationList = Loadable(
  lazy(() => import("../sections/Estimation/EstimationList"))
);

const EstimationDetail = Loadable(
  lazy(() => import("../sections/Estimation/EstimationPreview"))
);
const Contracts = Loadable(lazy(() => import("../pages/Contracts")));
const ContractList = Loadable(
  lazy(() => import("../sections/ContractManagement/ContractList"))
);
const ContractDetail = Loadable(
  lazy(() => import("../sections/ContractManagement/ContractPreview"))
);
const MilestonesList = Loadable(
  lazy(() => import("../sections/ContractManagement/Milestones/MilestonesList"))
);
const MilestoneDetail = Loadable(
  lazy(() =>
    import("../sections/ContractManagement/Milestones/MilestoneDetail")
  )
);
const Pricing = Loadable(
  lazy(() => import("../sections/Estimation/Pricing/Pricing"))
);
const PricingDetail = Loadable(
  lazy(() => import("../sections/Estimation/Pricing/PricingDetail"))
);
const PurchaseOrderList = Loadable(
  lazy(() =>
    import("../sections/ContractManagement/PurchaseOrder/PurchaseOrderList")
  )
);
const PurchaseOrderDetail = Loadable(
  lazy(() =>
    import("../sections/ContractManagement/PurchaseOrder/PurchaseOrderDetail")
  )
);

const AllocationList = Loadable(
  lazy(() => import("../sections/Allocations/AllocationList"))
);

const AllocationDetail = Loadable(
  lazy(() => import("../sections/Allocations/AllocaionDetail"))
);

const InvoicingList = Loadable(
  lazy(() => import("../sections/Invoicing/InvoicesListing"))
);

const ClientInsights = Loadable(
  lazy(() => import("../sections/insights/ClientInsights"))
);

const TimeSheetList = Loadable(
  lazy(() => import("../sections/TimeSheet/TimeSheetListScreen"))
);

const TimesheetOverview = Loadable(
  lazy(() => import("../sections/TimeSheet/TimesheetOverview"))
);

const EmpTimesheetOverview = Loadable(
  lazy(() => import("../sections/TimeSheet/EmpTimeSheetOverviewPage"))
);

const EmpTimesheetOngoingProjectList = Loadable(
  lazy(() => import("../sections/TimeSheet/EmpOngoingProjectTimesheetList"))
);
const EmpTimesheetTotalHrsCountList = Loadable(
  lazy(() => import("../sections/TimeSheet/EmpTotalHrsPage"))
);

const ResourceMetricsScreen = Loadable(
  lazy(() => import("../sections/Resource/ResourceMetrics"))
);
const DashBoardScreen = Loadable(
  lazy(() => import("../sections/DashBoard/DashBoard"))
);

const ExportTimesheet = Loadable(
  lazy(() => import("../sections/TimesheetExport/ExportTimesheet"))
);
const RateCardPage = Loadable(
  lazy(() => import("../sections/Estimation/RateCard/RateCard"))
);
const RateCardConfigPage = Loadable(
  lazy(() => import("../sections/SettingManagment/RateConfigPage"))
);
const ResourceUtilizationPage = Loadable(
  lazy(() => import("../sections/Resource/ResourceUtilization"))
);
const CustomerAccessPage = Loadable(
  lazy(() => import("../sections/SettingManagment/CustomerAccessList"))
);
const CustomerDetail = Loadable(
  lazy(() => import("../sections/SettingManagment/CustomerDetail"))
);
const SettingManagment = Loadable(lazy(() => import("../pages/Setting")));
const Page404 = Loadable(lazy(() => import("../pages/Page404")));
