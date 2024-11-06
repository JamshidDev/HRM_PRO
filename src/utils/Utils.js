
import dayjs from "dayjs";
import {AppPaths} from "@/utils/AppPaths.js";

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
    return time? dayjs(time).format('MMMM D, YYYY') : null
}
const noAvailableImage = "/public/default-user.png"

const routePathMaker = (mainPath)=>(`${AppPaths.Admin}${mainPath}`)
const routeHrmPathMaker = (mainPath)=>(`${AppPaths.Hrm}${mainPath}`)
const routeLmsPathMaker = (mainPath)=>(`${AppPaths.Lms}${mainPath}`)
const routeChatPathMaker = (mainPath)=>(`${AppPaths.Chat}${mainPath}`)
const routeDocFlowPathMaker = (mainPath)=>(`${AppPaths.DocFlow}${mainPath}`)










export default {
    fileToBase64,
    onlyAllowNumber,
    getMyLocation,
    timeToZone,
    timeWithMonth,
    noAvailableImage,
    routePathMaker,
    routeHrmPathMaker,
    routeLmsPathMaker,
    routeChatPathMaker,
    routeDocFlowPathMaker,
}