import {Folder48Filled,LockClosed16Filled, PersonChat20Filled, Person32Filled,
    DocumentPerson16Filled, PersonNote24Filled,Person12Filled,
    TextBulletListSquare20Filled, ChannelShare20Filled, DocumentTextExtract24Filled,
    PeopleCheckmark24Filled, DocumentArrowDown20Filled, Archive24Filled, WeatherSunnyLow20Filled} from "@vicons/fluent"
import {AppPaths} from "@/utils/index.js";

import Utils from "../../utils/Utils.js"
import i18n from "@/i18n/index.js"
const {t} = i18n.global

export const navigations = [
    {
        index:1,
        label:'HRM',
        path:AppPaths.Hrm,
        icon:Person32Filled,
        children:[
            {
                label:'workerPage.name',
                path:Utils.routeHrmPathMaker(AppPaths.Worker),
                icon:Person12Filled,
            },
            {
                label:'departmentPage.name',
                path:Utils.routeHrmPathMaker(AppPaths.Department),
                icon:ChannelShare20Filled,
            },
            {
                label:'departmentPositionPage.name',
                path:Utils.routeHrmPathMaker(AppPaths.DepartmentPosition),
                icon:TextBulletListSquare20Filled,
            },
            {
                label:'confirmation.name',
                path:Utils.routeHrmPathMaker(AppPaths.Contract),
                icon:DocumentTextExtract24Filled,
            },
            {
                label:'documentPage.tabs.command',
                path:Utils.routeHrmPathMaker(AppPaths.Command),
                icon:DocumentTextExtract24Filled,
            },
            {
                label:'documentPage.tabs.adContract',
                path:Utils.routeHrmPathMaker(AppPaths.AdContract),
                icon:DocumentTextExtract24Filled,
            },
            {
                label:'applicationPage.name',
                path:Utils.routeHrmPathMaker(AppPaths.Application),
                icon:DocumentArrowDown20Filled,
            },
            {
                label:'confirmationPage.name',
                path:Utils.routeHrmPathMaker(AppPaths.Confirmation),
                icon:PeopleCheckmark24Filled,
            },
            {
                label:'vacationPage.name',
                path:Utils.routeHrmPathMaker(AppPaths.Vacation),
                icon:WeatherSunnyLow20Filled,
            },
        ]
    },
    {
        index:2,
        label:'Chat',
        path:AppPaths.Chat,
        icon:PersonChat20Filled,
        children:[
            {
                parentIndex:1,
                label:'chatWindow.name',
                path:Utils.routeChatPathMaker(AppPaths.ChatWindow),
                icon:Folder48Filled,
                children:[]
            },
        ]
    },
    {
        index:3,
        label:'Doc Flow',
        path:'/docflow',
        icon:DocumentPerson16Filled,
        children:[
            {
                label:'confirmation.name',
                path:Utils.routeDocFlowPathMaker(AppPaths.ConfContract),
                icon:DocumentTextExtract24Filled,
                children:[]
            },
            {
                label:'documentPage.tabs.command',
                path:Utils.routeDocFlowPathMaker(AppPaths.ConfCommand),
                icon:DocumentTextExtract24Filled,
                children:[]
            },
            {
                label:'documentPage.tabs.adContract',
                path:Utils.routeDocFlowPathMaker(AppPaths.ConfAdContract),
                icon:DocumentTextExtract24Filled,
                children:[]
            },
            {
                label:'applicationPage.name',
                path:Utils.routeDocFlowPathMaker(AppPaths.ConfApplication),
                icon:DocumentArrowDown20Filled,
            },
        ]
    },
    {
        index:4,
        label: 'LMS',
        path:AppPaths.Lms,
        icon:PersonNote24Filled,
        children:[
            {
                label:'topicPage.name',
                path:Utils.routeLmsPathMaker(AppPaths.Topic),
                icon:Archive24Filled,
                children:[]
            },
            {
                label:'categoryPage.name',
                path:Utils.routeLmsPathMaker(AppPaths.Category),
                icon:Archive24Filled,
                children:[]
            },
            {
                label:t('examPage.name'),
                path:Utils.routeLmsPathMaker(AppPaths.Exam),
                icon:Archive24Filled,
                children:[]
            },
        ]
    },
    {
        index:5,
        label: 'Labor',
        path:AppPaths.Labor,
        icon:PersonNote24Filled,
        children:[
            {
                label:t('userDepartmentPage.name'),
                path:Utils.routeLaborPathMaker(AppPaths.Department),
                icon:Archive24Filled,
                children:[]
            },
            {
                label:t('userDepartmentPage.timeTable'),
                path:Utils.routeLaborPathMaker(AppPaths.TimeSheet),
                icon:Archive24Filled,
                children:[]
            },
        ]
    },
    {
        index:6,
        label:'Admin',
        path:AppPaths.Admin,
        icon:LockClosed16Filled,
        children:[
            {
                label:'userPage.name',
                path:Utils.routePathMaker(AppPaths.User),
                icon:Folder48Filled,
                children:[]
            },
            {
                label:'userRole.name',
                path:Utils.routePathMaker(AppPaths.UserRole),
                icon:Folder48Filled,
                children:[]
            },
            {
                label:'userPermission.name',
                path:Utils.routePathMaker(AppPaths.UserPermission),
                icon:Folder48Filled,
            },
            {
                label:'countryPage.name',
                path:Utils.routePathMaker(AppPaths.Country),
                icon:Folder48Filled,
            },
            {
                label:'regionPage.name',
                path:Utils.routePathMaker(AppPaths.Region),
                icon:Folder48Filled,
            },
            {
                label:'districtPage.name',
                path:Utils.routePathMaker(AppPaths.District),
                icon:Folder48Filled,
            },
            {
                label:'nationalityPage.name',
                path:Utils.routePathMaker(AppPaths.Nationality),
                icon:Folder48Filled,
            },
            {
                label:'positionPage.name',
                path:Utils.routePathMaker(AppPaths.Position),
                icon:Folder48Filled,
            },
            {
                label:'schedulePage.name',
                path:Utils.routePathMaker(AppPaths.Schedule),
                icon:Folder48Filled,
            },
            {
                label:'workdayPage.name',
                path:Utils.routePathMaker(AppPaths.Workday),
                icon:Folder48Filled,
            },
            {
                label:'organizationPage.name',
                path:Utils.routePathMaker(AppPaths.Organizations),
                icon:Folder48Filled,
            },
            {
                label:'actionLog.name',
                path:Utils.routePathMaker(AppPaths.ActionLog),
                icon:Folder48Filled,
            },
            {
                label:'documentSetting.name',
                path:Utils.routePathMaker(AppPaths.DocumentSetting),
                icon:Folder48Filled,
            },
            {
                label:'holidayPage.name',
                path:Utils.routePathMaker(AppPaths.Holiday),
                icon:Folder48Filled,
            },
            {
                label:'othersPage.name',
                path:Utils.routePathMaker(AppPaths.AdminOther),
                icon:Folder48Filled,
            },
        ]
    },
]

export const otherNavigations = [
    {
        label:'loginPage.name',
        path:AppPaths.Login,
        icon:'bx bxs-user-circle',
    },
    {
        label:'registerPage.name',
        path:AppPaths.Register,
        icon:'bx bxs-user-circle',
    },
]