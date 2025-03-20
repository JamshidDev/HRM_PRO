
import dayjs from "dayjs";
import {AppPaths} from "@/utils/AppPaths.js";
import CryptoJS from "crypto-js"
import i18n from "@/i18n/index.js"
import {useAppSetting} from "@/utils/AppSetting.js"
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
    return time? dayjs(time).format('YYYY-MM-DD') : null
}

const timeWithMonth = (time)=>{
    return time? dayjs(time).format('DD.MM.YYYY HH:mm') : null
}
const timeOnlyDate = (time)=>{
    return time? dayjs(time).format('YYYY.MM.DD') : null
}

const timeOnlyHour = (time)=>{
    return time? dayjs(time).format('HH:mm') : null
}
const timeOnlyYear = (time)=>{
    return time? dayjs(time).format('YYYY') : null
}

const datePickerFormatter = (time)=>{
    return time? new Date(time).getTime() : null
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



const noAvailableImage = "/public/no-picture.jpg"

const fileNameFromUrl = (url)=>{
    return url.split('/').pop()?.split('?')[0].split('#')[0] || '';
}

const routePathMaker = (mainPath)=>(`${AppPaths.Admin}${mainPath}`)
const routeHrmPathMaker = (mainPath)=>(`${AppPaths.Hrm}${mainPath}`)
const routeLmsPathMaker = (mainPath)=>(`${AppPaths.Lms}${mainPath}`)
const routeChatPathMaker = (mainPath)=>(`${AppPaths.Chat}${mainPath}`)
const routeDocFlowPathMaker = (mainPath)=>(`${AppPaths.DocFlow}${mainPath}`)
const routeTimesheetPathMaker = (mainPath)=>(`${AppPaths.TimeSheet}${mainPath}`)

const documentModels = {
    contract:'contracts',
    command:'commands',
    adContract:'contract-additional',
    workerApplication:'worker-application',
    timesheet:'timesheet',
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
}
const combineFullName = (user)=>{
    return `${user.last_name} ${user.first_name} ${user.middle_name}`
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
const getMonthNameById = (id)=>{
    return monthList.filter((v)=>v.id === id)?.[0]?.name
}
const getMonthNameByKey = (key)=>{
    return monthList.filter((v)=>v.key === key)?.[0]?.name
}
const maskText =(text, start, end) =>{
    const str = text.toString()
    if (str.length <= start + end) return str;
    let startText = str.slice(0, start)
    let endText = str.slice(-end)
    let masked = "*".repeat(str.length - (start + end))
    return startText + masked + endText;
}
const viewerStatus = {
    signatureDocument:'document-signature',
    applicationDocument:"application-document"
}


export default {
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
    routeDocFlowPathMaker,
    generateJwtToken,
    fileNameFromUrl,
    documentModels,
    copyToClipboard,
    ActionTypes,
    timeOnlyYear,
    combineFullName,
    monthList,
    getMonthNameById,
    getMonthNameByKey,
    maskText,
    convertFromUrlToQuery,
    viewerStatus,
    methodTypes,
    routeTimesheetPathMaker
}