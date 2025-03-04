import {defineStore} from "pinia";
import i18n from "@/i18n/index.js"
const {t} = i18n.global
import router from '@/router/index.js'
import {AppPaths} from "@/utils/index.js"
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
        organizationVisible:false,
        activeRole:null,
        roleLoading:false,
        roleList:[],
    }),
    actions:{
        _index(){
            $ApiService.accountService._index({data:this.payload}).then((res)=>{
                console.log(res.data.data)
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
                $Toast.success(t('message.successDone'))
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
        }
    }

})