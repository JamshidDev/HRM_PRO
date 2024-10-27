import {AppPaths} from "@/utils/index.js";
import Utils from "@/utils/Utils.js";
import PermissionPage from "@/pages/admin/permission/PermissionPage.vue";
import UserPage from "@/pages/admin/user/UserPage.vue";
import RolePage from "@/pages/admin/role/RolePage.vue";
import CountryPage from "@/pages/admin/country/CountryPage.vue";
import RegionPage from "@/pages/admin/region/RegionPage.vue";


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
]