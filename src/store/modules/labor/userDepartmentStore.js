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
        prev_workers: [],
        payload:{
            worker_positions:[],
            organizations: [],
            deattach_workers: []
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
        async _attach () {
            this.saveLoading = true
            try {
                if(this.payload.deattach_workers.length){
                    await $ApiService.userDepartmentService._deattach_user({
                        data: {
                            worker_positions: this.payload.deattach_workers,
                        },
                        id: this.elementId
                    })
                }
                if(this.payload.worker_positions.length){
                    await $ApiService.userDepartmentService._attach_user({data:{
                            worker_positions: this.payload.worker_positions,
                        }, id: this.elementId})
                }
                this.visible = false
                this._index()
                this.resetForm()
            }catch (e) {
                console.log(e)
            }finally {
                this.saveLoading = false
            }
        },
        _show(){
            this.visibleLoading = true
            $ApiService.userDepartmentService._show({id:this.elementId}).then((res)=>{

                this.prev_workers = res.data.data.workers
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
            this.payload.deattach_workers = []
            this.prev_workers = []
        }
    }
})