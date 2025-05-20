import {defineStore} from "pinia";
import i18n from "@/i18n/index.js"
import router from '@/router/index.js'
import {AppPaths, useAppSetting} from "@/utils/index.js"
import Utils from "@/utils/Utils.js"
const {t} = i18n.global
export const useAccountStore = defineStore('accountStore', {
    state:()=>({
        account:null,
        saveLoading:false,
        loading:false,
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
        organizationVisible:false,
        activeRole:null,
        roleLoading:false,
        roleList:[],
        permissions:[],
        storageUpdate: 1,
        pn:Utils.appPermissions,
        isModeDev: false
    }),
    getters:{
       checkPermission:(state)=>(permission)=>{
           const storePermissions = sessionStorage.getItem(useAppSetting.appPermission) ? JSON.parse(sessionStorage.getItem(useAppSetting.appPermission)) : []
           const permissions = state.permissions.length>0 ? state.permissions : storePermissions
           return permissions.includes(permission)
       },
        checkAction:(state)=>(permission)=>{
            if(!state.checkPermission(permission) && state.isModeDev){
                $Toast.warning("Devda ligingiz uchun ruxsat berildi!")
                return true
            }
            if(!state.checkPermission(permission)){
               $Toast.warning(t('message.noPermission'))
               return false
            }
            return  true
        },
        fullName:(state)=>Utils.combineFullName(state.account?.worker),
        userPhoto:(state)=>state.account?.worker?.photo,
        telegramPopupVisible: (state)=> {
           if(state.storageUpdate){
            return state.account?.telegram_account === 0 && !localStorage.getItem(useAppSetting.telegramPopup)
           }
        }
    },
    actions:{
        _index(callback){
            $ApiService.accountService._index({data:this.payload}).then((res)=>{
                this.payload = {...res.data.data.worker, password:null}
                this.account = {...res.data.data}
                this.permissions = res.data.data.role.permissions.map(v=>v.name)
                sessionStorage.setItem(useAppSetting.appPermission, JSON.stringify(this.permissions))
                callback?.()
            }).finally(()=>{
                this.loading = false
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
        _roles(){
            this.roleLoading = true
            $ApiService.accountService._roles().then((res)=>{
                this.roleList = []
                res.data.data.map((v)=>{
                    v.organizations.forEach((x)=>{
                        if(x.current){
                            this.activeRole = x.id
                        }
                        this.roleList.push({...x, role:v.name})
                    })
                })
            }).finally(()=>{
                this.roleLoading = false
            })
        },
        _changeRole(id){
            let data = {
                organization_id:id
            }
            $ApiService.accountService._changeRole({data}).then((res)=>{
                this._index()
                router.push(AppPaths.Home)
            })

        },
        resetForm(){
            this.payload.password = null
            this.payload.first_name = null
            this.payload.last_name = null
            this.payload.middle_name = null
            this.payload.user = null
            this.payload.photo = null
        },
        openRoleModal(){
            this.organizationVisible = true
            this._roles()
        },
        changeAccount(id){
            if(id !== this.activeRole){
                this.activeRole = id
                this._changeRole(id)
            }
        },
        hideTelegramPopup(){
            localStorage.setItem(useAppSetting.telegramPopup, 1)
            this.storageUpdate++
        }
    }

})