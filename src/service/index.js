import axios from 'axios';
const apiUrl = import.meta.env.VITE_API_URL;

import router from '../router/index';

const instance = axios.create({
    baseURL: `${apiUrl}/api`
});

instance.interceptors.request.use(function (config) {
    let token = localStorage.getItem('token') ? localStorage.getItem('token') : null;
    if (token) {
        config.headers['Authorization'] = 'Bearer ' + token
    }

    return config;
})

instance.interceptors.response.use(
    response => {
        if(response.data?.errorMsg === 'Yes'){
            $Toast.error(error.response.data.message)
        }
        return Promise.resolve(response)
    },
    error => {
        if(error.response.data?.errorMsg === 'Yes'){
            $Toast.error(error.response.data.message)
        }
        if(error.response?.status===401){
            if(!(error.response.request.responseURL.includes('/profile'))){
                $Toast.error(error.response.data.message)
            }

            router.push("/login")
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