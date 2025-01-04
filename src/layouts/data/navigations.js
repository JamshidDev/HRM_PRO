
import {AppPaths} from "@/utils/index.js";
import Utils from "@/utils/Utils.js";
import i18n from "@/i18n/index.js"
const {t} = i18n.global

export const navigations = [
    {
        index:1,
        label:'HRM',
        path:AppPaths.Hrm,
        icon:'bx bx-id-card',
        children:[
            {
                label:t('workerPage.name'),
                path:Utils.routeHrmPathMaker(AppPaths.Worker),
                icon:'bx bxs-folder',
            },
            {
                label:t('departmentPage.name'),
                path:Utils.routeHrmPathMaker(AppPaths.Department),
                icon:'bx bxs-folder',
            },
            {
                label:t('departmentPositionPage.name'),
                path:Utils.routeHrmPathMaker(AppPaths.DepartmentPosition),
                icon:'bx bxs-folder',
            },
            {
                label:t('documentPage.name'),
                path:Utils.routeHrmPathMaker(AppPaths.Document),
                icon:'bx bxs-folder',
            },
        ]
    },
    {
        index:2,
        label:'Chat',
        path:AppPaths.Chat,
        icon:'bx bx-message-dots',
        children:[
            {
                parentIndex:1,
                label:t('contactPage.name'),
                path:Utils.routeChatPathMaker(AppPaths.Contact),
                icon:'bx bxs-folder',
                children:[]
            },
        ]
    },
    {
        index:3,
        label:'Doc Flow',
        path:'/docflow',
        icon:'bx bx-message-rounded-dots',
        children:[
            {
                parentIndex:1,
                label:t('documentHistoryPage.name'),
                path:Utils.routeDocFlowPathMaker(AppPaths.DocumentHistory),
                icon:'bx bxs-folder',
                children:[]
            },
        ]
    },
    {
        index:4,
        label: 'LMS',
        path:AppPaths.Lms,
        icon: 'bx bxs-graduation',
        children:[
            {
                parentIndex:1,
                label:t('examPage.name'),
                path:Utils.routeLmsPathMaker(AppPaths.Exam),
                icon:'bx bxs-folder',
                children:[]
            },
        ]
    },
    {
        index:6,
        label:'Admin',
        path:AppPaths.Admin,
        icon:'bx bx-shield-quarter',
        children:[
            {
                label:t('userPage.name'),
                path:Utils.routePathMaker(AppPaths.User),
                icon:'bx bxs-folder',
                children:[]
            },
            {
                label:t('userRole.name'),
                path:Utils.routePathMaker(AppPaths.UserRole),
                icon:'bx bxs-folder',
                children:[]
            },
            {
                label:t('userPermission.name'),
                path:Utils.routePathMaker(AppPaths.UserPermission),
                icon:'bx bxs-folder',
            },
            {
                label:t('countryPage.name'),
                path:Utils.routePathMaker(AppPaths.Country),
                icon:'bx bxs-folder',
            },
            {
                label:t('regionPage.name'),
                path:Utils.routePathMaker(AppPaths.Region),
                icon:'bx bxs-folder',
            },
            {
                label:t('districtPage.name'),
                path:Utils.routePathMaker(AppPaths.District),
                icon:'bx bxs-folder',
            },
            {
                label:t('nationalityPage.name'),
                path:Utils.routePathMaker(AppPaths.Nationality),
                icon:'bx bxs-folder',
            },
            {
                label:t('positionPage.name'),
                path:Utils.routePathMaker(AppPaths.Position),
                icon:'bx bxs-folder',
            },
            {
                label:t('organizationPage.name'),
                path:Utils.routePathMaker(AppPaths.Organizations),
                icon:'bx bxs-folder',
            },
            {
                label:t('actionLog.name'),
                path:Utils.routePathMaker(AppPaths.ActionLog),
                icon:'bx bxs-folder',
            },
            {
                label:t('documentSetting.name'),
                path:Utils.routePathMaker(AppPaths.DocumentSetting),
                icon:'bx bxs-folder',
            },
        ]
    },
]