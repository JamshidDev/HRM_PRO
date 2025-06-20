
import dayjs from "dayjs";
import {AppPaths} from "@/utils/AppPaths.js";
import CryptoJS from "crypto-js"
import i18n from "@/i18n/index.js"
import {useAppSetting} from "@/utils/AppSetting.js"
import {useDebounceFn} from "@vueuse/core"
const {t} = i18n.global

const lang = localStorage.getItem(useAppSetting.languageKey) || useAppSetting.defaultLanguage
i18n.global.locale = lang

const fileToBase64 = (file)=>{
    return new Promise((resolve, reject)=>{
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = () => resolve(reader.result)
        reader.onerror = (error) => reject(error)
    })
}

const onlyAllowNumber = (value) => !value || /^\d+$/.test(value)

const getMyLocation =()=>{
    return new Promise((resolve, reject)=>{
        if(navigator.geolocation){
            navigator.geolocation.getCurrentPosition((position)=>{
                resolve({
                    lat:position.coords.latitude,
                    long:position.coords.longitude
                })
            })
        }else{
            console.warn("Geolocation is not supported")
            reject(null)
        }

    })

}

const timeToZone = (time)=>{
    return (time === null || time === undefined)? null :dayjs(time).format('YYYY-MM-DD')
}

const timeWithMonth = (time)=>{
    return time? dayjs(time).format('DD.MM.YYYY HH:mm') : null
}
const timeOnlyDate = (time)=>{
    return time? dayjs(time).format('DD.MM.YYYY') : null
}

const timeOnlyHour = (time)=>{
    return time? dayjs(time).format('HH:mm') : null
}
const timeOnlyYear = (time)=>{
    return time? dayjs(time).format('YYYY') : null
}

const datePickerFormatter = (time)=>{
    return  (time === null || time === undefined)? null : new Date(time).getTime()
}

const timePickerFormatter = (time)=>{
    if(!time) return null
    let date = new Date()
    let [hour, min] = time.toString().split(":")
    date.setHours(Number(hour), Number(min), 0)
    return  date.getTime()
}

const timeOnlyMonth = (time)=>{
    return time? dayjs(time).format('M') : null
}

const safeBase64Encode = (str)=>{
    const utf8Bytes = new TextEncoder().encode(str);
    let binary = '';
    for (let byte of utf8Bytes) {
        binary += String.fromCharCode(byte);
    }
}

