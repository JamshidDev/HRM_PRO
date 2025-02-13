
import dayjs from "dayjs";
import {AppPaths} from "@/utils/AppPaths.js";
import CryptoJS from "crypto-js"

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
    return time? dayjs(time).format('YYYY-MM-DDTHH:mm:ssZ') : null
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


const documentModels = {
    contract:'contracts',
    command:'commands',
    adContract:'contract-additional',
}







export default {
    fileToBase64,
    onlyAllowNumber,
    getMyLocation,
    timeToZone,
    timeWithMonth,
    timeOnlyDate,
    timeOnlyHour,
    noAvailableImage,
    routePathMaker,
    routeHrmPathMaker,
    routeLmsPathMaker,
    routeChatPathMaker,
    routeDocFlowPathMaker,
    generateJwtToken,
    fileNameFromUrl,
    documentModels,
}