
import {AppPaths} from "@/utils/index.js";
import Utils from "@/utils/Utils.js";
import i18n from "@/i18n/index.js"
const {t} = i18n.global

export const navigations = [
    {
        index:1,
        label:'HRM',
        path:AppPaths.Hrm,
        icon:'bx bxs-dashboard',
        children:[
            {
                label:t('workerPage.name'),
                path:Utils.routeHrmPathMaker(AppPaths.Worker),
                icon:'bx bxs-user-circle',
            },
            {
                label:t('departmentPage.name'),
                path:Utils.routeHrmPathMaker(AppPaths.Department),
                icon:'bx bxs-dashboard',
            },
            {
                label:t('departmentPositionPage.name'),
                path:Utils.routeHrmPathMaker(AppPaths.DepartmentPosition),
                icon:'bx bx-sitemap',
            },
            {
                label:t('documentPage.name'),
                path:Utils.routeHrmPathMaker(AppPaths.Document),
                icon:'bx bxs-file-archive',
            },
            {
                label:t('confirmationPage.name'),
                path:Utils.routeHrmPathMaker(AppPaths.Confirmation),
                icon:'bx bxs-user-account',
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
        icon:'bx bx-command',
        children:[
            {
                label:t('confirmation.name'),
                path:Utils.routeDocFlowPathMaker(AppPaths.ConfContract),
                icon:'bx bxs-receipt',
                children:[]
            },
            {
                label:t('documentPage.tabs.command'),
                path:Utils.routeDocFlowPathMaker(AppPaths.ConfCommand),
                icon:'bx bxs-file',
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
                label:t('topicPage.name'),
                path:Utils.routeLmsPathMaker(AppPaths.Topic),
                icon:'bx bxs-archive',
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
                label:t('schedulePage.name'),
                path:Utils.routePathMaker(AppPaths.Schedule),
                icon:'bx bxs-folder',
            },
            {
                label:t('workdayPage.name'),
                path:Utils.routePathMaker(AppPaths.Workday),
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
            {
                label:t('othersPage.name'),
                path:Utils.routePathMaker(AppPaths.AdminOther),
                icon:'bx bxs-folder',
            },
        ]
    },
]

export const otherNavigations = [
    {
        label:t('loginPage.name'),
        path:AppPaths.Login,
        icon:'bx bxs-user-circle',
    },
    {
        label:t('registerPage.name'),
        path:AppPaths.Register,
        icon:'bx bxs-user-circle',
    },
]