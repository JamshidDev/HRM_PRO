import axios from 'axios';

import router from '../router/index';

const instance = axios.create({
    baseURL: `http://38.242.156.197/api/v1`
});

instance.interceptors.request.use(function (config) {
    let token = localStorage.getItem('access_token') ? localStorage.getItem('access_token') : null;
    if (token) {
        config.headers['Access-Control-Allow-Origin'] = '*'
        config.headers['Authorization'] = 'Bearer ' + token
    }

    return config;
})

instance.interceptors.response.use(
    response => response,
    error => {
        console.log(error.response)
        if(error.response?.status===401){
            if(Array.isArray(error.response.data.detail)){
                error.response.data.detail.forEach((msg, index) => {
                    $Toast.error(msg)
                })
            }
            router.push("/login")
        }else if(error.response?.status===422){
            if(Array.isArray(error.response.data.detail)){
                error.response.data.detail.forEach((msg, index) => {
                    $Toast.error(msg)
                })
            }

        }

        return Promise.reject(error)
    }
);

export default instance