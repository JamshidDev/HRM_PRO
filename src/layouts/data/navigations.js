import {
    Folder48Filled,
    LockClosed16Filled,
    Person32Filled,
    DocumentPerson20Filled,
    DocumentPerson16Filled,
    PersonNote24Filled,
    Person12Filled,
    DocumentAdd20Filled,
    TextBulletListSquare20Filled,
    ChannelShare20Filled,
    DocumentTextExtract24Filled,
    PeopleCheckmark24Filled,
    PreviewLink16Filled,
    WeatherSunnyLow20Filled,
    Grid20Filled,
    DocumentCopy24Filled,
    PersonClock24Filled,
    GridKanban20Filled,
    BriefcaseMedical20Filled,
    PersonAccounts24Filled,
    BookQuestionMark24Filled,
    Book20Filled,
    HatGraduation12Filled,
    ClipboardBulletListLtr20Filled,
    DocumentEdit20Filled,
    AccessTime24Filled,
    SlideMultipleSearch24Filled,
    BuildingMultiple24Filled,
    ScanObject24Filled,
    Organization12Filled
} from "@vicons/fluent"
import {AppPaths} from "@/utils/index.js";
import Utils from "@/utils/Utils.js"

const {appPermissions} = Utils

import i18n from "@/i18n/index.js"

const {t} = i18n.global

