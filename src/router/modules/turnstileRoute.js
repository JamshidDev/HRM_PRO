import {AppPaths} from "@/utils/index.js"
import Utils from "@/utils/Utils.js"
import {
    TurnstileBuildingPage,
    TurnstileTerminalPage,
    TurnstileOrganizationPage,
    TurnstileTerminalUserPage,
    TurnstileWorkDurationPage,
    TurnstileAccessLevelsPage,
    TurnstileOrgAccessLevelsPage,
    TurnstileHcWorkersPage
} from "@/pages/turnstile";


export default [
    {
        path:Utils.routeTurnstilePathMaker(AppPaths.Building),
        component: ()=>TurnstileBuildingPage,
        children:[],
    },
    {
        path:Utils.routeTurnstilePathMaker(AppPaths.Terminal),
        component: ()=>TurnstileTerminalPage,
        children:[],
    },
    {
        path:Utils.routeTurnstilePathMaker(AppPaths.Organizations),
        component: ()=>TurnstileOrganizationPage,
        children:[],
    },
    {
        path:Utils.routeTurnstilePathMaker(AppPaths.User),
        component: ()=>TurnstileTerminalUserPage,
        children:[],
    },
    {
        path:Utils.routeTurnstilePathMaker(AppPaths.WorkDuration),
        component: ()=>TurnstileWorkDurationPage,
        children:[],
    },
    {
        path:Utils.routeTurnstilePathMaker(AppPaths.AccessLevels),
        component: ()=>TurnstileAccessLevelsPage,
        children:[],
    },
    {
        path:Utils.routeTurnstilePathMaker(AppPaths.OrgAccessLevels),
        component: ()=>TurnstileOrgAccessLevelsPage,
        children:[],
    },
    {
        path:Utils.routeTurnstilePathMaker(AppPaths.HcWorkers),
        component: ()=>TurnstileHcWorkersPage,
        children:[],
    },
]