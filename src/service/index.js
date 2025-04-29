import axios from 'axios'
import {AppPaths, useAppSetting} from "@/utils/index.js"
import router from '../router/index'
import Utils from "@/utils/Utils.js"

const apiUrl = import.meta.env.VITE_API_URL;


const instance = axios.create({
    baseURL: `${apiUrl}/api`
});


instance.interceptors.request.use(function (config) {
    let token = localStorage.getItem(useAppSetting.tokenKey) || null;
    config.headers['Accept-Language'] = localStorage.getItem(useAppSetting.languageKey) || useAppSetting.defaultLanguage
    config.headers['Access-Control-Allow-Origin'] = '*'
    if (token) {
        config.headers['Authorization'] = 'Bearer ' + token
    }

    return config;
})

instance.interceptors.response.use(
    response => {
        if([Utils.methodTypes.PUT,Utils.methodTypes.POST, Utils.methodTypes.DELETE].includes(response.config.method)){
            if(!response.data?.error && response?.data?.message && typeof response.data?.message === 'string'){
                $Toast.success(response.data.message.toString())
            }
        }
        return Promise.resolve(response)
    },
    error => {
        if(error.response?.data?.error){
            $Toast.error(error.response?.data?.message)
        }
        if(error.response?.status===401){
            if(!(error.response.request.responseURL.includes(AppPaths.Profile))){
                $Toast.error(error.response.data.message)
            }
            localStorage.clear()
            router.push(AppPaths.Login)
        }else if(error.response?.status===422){
            if(Array.isArray(error.response.data.detail)){
                error.response.data.detail.forEach((item, index) => {
                    $Toast.error(item?.msg || "No message")
                })
            }

        }

        return Promise.reject(error)
    }
);

export default instance