export const navigations = [
    {
        label: 'HRM',
        path: AppPaths.Hrm,
        icon: Person32Filled,
        permission: appPermissions.hr,
        children: [
            {
                label: 'dashboardPage.name',
                path: Utils.routeHrmPathMaker(AppPaths.Dashboard),
                icon: Grid20Filled,
                color: 'bg-dark',
                permission: appPermissions.hrDashboard,
            },
            {
                label: 'workerPage.name',
                path: Utils.routeHrmPathMaker(AppPaths.Worker),
                icon: Person12Filled,
                color: 'bg-primary',
                permission: appPermissions.hrWorkers,
            },
            {
                label: 'departmentPage.name',
                path: Utils.routeHrmPathMaker(AppPaths.Department),
                icon: ChannelShare20Filled,
                color: 'bg-warning',
                permission: appPermissions.hrDepartments,
            },
            {
                label: 'departmentPositionPage.name',
                path: Utils.routeHrmPathMaker(AppPaths.DepartmentPosition),
                icon: TextBulletListSquare20Filled,
                color: 'bg-secondary',
                permission: appPermissions.hrPositions,
            },
            {
                label: 'confirmation.name',
                path: Utils.routeHrmPathMaker(AppPaths.Contract),
                icon: DocumentPerson20Filled,
                color: 'bg-success',
                permission: appPermissions.hrConfirmations,
            },
            {
                label: 'documentPage.tabs.command',
                path: Utils.routeHrmPathMaker(AppPaths.Command),
                icon: DocumentCopy24Filled,
                color: 'bg-secondary',
                permission: appPermissions.hrCommands,
            },
            {
                label: 'documentPage.tabs.adContract',
                path: Utils.routeHrmPathMaker(AppPaths.AdContract),
                icon: DocumentAdd20Filled,
                color: 'bg-warning',
                permission: appPermissions.hrContracts,
            },
            {
                label: 'applicationPage.name',
                path: Utils.routeHrmPathMaker(AppPaths.Application),
                icon: DocumentEdit20Filled,
                color: 'bg-success',
                permission: appPermissions.hrWorkerApplications,
            },
            {
                label: 'confirmationPage.name',
                path: Utils.routeHrmPathMaker(AppPaths.Confirmation),
                icon: PeopleCheckmark24Filled,
                color: 'bg-dark',
                permission: appPermissions.hrConfirmations,
            },
            {
                label: 'vacationPage.name',
                path: Utils.routeHrmPathMaker(AppPaths.Vacation),
                icon: WeatherSunnyLow20Filled,
                color: 'bg-primary',
                permission: appPermissions.hrVacations,
            },
            {
                label: 'timesheetWorkerPage.name',
                path: Utils.routeHrmPathMaker(AppPaths.TimesheetDepartment),
                icon: PersonClock24Filled,
                color: 'bg-warning',
                permission: appPermissions.hrTableWorkers,
            },
            {
                label: 'timesheetPage.name',
                path: Utils.routeHrmPathMaker(AppPaths.TimeSheet),
                icon: GridKanban20Filled,
                color: 'bg-secondary',
                permission: appPermissions.hrTable,
            },
            {
                label: 'medPage.name',
                path: Utils.routeHrmPathMaker(AppPaths.Med),
                icon: BriefcaseMedical20Filled,
                color: 'bg-success',
                permission: appPermissions.hrMed,
            },
            {
                label: 'organizationLeaderPage.name',
                path: Utils.routeHrmPathMaker(AppPaths.OrganizationLeader),
                icon: PersonAccounts24Filled,
                color: 'bg-warning',
                permission: appPermissions.hrMed,
            },
            {
                label: 'reportPage.name',
                path: Utils.routeHrmPathMaker(AppPaths.Slice),
                icon: PreviewLink16Filled,
                color: 'bg-info',
                permission: appPermissions.hrJobs,
            },
        ]
    },
    {
        label: 'Doc Flow',
        path: '/docflow',
        icon: DocumentPerson16Filled,
        permission: appPermissions.confirmation,
        children: [
            {
                label: 'confirmation.name',
                path: Utils.routeDocFlowPathMaker(AppPaths.ConfContract),
                icon: DocumentPerson20Filled,
                color: 'bg-dark',
                permission: appPermissions.confirmation,
            },
            {
                label: 'documentPage.tabs.command',
                path: Utils.routeDocFlowPathMaker(AppPaths.ConfCommand),
                icon: DocumentCopy24Filled,
                color: 'bg-primary',
                permission: appPermissions.confirmationCommands,
            },
            {
                label: 'documentPage.tabs.adContract',
                path: Utils.routeDocFlowPathMaker(AppPaths.ConfAdContract),
                icon: DocumentAdd20Filled,
                color: 'bg-warning',
                permission: appPermissions.confirmationContracts,
            },
            {
                label: 'applicationPage.name',
                path: Utils.routeDocFlowPathMaker(AppPaths.ConfApplication),
                icon: DocumentEdit20Filled,
                color: 'bg-info',
                permission: appPermissions.confirmation,
            },
            {
                label: 'timesheetPage.name',
                path: Utils.routeDocFlowPathMaker(AppPaths.TimeSheet),
                icon: GridKanban20Filled,
                color: 'bg-secondary',
                permission: appPermissions.confirmation,
            },

        ]
    },
    {
        label: 'LMS',
        path: AppPaths.Lms,
        icon: PersonNote24Filled,
        permission: appPermissions.exam,
        children: [
            {
                label: 'topicPage.name',
                path: Utils.routeLmsPathMaker(AppPaths.Topic),
                icon: Book20Filled,
                color: 'bg-warning',
                permission: appPermissions.examTopics,
            },
            {
                label: 'categoryPage.name',
                path: Utils.routeLmsPathMaker(AppPaths.Category),
                icon: BookQuestionMark24Filled,
                color: 'bg-info',
                permission: appPermissions.examCategories,
            },
            {
                label: t('examPage.name'),
                path: Utils.routeLmsPathMaker(AppPaths.Exam),
                icon: HatGraduation12Filled,
                color: 'bg-secondary',
                permission: appPermissions.examExams,
            },
            {
                label: t('examPage.result'),
                path: Utils.routeLmsPathMaker(AppPaths.Result),
                icon: ClipboardBulletListLtr20Filled,
                color: 'bg-dark',
                permission: appPermissions.examExams,
            },
        ]
    },
    {
        label: 'Turnstile',
        path: AppPaths.Turnstile,
        icon: AccessTime24Filled,
        permission: appPermissions.admin,
        children: [
            {
                label: 'turnstile.buildingPage.title',
                path: Utils.routeTurnstilePathMaker(AppPaths.Building),
                icon: BuildingMultiple24Filled,
                color: 'bg-dark',
                permission: appPermissions.users,
            },
            {
                label: 'turnstile.terminalPage.title',
                path: Utils.routeTurnstilePathMaker(AppPaths.Terminal),
                icon: ScanObject24Filled,
                color: 'bg-secondary',
                permission: appPermissions.users,
            },
            {
                label: 'turnstile.organization.title',
                path: Utils.routeTurnstilePathMaker(AppPaths.Organizations),
                icon: Organization12Filled,
                color: 'bg-info',
                permission: appPermissions.users,
            },
        ]
    },
    {
        label: '',
        path: Utils.routeOtherPathMaker(AppPaths.Info),
        icon: SlideMultipleSearch24Filled,
        permission: appPermissions.useful,
        children: []
    },
    {
        label: 'Admin',
        path: AppPaths.Admin,
        icon: LockClosed16Filled,
        permission: appPermissions.admin,
        children: [
            {
                label: 'userPage.name',
                path: Utils.routePathMaker(AppPaths.User),
                icon: Folder48Filled,
                color: 'bg-dark',
                permission: appPermissions.users,
            },
            {
                label: 'userRole.name',
                path: Utils.routePathMaker(AppPaths.UserRole),
                icon: Folder48Filled,
                color: 'bg-dark',
                permission: appPermissions.roles,
            },
            {
                label: 'userPermission.name',
                path: Utils.routePathMaker(AppPaths.UserPermission),
                icon: Folder48Filled,
                color: 'bg-dark',
                permission: appPermissions.permissions,
            },
            {
                label: 'countryPage.name',
                path: Utils.routePathMaker(AppPaths.Country),
                icon: Folder48Filled,
                color: 'bg-dark',
                permission: appPermissions.countries,
            },
            {
                label: 'regionPage.name',
                path: Utils.routePathMaker(AppPaths.Region),
                icon: Folder48Filled,
                color: 'bg-dark',
                permission: appPermissions.regions,
            },
            {
                label: 'districtPage.name',
                path: Utils.routePathMaker(AppPaths.District),
                icon: Folder48Filled,
                color: 'bg-dark',
                permission: appPermissions.cities,
            },
            {
                label: 'nationalityPage.name',
                path: Utils.routePathMaker(AppPaths.Nationality),
                icon: Folder48Filled,
                color: 'bg-dark',
                permission: appPermissions.cities,
            },
            {
                label: 'positionPage.name',
                path: Utils.routePathMaker(AppPaths.Position),
                icon: Folder48Filled,
                color: 'bg-dark',
                permission: appPermissions.cities,
            },
            {
                label: 'schedulePage.name',
                path: Utils.routePathMaker(AppPaths.Schedule),
                icon: Folder48Filled,
                color: 'bg-dark',
                permission: appPermissions.cities,
            },
            {
                label: 'workdayPage.name',
                path: Utils.routePathMaker(AppPaths.Workday),
                icon: Folder48Filled,
                color: 'bg-dark',
                permission: appPermissions.cities,
            },
            {
                label: 'organizationPage.name',
                path: Utils.routePathMaker(AppPaths.Organizations),
                icon: Folder48Filled,
                color: 'bg-dark',
                permission: appPermissions.organizations,
            },
            {
                label: 'actionLog.name',
                path: Utils.routePathMaker(AppPaths.ActionLog),
                icon: Folder48Filled,
                color: 'bg-dark',
                permission: appPermissions.cities,
            },
            {
                label: 'documentSetting.name',
                path: Utils.routePathMaker(AppPaths.DocumentSetting),
                icon: Folder48Filled,
                color: 'bg-dark',
                permission: appPermissions.documentExamples,
            },
            {
                label: 'holidayPage.name',
                path: Utils.routePathMaker(AppPaths.Holiday),
                icon: Folder48Filled,
                color: 'bg-dark',
                permission: appPermissions.cities,
            },
            {
                label: 'othersPage.name',
                path: Utils.routePathMaker(AppPaths.AdminOther),
                icon: Folder48Filled,
                color: 'bg-dark',
                permission: appPermissions.cities,
            },
        ]
    },
]

export const otherNavigations = [
    {
        label: 'loginPage.name',
        path: AppPaths.Login,
        icon: 'bx bxs-user-circle',
    },
    {
        label: 'registerPage.name',
        path: AppPaths.Register,
        icon: 'bx bxs-user-circle',
    },
]