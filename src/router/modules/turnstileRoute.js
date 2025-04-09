import {AppPaths} from "@/utils/index.js"
import Utils from "@/utils/Utils.js"
import {
    TurnstileBuildingPage,
    TurnstileTerminalPage,
    TurnstileOrganizationPage
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
]