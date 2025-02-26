import {AppPaths} from "@/utils/index.js";
import Utils from "@/utils/Utils.js";
import PermissionPage from "@/pages/admin/permission/PermissionPage.vue";
import UserPage from "@/pages/admin/user/UserPage.vue";
import RolePage from "@/pages/admin/role/RolePage.vue";
import CountryPage from "@/pages/admin/country/CountryPage.vue";
import RegionPage from "@/pages/admin/region/RegionPage.vue";
import DistrictPage from "@/pages/admin/district/DistrictPage.vue";
import NationalityPage from "@/pages/admin/nationality/NationalityPage.vue";
import PositionPage from "@/pages/admin/position/PositionPage.vue"
import OrganizationPage from "@/pages/admin/organization/OrganizationPage.vue"
import ActionLogPage from "@/pages/admin/actionLog/ActionLogPage.vue"
import OthersPage from "@/pages/admin/others/OthersPage.vue"
import SchedulePage from "@/pages/admin/schedule/SchedulePage.vue"
import WorkdayPage from "@/pages/admin/workday/WorkdayPage.vue"
import DocumentTemplate from "@/pages/admin/document/DocumentTemplate.vue"
import HolidayPage from "@/pages/admin/holiday/HolidayPage.vue"


export default  [
    {
        path:Utils.routePathMaker(AppPaths.UserPermission),
        name:AppPaths.UserPermission.substring(1),
        component:PermissionPage,
        children:[],
    },
    {
        path:Utils.routePathMaker(AppPaths.User),
        name:AppPaths.User.substring(1),
        component:UserPage,
        children:[],
    },
    {
        path:Utils.routePathMaker(AppPaths.UserRole),
        name:AppPaths.UserRole.substring(1),
        component:RolePage,
        children:[],
    },
    {
        path:Utils.routePathMaker(AppPaths.Country),
        name:AppPaths.Country.substring(1),
        component:CountryPage,
        children:[],
    },
    {
        path:Utils.routePathMaker(AppPaths.Region),
        name:AppPaths.Region.substring(1),
        component:RegionPage,
        children:[],
    },
    {
        path:Utils.routePathMaker(AppPaths.District),
        name:AppPaths.District.substring(1),
        component:DistrictPage,
        children:[],
    },
    {
        path:Utils.routePathMaker(AppPaths.Nationality),
        name:AppPaths.Nationality.substring(1),
        component:NationalityPage,
    },
    {
        path:Utils.routePathMaker(AppPaths.Position),
        name:AppPaths.Position.substring(1),
        component:PositionPage,
    },
    {
        path:Utils.routePathMaker(AppPaths.Organizations),
        name:AppPaths.Organizations.substring(1),
        component:OrganizationPage,
    },
    {
        path:Utils.routePathMaker(AppPaths.ActionLog),
        name:AppPaths.ActionLog.substring(1),
        component:ActionLogPage,
    },
    {
        path:Utils.routePathMaker(AppPaths.DocumentSetting),
        name:AppPaths.DocumentSetting.substring(1),
        component:DocumentTemplate,
    },
    {
        path:Utils.routePathMaker(AppPaths.AdminOther),
        name:AppPaths.AdminOther.substring(1),
        component:OthersPage,
    },
    {
        path:Utils.routePathMaker(AppPaths.Schedule),
        name:AppPaths.Schedule.substring(1),
        component:SchedulePage,
    },
    {
        path:Utils.routePathMaker(AppPaths.Workday),
        name:AppPaths.Workday.substring(1),
        component:WorkdayPage,
    },
    {
        path:Utils.routePathMaker(AppPaths.Holiday),
        name:AppPaths.Holiday.substring(1),
        component:HolidayPage,
    },
]