const base64UrlEncode = (obj)=>{

    return btoa(JSON.stringify(obj))
        .replace(/=+$/, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');
}

const generateJwtToken =(payload,secret)=>{
    const header = {
        alg: 'HS256',
        typ: 'JWT',
    }

    const encodedHeader = base64UrlEncode(header);
    const encodedPayload = base64UrlEncode(payload);
    const signature = CryptoJS.HmacSHA256(`${encodedHeader}.${encodedPayload}`, secret);
    const encodedSignature = signature
        .toString(CryptoJS.enc.Base64)
        .replace(/=+$/, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');
    return `${encodedHeader}.${encodedPayload}.${encodedSignature}`;

}

const noAvailableImage = "/no-picture.jpg"

const fileNameFromUrl = (url)=>{
    return url.split('/').pop()?.split('?')[0].split('#')[0] || '';
}

const formatNumberToMoney = (num)=>{
    if(!num) return
    return  num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}
const routePathMaker = (mainPath)=>(`${AppPaths.Admin}${mainPath}`)
const routeHrmPathMaker = (mainPath)=>(`${AppPaths.Hrm}${mainPath}`)
const routeLmsPathMaker = (mainPath)=>(`${AppPaths.Lms}${mainPath}`)
const routeAccountantPathMaker = (mainPath)=>(`${AppPaths.Accountant}${mainPath}`)
const routeHospitalPathMaker = (mainPath)=>(`${AppPaths.Hospital}${mainPath}`)
const routeAttestationPathMaker = (mainPath)=>(`${AppPaths.Attestation}${mainPath}`)
const routeTurnstilePathMaker = (mainPath)=>(`${AppPaths.Turnstile}${mainPath}`)
const routeChatPathMaker = (mainPath)=>(`${AppPaths.Chat}${mainPath}`)
const routeDocFlowPathMaker = (mainPath)=>(`${AppPaths.DocFlow}${mainPath}`)
const routeTimesheetPathMaker = (mainPath)=>(`${AppPaths.TimeSheet}${mainPath}`)

const documentModels = {
    contract:'contracts',
    command:'commands',
    adContract:'contract-additional',
    workerApplication:'worker-application',
    timesheet:'timesheet',
    med:'med',
}
const copyToClipboard = async (text, callback)=>{
    try {
        await navigator.clipboard.writeText(text)
        callback?.()
    } catch (err) {
        console.warn(err)
        $Toast.error(t('message.unExpectedError'))
    }
}
const convertFromUrlToQuery = (url, status=0)=>{
    if(!url) return url
    const query = url.split('?')[1]
    return `${window.location.origin}${AppPaths.DocumentViewer}/${status}?${query}`
}
const methodTypes = {
    PUT:'put',
    DELETE:'delete',
    POST:'post',
    GET:'get',
}
const ActionTypes = {
    open:"open",
    attachment:"attachment",
    view:"view",
    edit:"edit",
    download:"download",
    delete:"delete",
    timesheet: "timesheet",
    verifier: "verifier",
    close: "close",
    confirm: "confirm",
    finish: "finish"
}
const combineFullName = (user)=>{
    return `${user?.last_name} ${user?.first_name} ${user?.middle_name}`
}
const monthList = [
    {
        name: t('month.january'),
        key: '01',
        id: 1,
    },
    {
        name: t('month.february'),
        key: '02',
        id: 2,
    },
    {
        name: t('month.march'),
        key: '03',
        id: 3,
    },
    {
        name: t('month.april'),
        key: '04',
        id: 4,
    },
    {
        name: t('month.may'),
        key: '05',
        id: 5,
    },
    {
        name: t('month.june'),
        key: '06',
        id: 6,
    },
    {
        name: t('month.july'),
        key: '07',
        id: 7,
    },
    {
        name: t('month.august'),
        key: '08',
        id: 8,
    },
    {
        name: t('month.september'),
        key: '09',
        id: 9,
    },
    {
        name: t('month.october'),
        key: '10',
        id: 10,
    },
    {
        name: t('month.november'),
        key: '11',
        id: 11,
    },
    {
        name: t('month.december'),
        key: '12',
        id: 12,
    },
]
const yearList = [
    {
        name:'2023',
        key: '2023',
        id: 2023,
    },
    {
        name:'2024',
        key: '2024',
        id: 2024,
    },
    {
        name:'2025',
        key: '2025',
        id: 2025,
    },
    {
        name:'2026',
        key: '2026',
        id: 2026,
    },
    {
        name:'2027',
        key: '2027',
        id: 2027,
    },
]
const getMonthNameById = (id)=>{
    return monthList.filter((v)=>v.id === id)?.[0]?.name
}
const getMonthNameByKey = (key)=>{
    return monthList.filter((v)=>v.key === key)?.[0]?.name
}

const maskText =(text, start, end, sign='*') =>{
    const str = text.toString()
    if (str.length <= start + end) return str;
    let startText = str.slice(0, start)
    let endText = str.slice(-end)
    let masked = sign.repeat(str.length - (start + end))
    return startText + masked + endText;
}
const viewerStatus = {
    signatureDocument:'document-signature',
    applicationDocument:"application-document"
}

const debouncedFn = useDebounceFn((callback) => {
    callback?.()
}, 1000, { maxWait: 5000 })

const appPermissions = {

    users:"users",
    admin:"admin",
    usersWrite:"users-write",
    usersRead:"users-read",

    roles:"roles",
    rolesRead:"roles-read",
    rolesWrite:"roles-write",

    permissions:"permissions",
    permissionsRead:"permissions-read",
    permissionsWrite:"permissions-write",

    countries:"countries",
    countriesRead:"countries-read",
    countriesWrite:"countries-write",

    regions:"regions",
    regionsRead:"regions-read",
    regionsWrite:"regions-write",

    cities:"cities",
    citiesRead:"cities-read",
    citiesWrite:"cities-write",

    organizations:"organizations",
    organizationsRead:"organizations-read",
    organizationsWrite:"organizations-write",

    documentExamples:"document-examples",
    documentExamplesRead:"document-examples-read",
    documentExamplesWrite:"document-examples-write",

    organizationServices:"organization-services",
    organizationServicesRead:"organization-services-read",
    organizationServicesWrite:"organization-services-write",

    organizationAdmin:"organization-admin",
    organizationLeader:"organization-leader",
    organization:"organization",
    holidays:'holidays',
    holidaysWrite:'holidays-write',
    holidaysRead:'holidays-read',
    universities:'universities',
    universitiesWrite:'universities-write',
    universitiesRead:'universities-read',
    specialities:'specialities',
    specialitiesWrite:'specialities-write',
    specialitiesRead:'specialities-read',
    languages:'languages',
    languagesWrite:'languages-write',
    languagesRead:'languages-read',
    telegram:'telegram',
    telegramWrite:'telegram-write',
    telegramRead:'telegram-read',
    learningCenters:'learning-centers',
    learningCentersWrite:'learning-centers-write',
    learningCentersRead:'learning-centers-read',

    nationalities:'nationalities',
    nationalitiesWrite:'nationalities-write',
    nationalitiesRead:'nationalities-read',
    positions:'positions',
    positionsWrite:'positions-write',
    positionsRead:'positions-read',
    schedules:'schedules',
    schedulesWrite:'schedules-write',
    schedulesRead:'schedules-read',
    workDay:'work-day',
    workDayWrite:'work-day-write',
    workDayRead:'work-day-read',
    activityLogs:'activity-logs',
    activityLogsWrite:'activity-logs-write',
    activityLogsRead:'activity-logs-read',
    instructions:'instructions',
    instructionsWrite:'instructions-write',
    instructionsRead:'instructions-read',





    hr:"hr",

    hrDashboard:"hr-dashboard",
    hrDashboardRead:"hr-dashboard-read",

    hrWorkers:"hr-workers",
    hrWorkersWrite:"hr-workers-write",
    hrWorkersRead:"hr-workers-read",

    hrDepartments:"hr-departments",
    hrDepartmentsWrite:"hr-departments-write",
    hrDepartmentsRead:"hr-departments-read",

    hrPositions:"hr-positions",
    hrPositionsWrite:"hr-positions-write",
    hrPositionsRead:"hr-positions-read",

    hrContracts:"hr-contracts",
    hrContractsWrite:"hr-contracts-write",
    hrContractsRead:"hr-contracts-read",

    hrCommands:"hr-commands",
    hrCommandsWrite:"hr-commands-write",
    hrCommandsRead:"hr-commands-read",

    hrContractAdditional:"hr-contract-additional",
    hrContractAdditionalWrite:"hr-contract-additional-write",
    hrContractAdditionalRead:"hr-contract-additional-read",

    hrWorkerApplications:"hr-worker-applications",
    hrWorkerApplicationsWrite:"hr-worker-applications-write",
    hrWorkerApplicationsRead:"hr-worker-applications-read",

    hrConfirmations:"hr-confirmations",
    hrConfirmationsWrite:"hr-confirmations-write",
    hrConfirmationsRead:"hr-confirmations-read",

    hrVacations:"hr-vacations",
    hrVacationsWrite:"hr-vacations-write",
    hrVacationsRead:"hr-vacations-read",

    hrTableWorkers:"hr-table-workers",
    hrTableWorkersWrite:"hr-table-workers-write",
    hrTableWorkersRead:"hr-table-workers-read",

    hrTable:"hr-table",
    hrTableWrite:"hr-table-write",
    hrTableRead:"hr-table-read",

    hrMed:"hr-med",
    hrMedWrite:"hr-med-write",
    hrMedRead:"hr-med-read",

    hrLeaders: 'hr-leaders',
    hrLeadersWrite: 'hr-leaders-write',
    hrLeadersRead: 'hr-leaders-read',

    hrExport: 'hr-export',

    hrBusinessTrip: 'hr-business-trip',
    hrBusinessTripWrite: 'hr-business-trip-write',
    hrBusinessTripRead: 'hr-business-trip-read',

    hrDocuments: 'hr-documents',
    hrDocumentsWrite: 'hr-documents-write',
    hrDocumentsRead: 'hr-documents-read',

    hrVacationSchedule: 'hr-vacation-schedule',
    hrVacationScheduleWrite: 'hr-vacation-schedule-write',
    hrVacationScheduleRead: 'hr-vacation-schedule-read',

    hrUsers: 'hr-users',
    hrUsersWrite: 'hr-users-write',
    hrUsersRead: 'hr-users-read',

    hrReport: 'hr-report',
    hrReportWrite: 'hr-report-write',
    hrReportRead: 'hr-report-read',

    confirmation:"confirmation",
    confirmationContracts:"confirmation-contracts",
    confirmationAddContracts:"confirmation-contracts-additional",
    confirmationCommands:"confirmation-commands",
    confirmationWorkerApplications:"confirmation-worker-applications",
    confirmationTable:"confirmation-table",

    exam:"exam",

    examTopics:"exam-topics",
    examTopicsWrite:"hr-topics-write",
    examTopicsRead:"hr-topics-read",

    examCategories:"exam-categories",
    examCategoriesWrite:"exam-categories-write",
    examCategoriesRead:"exam-categories-read",

    examExams:"exam-exams",
    examExamsWrite:"hr-exams-write",
    examExamsRead:"hr-exams-read",

    examResults: 'exam-results',
    examResultsWrite: 'exam-results-write',
    examResultsRead: 'exam-results-read',

    turnstile: 'turnstile',
    turnstileBuilding: 'turnstile-building',
    turnstileBuildingWrite: 'turnstile-building-write',
    turnstileBuildingRead: 'turnstile-building-read',
    turnstileTerminal: 'turnstile-terminal',
    turnstileTerminalRead: 'turnstile-terminal-read',
    turnstileTerminalWrite: 'turnstile-terminal-write',
    turnstileOrganization: 'turnstile-organization',
    turnstileOrganizationWrite: 'turnstile-organization-write',
    turnstileOrganizationRead: 'turnstile-organization-read',
    turnstileWorkers: 'turnstile-workers',
    turnstileWorkersWrite: 'turnstile-workers-write',
    turnstileWorkersRead: 'turnstile-workers-read',
    turnstileWorkDuration: "turnstile-work-duration",
    turnstileWorkDurationRead: "turnstile-work-duration-read",
    turnstileWorkDurationWrite: "turnstile-work-duration-write",
    turnstileWorkDurationShow: "turnstile-work-duration-show",
    turnstileWorkDurationLogs: "turnstile-work-duration-logs",
    hrJobs:"hr-jobs",
    hrJobsWrite:"hr-jobs-write",
    hrJobsRead:"hr-jobs-read",

    hrIncentives:"hr-incentives",
    hrIncentivesWrite:"hr-incentives-write",
    hrIncentivesRead:"hr-incentives-read",

    hrPunishment:"hr-discips",
    hrPunishmentWrite:"hr-discips-write",
    hrPunishmentRead:"hr-discips-read",

    hospital: "hospital",
    hospitalExpired: "hospital-expired",
    hospitalExpiredWrite: "hospital-expired-write",
    hospitalExpiredRead: "hospital-expired-read",
    hospitalTicket: "hospital-ticket",
    hospitalTicketWrite: "hospital-ticket-write",
    hospitalTicketRead: "hospital-ticket-read",



    useful:'useful',
    ai:'ai',


}

const colorTypes = {
    info:"Info",
    warning:"Warning",
    error:"Error",
    success:"Success",
    dark:"Dark",
    secondary:"Secondary",
}

const blobFileDownload = (file, contentType, fileName)=>{
    try{
        const blob = new Blob([file], {type:contentType})
        const link = document.createElement("a");
        link.href = window.URL.createObjectURL(blob);
        link.setAttribute("download", fileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }catch (e){
        console.log(e)
    }

}

const downloadFileByUrl = (url)=>{
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", 'file')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
}

const checkRequestBody = (body)=>{
    if(body){
        for(let key in body){
            if(body[key] === '' || body[key] === null ||  body[key]?.length === 0 ){
                delete body[key]
            }
        }
    }

}

function formatPhoneWithMask(phone, mask) {
    const digits = phone?.toString()?.replace(/\D/g, '')

    if (!mask || !mask.includes('#')) {
        return "Iltimos, to'g'ri maska kiriting (# belgisi bo'lishi kerak)";
    }

    const maskDigitCount = (mask.match(/#/g) || []).length;

    let result = mask;
    let digitIndex = 0;

    while (result.includes('#') && digitIndex < digits.length) {
        result = result.replace('#', digits[digitIndex]);
        digitIndex++;
    }

    if (result.includes('#')) {
        const parts = result.split('#');
        result = parts[0];

        for (let i = 1; i < parts.length; i++) {
            if (i <= digitIndex) {
                result += parts[i];
            }
        }
    }

    if (digits.length > maskDigitCount) {
        const limitedDigits = digits.slice(0, maskDigitCount);
        return formatPhoneWithMask(limitedDigits, mask);
    }

    return result.trim();
}

const documentStatus = {
    'null':{
        id:2,
        name:t('enum.noCreated')
    },
    '1':{
        id:2,
        name:t('enum.noCreated')
    },
    '2':{
        id:1,
        name:t('enum.working')
    },
    '3':{
        id:3,
        name:t('enum.done')
    },
    '4':{
        id:4,
        name:t('enum.bug')
    },
}

const formatToMLN = (num, index=0)=>{
    if(!num) return 0
    return (num/1000000).toFixed(index)
}

const disablePasteDate = (v, date) =>{
    if(!date) return false
    return v<date
}

const startWorkTime = [
    {
        name:'09:30',
        id:'09:30',
    },
    {
        name:'09:00',
        id:'09:00',
    },
    {
        name:'08:30',
        id:'08:30',
    },
    {
        name:'08:00',
        id:'08:00',
    },
]

export default {
    formatToMLN,
    startWorkTime,
    disablePasteDate,
    fileToBase64,
    onlyAllowNumber,
    getMyLocation,
    timeToZone,
    timeWithMonth,
    timeOnlyDate,
    timeOnlyHour,
    timeOnlyMonth,
    datePickerFormatter,
    timePickerFormatter,
    noAvailableImage,
    routePathMaker,
    routeHrmPathMaker,
    routeLmsPathMaker,
    routeChatPathMaker,
    routeAttestationPathMaker,
    routeDocFlowPathMaker,
    routeTurnstilePathMaker,
    routeAccountantPathMaker,
    routeHospitalPathMaker,
    generateJwtToken,
    fileNameFromUrl,
    documentModels,
    copyToClipboard,
    ActionTypes,
    timeOnlyYear,
    combineFullName,
    monthList,
    yearList,
    getMonthNameById,
    getMonthNameByKey,
    maskText,
    convertFromUrlToQuery,
    viewerStatus,
    methodTypes,
    routeTimesheetPathMaker,
    formatNumberToMoney,
    debouncedFn,
    appPermissions,
    colorTypes,
    blobFileDownload,
    downloadFileByUrl,
    checkRequestBody,
    formatPhoneWithMask,
    documentStatus,
    safeBase64Encode,

}