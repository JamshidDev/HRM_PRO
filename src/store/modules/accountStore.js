import {defineStore} from "pinia";
import router from "@/router"
export const useAccountStore = defineStore('accountStore', {
    state:()=>({
        account:null,
        saveLoading:false,
        activeTab:1,
        tabs:[1,2,3,4],
        payload:{
            password:null,
            first_name:null,
            last_name:null,
            middle_name:null,
            user:null,
            photo:null,
        },
        accountImage:null,
    }),
    actions:{
        _index(){
            $ApiService.accountService._index({data:this.payload}).then((res)=>{
                this.payload = {...res.data.data, password:null}
                this.account = {...res.data.data}
            })
        },
        _update(){
            let data = {...this.payload, photo:null}
            $ApiService.accountService._update({data}).then((res)=>{
                this._index()
            }).finally(()=>{
                this.saveLoading = false
            })
        },
        _updateAvatar(){
            let data = {
                password:null,
                first_name:this.account.first_name,
                last_name:this.account.last_name,
                middle_name:this.account.middle_name,
                user:this.account.uuid,
                photo:this.accountImage,
            }
            $ApiService.accountService._update({data}).then((res)=>{
                this._index()
            }).finally(()=>{
                this.saveLoading = false
            })
        },
        resetForm(){
            this.payload.password = null
            this.payload.first_name = null
            this.payload.last_name = null
            this.payload.middle_name = null
            this.payload.user = null
            this.payload.photo = null
        }
    }

})