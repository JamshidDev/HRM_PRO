import {Folder48Filled,LockClosed16Filled, Person32Filled,
    DocumentPerson16Filled, PersonNote24Filled,Person12Filled,
    TextBulletListSquare20Filled, ChannelShare20Filled, DocumentTextExtract24Filled,
    PeopleCheckmark24Filled, DocumentArrowDown20Filled, Archive24Filled, WeatherSunnyLow20Filled,
    Grid20Filled, Document32Filled, PersonClock24Filled, GridKanban20Filled} from "@vicons/fluent"
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
                label:'dashboardPage.name',
                path:Utils.routeHrmPathMaker(AppPaths.Dashboard),
                icon:Grid20Filled,
                color:'bg-dark',
            },
            {
                label:'workerPage.name',
                path:Utils.routeHrmPathMaker(AppPaths.Worker),
                icon:Person12Filled,
                color:'bg-primary',
            },
            {
                label:'departmentPage.name',
                path:Utils.routeHrmPathMaker(AppPaths.Department),
                icon:ChannelShare20Filled,
                color:'bg-warning',
            },
            {
                label:'departmentPositionPage.name',
                path:Utils.routeHrmPathMaker(AppPaths.DepartmentPosition),
                icon:TextBulletListSquare20Filled,
                color:'bg-secondary',
            },
            {
                label:'confirmation.name',
                path:Utils.routeHrmPathMaker(AppPaths.Contract),
                icon:Document32Filled,
                color:'bg-success',
            },
            {
                label:'documentPage.tabs.command',
                path:Utils.routeHrmPathMaker(AppPaths.Command),
                icon:Document32Filled,
                color:'bg-secondary',
            },
            {
                label:'documentPage.tabs.adContract',
                path:Utils.routeHrmPathMaker(AppPaths.AdContract),
                icon:Document32Filled,
                color:'bg-warning',
            },
            {
                label:'applicationPage.name',
                path:Utils.routeHrmPathMaker(AppPaths.Application),
                icon:DocumentArrowDown20Filled,
                color:'bg-success',
            },
            {
                label:'confirmationPage.name',
                path:Utils.routeHrmPathMaker(AppPaths.Confirmation),
                icon:PeopleCheckmark24Filled,
                color:'bg-dark',
            },
            {
                label:'vacationPage.name',
                path:Utils.routeHrmPathMaker(AppPaths.Vacation),
                icon:WeatherSunnyLow20Filled,
                color:'bg-primary',
            },
            {
                label:'timesheetWorkerPage.name',
                path:Utils.routeHrmPathMaker(AppPaths.TimesheetDepartment),
                icon:PersonClock24Filled,
                color:'bg-warning',
            },
            {
                label:'timesheetPage.name',
                path:Utils.routeHrmPathMaker(AppPaths.TimeSheet),
                icon:GridKanban20Filled,
                color:'bg-secondary',
            },
        ]
    },
    // {
    //     index:2,
    //     label:'Chat',
    //     path:AppPaths.Chat,
    //     icon:PersonChat20Filled,
    //     children:[
    //         {
    //             parentIndex:1,
    //             label:'chatWindow.name',
    //             path:Utils.routeChatPathMaker(AppPaths.ChatWindow),
    //             icon:Folder48Filled,
    //             color:'bg-dark',
    //         },
    //     ]
    // },
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
                color:'bg-dark',
            },
            {
                label:'documentPage.tabs.command',
                path:Utils.routeDocFlowPathMaker(AppPaths.ConfCommand),
                icon:DocumentTextExtract24Filled,
                color:'bg-dark',
            },
            {
                label:'documentPage.tabs.adContract',
                path:Utils.routeDocFlowPathMaker(AppPaths.ConfAdContract),
                icon:DocumentTextExtract24Filled,
                color:'bg-dark',
            },
            {
                label:'applicationPage.name',
                path:Utils.routeDocFlowPathMaker(AppPaths.ConfApplication),
                icon:DocumentArrowDown20Filled,
                color:'bg-dark',
            },
            {
                label:'timesheetPage.name',
                path:Utils.routeDocFlowPathMaker(AppPaths.TimeSheet),
                icon:GridKanban20Filled,
                color:'bg-secondary',
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
                color:'bg-dark',
            },
            {
                label:'categoryPage.name',
                path:Utils.routeLmsPathMaker(AppPaths.Category),
                icon:Archive24Filled,
                color:'bg-dark',
            },
            {
                label:t('examPage.name'),
                path:Utils.routeLmsPathMaker(AppPaths.Exam),
                icon:Archive24Filled,
                color:'bg-dark',
            },
        ]
    },
    {
        index:5,
        label:'Admin',
        path:AppPaths.Admin,
        icon:LockClosed16Filled,
        children:[
            {
                label:'userPage.name',
                path:Utils.routePathMaker(AppPaths.User),
                icon:Folder48Filled,
                color:'bg-dark',
            },
            {
                label:'userRole.name',
                path:Utils.routePathMaker(AppPaths.UserRole),
                icon:Folder48Filled,
                color:'bg-dark',
            },
            {
                label:'userPermission.name',
                path:Utils.routePathMaker(AppPaths.UserPermission),
                icon:Folder48Filled,
                color:'bg-dark',
            },
            {
                label:'countryPage.name',
                path:Utils.routePathMaker(AppPaths.Country),
                icon:Folder48Filled,
                color:'bg-dark',
            },
            {
                label:'regionPage.name',
                path:Utils.routePathMaker(AppPaths.Region),
                icon:Folder48Filled,
                color:'bg-dark',
            },
            {
                label:'districtPage.name',
                path:Utils.routePathMaker(AppPaths.District),
                icon:Folder48Filled,
                color:'bg-dark',
            },
            {
                label:'nationalityPage.name',
                path:Utils.routePathMaker(AppPaths.Nationality),
                icon:Folder48Filled,
                color:'bg-dark',
            },
            {
                label:'positionPage.name',
                path:Utils.routePathMaker(AppPaths.Position),
                icon:Folder48Filled,
                color:'bg-dark',
            },
            {
                label:'schedulePage.name',
                path:Utils.routePathMaker(AppPaths.Schedule),
                icon:Folder48Filled,
                color:'bg-dark',
            },
            {
                label:'workdayPage.name',
                path:Utils.routePathMaker(AppPaths.Workday),
                icon:Folder48Filled,
                color:'bg-dark',
            },
            {
                label:'organizationPage.name',
                path:Utils.routePathMaker(AppPaths.Organizations),
                icon:Folder48Filled,
                color:'bg-dark',
            },
            {
                label:'actionLog.name',
                path:Utils.routePathMaker(AppPaths.ActionLog),
                icon:Folder48Filled,
                color:'bg-dark',
            },
            {
                label:'documentSetting.name',
                path:Utils.routePathMaker(AppPaths.DocumentSetting),
                icon:Folder48Filled,
                color:'bg-dark',
            },
            {
                label:'holidayPage.name',
                path:Utils.routePathMaker(AppPaths.Holiday),
                icon:Folder48Filled,
                color:'bg-dark',
            },
            {
                label:'othersPage.name',
                path:Utils.routePathMaker(AppPaths.AdminOther),
                icon:Folder48Filled,
                color:'bg-dark',
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