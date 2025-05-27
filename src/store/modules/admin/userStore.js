import {defineStore} from "pinia"
import {useAccountStore} from "@/store/modules/index.js"
import {AppPaths, useAppSetting} from "@/utils/index.js"
import router from "@/router/index.js"

export const useUserStore = defineStore('user', {
    state:()=>({
        list:[],
        loading:false,
        saveLoading:false,
        deleteLoading:false,
        visible:false,
        visibleType:true,
        elementId:null,
        totalItems:0,
        structureCheck:[],
        payload:{
            role_id:null,
            organization_id:[],
        },
        params:{
            page:1,
            per_page:10,
            search:null,
        },
        roleList:[],
        roleLoading:false,

        myRoleList:[],
        myRoleLoading:false,
        loginLoading:false,
    }),
    actions:{
        _index(){
            this.loading= true
            $ApiService.userService._index({params:this.params}).then((res)=>{
                this.list = res.data.data.data
                this.totalItems = res.data.data.total
            }).finally(()=>{
                this.loading= false
            })
        },
        _loginById(id, callback){
            this.loginLoading= true
            $ApiService.userService._loginByIdToSystem({id}).then((res)=>{
                callback(res.data.access_token)
            }).finally(()=>{
                this.loginLoading= false
            })
        },

        _roles(){
            this.roleLoading= true
            $ApiService.userRoleService._index({params:{page:1, per_page:10000}}).then((res)=>{
                this.roleList = res.data.data.data
            }).finally(()=>{
                this.roleLoading= false
            })
        },
        _myRoles(){
            this.myRoleLoading= true
            $ApiService.userService._myRoles({id:this.elementId}).then((res)=>{
                this.myRoleList = res.data.data
            }).finally(()=>{
                this.myRoleLoading= false
            })
        },
        _create(){
            this.saveLoading = true
            const data = {
                ...this.payload,
                uuid:this.elementId,
                organization_id:this.payload.organization_id[0].id,
            }
            $ApiService.userService._create({data}).then((res)=>{
                this.payload.role_id = null
                this.payload.organization_id = []
                this._myRoles()
            }).finally(()=>{
                this.saveLoading = false
            })

        },
        _update(){
            this.saveLoading = true
            const data = {
                ...this.payload,
                uuid:this.elementId,
                organization_id:this.payload.organization_id[0].id,
            }
            $ApiService.userService._update({data, id:this.elementId}).then((res)=>{
                this._myRoles()
            }).finally(()=>{
                this.saveLoading = false
            })
        },
        _delete(){
            this.deleteLoading = true
            $ApiService.userService._delete({id:this.elementId}).then((res)=>{
                console.log(res.data)
            }).finally(()=>{
                this.deleteLoading = false
            })
        },
        openVisible(visible){
            this.visible = visible
        }

    }

})