import {AppLayouts, AppPaths} from "@/utils/index.js"
import Utils from "@/utils/Utils.js"
import {
    TurnstileBuildingPage,
    TurnstileTerminalPage,
    TurnstileOrganizationPage,
    TurnstileTerminalUserPage,
    TurnstileWorkDurationPage,
    TurnstileAccessLevelsPage,
    TurnstileOrgAccessLevelsPage,
    TurnstileHcWorkersPage,
    HcServerPage,
    HcEventPage,
    WorkerImagePage,
    SyncLogPage,
    DashboardPage,
    HKWorkDurationPage,
    OthersPage,
    DevicesPage,
    HcEventV2Page,
    SchedulePage,
    ShiftTypePage,
    ShiftTypeGroupPage,
    TurnstileSchedulePage,
} from "@/pages/turnstile"


export default [
    {
        path:Utils.routeTurnstilePathMaker(AppPaths.Building),
        component: ()=>TurnstileBuildingPage,
        meta:{
            layout:AppLayouts.main
        },
    },
    {
        path:Utils.routeTurnstilePathMaker(AppPaths.Terminal),
        component: ()=>TurnstileTerminalPage,
        meta:{
            layout:AppLayouts.main
        },
    },
    {
        path:Utils.routeTurnstilePathMaker(AppPaths.Organizations),
        component: ()=>TurnstileOrganizationPage,
        meta:{
            layout:AppLayouts.main
        },
    },
    {
        path:Utils.routeTurnstilePathMaker(AppPaths.User),
        component: ()=>TurnstileTerminalUserPage,
        meta:{
            layout:AppLayouts.main
        },
    },
    {
        path:Utils.routeTurnstilePathMaker(AppPaths.WorkDuration),
        component: ()=>TurnstileWorkDurationPage,
        meta:{
            layout:AppLayouts.main
        },
    },
    {
        path:Utils.routeTurnstilePathMaker(AppPaths.AccessLevels),
        component: ()=>TurnstileAccessLevelsPage,
        meta:{
            layout:AppLayouts.main
        },
    },
    {
        path:Utils.routeTurnstilePathMaker(AppPaths.OrgAccessLevels),
        component: ()=>TurnstileOrgAccessLevelsPage,
        meta:{
            layout:AppLayouts.main
        },
    },
    {
        path:Utils.routeTurnstilePathMaker(AppPaths.HcWorkers),
        component: ()=>TurnstileHcWorkersPage,
        meta:{
            layout:AppLayouts.main
        },
    },
    {
        path:Utils.routeTurnstilePathMaker(AppPaths.HcServer),
        component: ()=>HcServerPage,
        meta:{
            layout:AppLayouts.main
        },
    },
    {
        path:Utils.routeTurnstilePathMaker(AppPaths.HcEvents),
        component: ()=>HcEventPage,
        meta:{
            layout:AppLayouts.main
        },
    },
    {
        path:Utils.routeTurnstilePathMaker(AppPaths.HcEventsV2),
        component: ()=>HcEventV2Page,
        meta:{
            layout:AppLayouts.main
        },
    },
    {
        path:Utils.routeTurnstilePathMaker(AppPaths.WorkerImage),
        component: ()=>WorkerImagePage,
        meta:{
            layout:AppLayouts.main
        },
    },
    {
        path:Utils.routeTurnstilePathMaker(AppPaths.SyncLog),
        component: ()=>SyncLogPage,
        meta:{
            layout:AppLayouts.main
        },
    },
    {
        path:Utils.routeTurnstilePathMaker(AppPaths.Dashboard),
        component: ()=>DashboardPage,
        meta:{
            layout:AppLayouts.main
        },
    },
    {
        path:Utils.routeTurnstilePathMaker(AppPaths.HCWorkDuration),
        component: ()=>HKWorkDurationPage,
        meta:{
            layout:AppLayouts.main
        },
    },
    {
        path:Utils.routeTurnstilePathMaker(AppPaths.Others),
        component: ()=>OthersPage,
        meta:{
            layout:AppLayouts.main
        },
    },
    {
        path:Utils.routeTurnstilePathMaker(AppPaths.Devices),
        component: ()=>DevicesPage,
        meta:{
            layout:AppLayouts.main
        },
    },
    {
        path:Utils.routeTurnstilePathMaker(AppPaths.Schedule),
        component: ()=>SchedulePage,
        meta:{
            layout:AppLayouts.main
        },
    },
    {
        path:Utils.routeTurnstilePathMaker(AppPaths.ShiftType),
        component: ()=>ShiftTypePage,
        meta:{
            layout:AppLayouts.main
        },
    },
    {
        path:Utils.routeTurnstilePathMaker(AppPaths.ShiftTypeGroup),
        component: ()=>ShiftTypeGroupPage,
        meta:{
            layout:AppLayouts.main
        },
    },
    {
        path:Utils.routeTurnstilePathMaker(AppPaths.TurnstileSchedule),
        component: ()=>TurnstileSchedulePage,
        meta:{
            layout:AppLayouts.main
        },
    },
]