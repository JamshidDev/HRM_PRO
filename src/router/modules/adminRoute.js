import {AppPaths} from "@/utils/index.js";
import Utils from "@/utils/Utils.js";
import PermissionPage from "@/pages/admin/permission/PermissionPage.vue";
import UserPage from "@/pages/admin/user/UserPage.vue";
import RolePage from "@/pages/admin/role/RolePage.vue";


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
]