import {defineStore} from "pinia";
import i18n from "@/i18n/index.js"
const {t} = i18n.global
export const useUserDepartmentStore = defineStore('userDepartmentStore', {
    state:()=>({
        list:[],
        loading:false,
        saveLoading:false,
        deleteLoading:false,
        visible:false,
        visibleType:true,
        elementId:null,
        visibleLoading:false,
        totalItems:0,
        allPermissionList:[],
        structureCheck:[],
        detail: null,
        payload:{
            worker_positions:[],
        },
        params:{
            page:1,
            per_page:10,
            search:null,
        },
    }),
    actions:{
        _index(){
            this.loading= true
            $ApiService.userDepartmentService._index({params:this.params}).then((res)=>{
                this.list = res.data.data.data
                this.totalItems = res.data.data.total
            }).finally(()=>{
                this.loading= false
            })
        },
        _attach(){
            this.saveLoading = true
            let data = {
                ...this.payload,
            }
            $ApiService.userDepartmentService._attach_user({data, id: this.elementId}).then((res)=>{
                this.visible = false
                this._index()
                this.resetForm()
                // $Toast.success(t('message.successDone'))
            }).finally(()=>{
                this.saveLoading = false
            })
        },
        _show(){
            this.visibleLoading = true
            $ApiService.userDepartmentService._show({id:this.elementId}).then((res)=>{
                console.log(res)
                this.payload.worker_positions = res.data.data.users.map(i=>i.id)
                this.visible = true
            }).finally(()=>{
                this.visibleLoading = false
            })
        },

        openVisible(data){
            this.visible = data
        },
        resetForm(){
            this.payload.worker_positions = []
        }
    }
})