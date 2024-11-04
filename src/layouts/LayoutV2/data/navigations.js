
import {AppPaths} from "@/utils/index.js";
import Utils from "@/utils/Utils.js";
import i18n from "@/i18n/index.js"
const {t} = i18n.global

export const navigations = [
    {
        index:1,
        label:'HRM',
        path:'/hrm',
        icon:'bx bx-id-card',
        children:[
            {
                parentIndex:1,
                label:'Korxonalar',
                path:'/hrm/organizations',
                icon:'bx bx-message-rounded-dots',
                children:[]
            },
            {
                parentIndex:1,
                label:'Dashboard',
                path:'/hrm/dashboard',
                icon:'bx bx-message-rounded-dots',
                children:[]
            },
            {
                parentIndex:1,
                label:"Xodimlar",
                path:'/hrm/worker',
                icon:'bx bx-message-rounded-dots',
                children:[]
            },
            {
                parentIndex:1,
                label:"Struktura",
                path:'/hrm/structure',
                icon:'bx bx-message-rounded-dots',
                children:[
                    {
                        label:"Viloyatlar",
                        path:'/hrm/structure/regions',
                        icon:'bx bx-git-commit',
                    },
                    {
                        label:"Tumanlar",
                        path:'/hrm/structure/districts',
                        icon:'bx bx-git-commit',
                    },
                    {
                        label:"Davlatlar",
                        path:'/hrm/structure/country',
                        icon:'bx bx-git-commit',
                    },
                ]
            },
            {
                parentIndex:1,
                label:'Buyruqlar',
                path:'/contact-chat',
                icon:'bx bx-message-rounded-dots',
                children:[]
            },
            {
                parentIndex:1,
                label:'Lavozimlar',
                path:'/contact-chat',
                icon:'bx bx-message-rounded-dots',
                children:[]
            },
            {
                parentIndex:1,
                label:'Oylik hisobot',
                path:'/contact-chat',
                icon:'bx bx-message-rounded-dots',
                children:[]
            },
        ]
    },
    {
        index:2,
        label:'Chat',
        path:'/chat',
        icon:'bx bx-message-dots',
        children:[
            {
                parentIndex:2,
                label:'Organization cadry',
                path:'/chat-organization',
                icon:'bx bx-message-rounded-dots',
                children:[]
            },
            {
                parentIndex:2,
                label:'Private chat',
                path:'/chat-organization',
                icon:'bx bx-message-rounded-dots',
                children:[]
            },
            {
                parentIndex:2,
                label:'Group chat',
                path:'/chat-organization',
                icon:'bx bx-message-rounded-dots',
                children:[]
            },
        ]
    },
    {
        index:3,
        label:'Doc Flow',
        path:'/document',
        icon:'bx bx-message-rounded-dots',
        children:[
            {
                parentIndex:3,
                label:'Organization cadry',
                path:'/chat-organization',
                icon:'bx bx-message-rounded-dots',
                children:[]
            },
            {
                parentIndex:3,
                label:'Private chat',
                path:'/chat-organization',
                icon:'bx bx-message-rounded-dots',
                children:[]
            },
            {
                parentIndex:3,
                label:'Group chat',
                path:'/chat-organization',
                icon:'bx bx-message-rounded-dots',
                children:[]
            },
        ]
    },
    {
        index:4,
        label: 'LMS',
        path: '/learn-student',
        icon: 'bx bxs-graduation',
        children:[
            {
                parentIndex:4,
                label:'Organization cadry',
                path:'/chat-organization',
                icon:'bx bx-message-rounded-dots',
                children:[]
            },
            {
                parentIndex:4,
                label:'Private chat',
                path:'/chat-organization',
                icon:'bx bx-message-rounded-dots',
                children:[]
            },
            {
                parentIndex:4,
                label:'Group chat',
                path:'/chat-organization',
                icon:'bx bx-message-rounded-dots',
                children:[]
            },
        ]
    },
    {
        index:5,
        label:'Face ID',
        path:'/face-id',
        icon:'bx bx-face',
        children:[
            {
                parentIndex:5,
                label:'Organization cadry',
                path:'/chat-organization',
                icon:'bx bx-message-rounded-dots',
                children:[]
            },
            {
                parentIndex:5,
                label:'Private chat',
                path:'/chat-organization',
                icon:'bx bx-message-rounded-dots',
                children:[]
            },
            {
                parentIndex:5,
                label:'Group chat',
                path:'/chat-organization',
                icon:'bx bx-message-rounded-dots',
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
                parentIndex:6,
                label:t('userPage.name'),
                path:Utils.routePathMaker(AppPaths.User),
                icon:'bx bxs-folder',
                children:[]
            },
            {
                parentIndex:6,
                label:t('userRole.name'),
                path:Utils.routePathMaker(AppPaths.UserRole),
                icon:'bx bxs-folder',
                children:[]
            },
            {
                parentIndex:6,
                label:t('userPermission.name'),
                path:Utils.routePathMaker(AppPaths.UserPermission),
                icon:'bx bxs-folder',
            },
            {
                parentIndex:6,
                label:t('countryPage.name'),
                path:Utils.routePathMaker(AppPaths.Country),
                icon:'bx bxs-folder',
            },
            {
                parentIndex:6,
                label:t('regionPage.name'),
                path:Utils.routePathMaker(AppPaths.Region),
                icon:'bx bxs-folder',
            },
            {
                parentIndex:6,
                label:t('districtPage.name'),
                path:Utils.routePathMaker(AppPaths.District),
                icon:'bx bxs-folder',
            },
            {
                parentIndex:6,
                label:t('nationalityPage.name'),
                path:Utils.routePathMaker(AppPaths.Nationality),
                icon:'bx bxs-folder',
            },
            {
                parentIndex:6,
                label:t('positionPage.name'),
                path:Utils.routePathMaker(AppPaths.Position),
                icon:'bx bxs-folder',
            },
            {
                parentIndex:6,
                label:t('organizationPage.name'),
                path:Utils.routePathMaker(AppPaths.Organizations),
                icon:'bx bxs-folder',
            },
        ]
    },
]