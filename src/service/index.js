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
        if(error.response?.status==401){
            router.push("/login")
        }
        return Promise.reject(error)
    }
);

export default instance