import {AppPaths} from "@/utils/index.js"
import Utils from "@/utils/Utils.js"
import WorkerPage from "@/pages/hrm/worker/WorkerPage.vue"
import DepartmentPage from "@/pages/hrm/depertment/DepartmentPage.vue"
import DepartmentPositionPage from "@/pages/hrm/departmentPosition/departmentPositionPage.vue"
import CandidatePage from "@/pages/hrm/condidate/CandidatePage.vue"
import ConfirmationPage from "@/pages/hrm/confirmation/ConfirmationPage.vue"
import ProfilePage from "@/pages/hrm/workerProfile/ProfilePage.vue"
import ApplicationPage from "@/pages/docFlow/document/application/ApplicationPage.vue"
import CommandPage from "../../pages/docFlow/document/command/CommandPage.vue"
import AdContractPage from "@/pages/docFlow/document/adContract/AdContractPage.vue"
import ContractPage from "@/pages/docFlow/document/contract/ContractPage.vue"
import VacationPage from "@/pages/hrm/vacation/VacationPage.vue"
import DashboardPage from "@/pages/hrm/dashboard/DashboardPage.vue"
import TimesheetDepartmentPage from "@/pages/hrm/timesheetDepartment/TimesheetDepartmentPage.vue"
import TimeSheetListPage from "@/pages/hrm/timesheet/TimeSheetList.vue"
import DashboardV2Page from "@/pages/hrm/dashboardV2/DashboardV2Page.vue"
import DashboardV3Page from "@/pages/hrm/dashboardV3/DashboardV3Page.vue"

export default [
    {
        path:Utils.routeHrmPathMaker(AppPaths.Worker),
        name:AppPaths.Worker.substring(1),
        component:WorkerPage,
    },
    {
        path:Utils.routeHrmPathMaker(AppPaths.Department),
        name:AppPaths.Department.substring(1),
        component:DepartmentPage,
    },
    {
        path:Utils.routeHrmPathMaker(AppPaths.DepartmentPosition),
        name:AppPaths.DepartmentPosition.substring(1),
        component:DepartmentPositionPage,
    },
    {
        path:Utils.routeHrmPathMaker(`${AppPaths.Worker}${AppPaths.Create}`),
        name:`${AppPaths.Worker.substring(1)}-${AppPaths.Create.substring(1)}`,
        component:CandidatePage,
    },
    {
        path:Utils.routeHrmPathMaker(AppPaths.Confirmation),
        name:AppPaths.Confirmation.substring(1),
        component:ConfirmationPage,
    },
    {
        path:Utils.routeHrmPathMaker(AppPaths.WorkerProfile),
        name:AppPaths.WorkerProfile.substring(1),
        component: ProfilePage,
    },
    {
        path:Utils.routeHrmPathMaker(AppPaths.Application),
        name:AppPaths.Application.substring(1),
        component: ApplicationPage,
    },
    {
        path:Utils.routeHrmPathMaker(AppPaths.Command),
        name:AppPaths.Command.substring(1),
        component:CommandPage,
    },
    {
        path:Utils.routeHrmPathMaker(AppPaths.AdContract),
        name:AppPaths.AdContract.substring(1),
        component:AdContractPage,
    },
    {
        path:Utils.routeHrmPathMaker(AppPaths.Contract),
        name:AppPaths.Contract.substring(1),
        component:ContractPage,
    },
    {
        path:Utils.routeHrmPathMaker(AppPaths.Vacation),
        name:AppPaths.Vacation.substring(1),
        component:VacationPage,
    },
    {
        path:Utils.routeHrmPathMaker(AppPaths.Dashboard),
        name:AppPaths.Dashboard.substring(1),
        component:DashboardPage,
    },
    {
        path:Utils.routeHrmPathMaker(AppPaths.TimesheetDepartment),
        name:AppPaths.TimesheetDepartment.substring(1),
        component:TimesheetDepartmentPage,
    },
    {
        path:Utils.routeHrmPathMaker(AppPaths.TimeSheet),
        name:AppPaths.TimeSheet.substring(1),
        component:TimeSheetListPage,
    },
    {
        path:Utils.routeHrmPathMaker(AppPaths.DashboardV2),
        name:AppPaths.DashboardV2.substring(1),
        component:DashboardV2Page,
    },
    {
        path:Utils.routeHrmPathMaker(AppPaths.DashboardV3),
        name:AppPaths.DashboardV3.substring(1),
        component:DashboardV3Page,
    }


]