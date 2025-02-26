
import {defineStore} from "pinia";
import {useRouter} from "vue-router"
const otpExpireTime = import.meta.env.VITE_OTP_EXPIRE_TIME

export const useRegisterStore = defineStore('registerStore', {
    state:()=>({
        payload:{
            phone:"+998",
            first_name:null,
            last_name:null,
            middle_name:null,
            pin:null,
            password:null,
        },
        create:{
            otp:null,
        },
        loading:false,
        otpLoading:false,
        tabList:[1,2],
        activeTab:1,
        showReSendButton:false,
        otpToken:null,
        otpExpireTime:otpExpireTime,
        otpErrorMessage:null



    }),
    actions:{
        _registerOtp(){
            this.loading = true
            let phone = this.payload.phone.slice(4).replace('(','').replace(')','')
            let pin = this.payload.pin.replace(/-/g, "")
            let data = {...this.payload,phone, pin}
            sessionStorage.setItem('registerOtp', JSON.stringify(data))

            $ApiService.authService._registerOtp({data}).then((res)=>{
                console.log(res.data)
                this.otpToken = res.data.data.user
                this.activeTab=2
            }).catch((error)=>{
                if(error.response.data.errorMsg === "otp_all_ready"){
                    this.activeTab=2
                }
            }).finally(()=>{
                this.loading = false
            })
        },
        registerUser(){
            this.otpErrorMessage = null
            this.otpLoading = true
            let userInfo = sessionStorage.getItem('registerOtp')? JSON.parse(sessionStorage.getItem('registerOtp')):null
            let data = {
                photo:null,
                pin:userInfo.pin,
                password:userInfo.password,
                otp:this.create.otp,
                user: this.otpToken,
                phone:userInfo.phone,
            }
            $ApiService.authService._register({data}).then((res)=>{
                console.log(res.data.message)


            }).catch((error)=>{
                this.otpErrorMessage = error.response?.data?.message
            }).finally(()=>{
                this.otpLoading = false
            })

        },
        reSendOtp(){
            this.showReSendButton = false
        },
        onFinish(){
            this.showReSendButton = true
            this.otpExpireTime = otpExpireTime
        }
    }

})