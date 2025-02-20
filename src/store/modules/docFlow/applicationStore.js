import {defineStore} from "pinia";
import Utils from "@/utils/Utils.js"
export const useApplicationStore = defineStore('applicationStore', {
    state:()=>({
        list:[],
        loading:false,
        saveLoading:false,
        deleteLoading:false,
        visible:false,
        visibleType:true,
        elementId:null,
        totalItems:0,
        departmentCheck:[],
        payload:{
            director_id:true,
            type:null,
            from_date:null,
            status:null,
            department_id:[],
            department_position_id:null,
        },
        params:{
            page:1,
            per_page:10,
            search:null,
        },
        tabList:[1,2,3],
        activeTab:1,
        applicationLink:null,
    }),
    actions:{
        _index(){
            this.loading= true
            $ApiService.commandService._index({params:this.params}).then((res)=>{
                this.list = res.data.data.data
                this.totalItems = res.data.data.total
            }).finally(()=>{
                this.loading= false
            })
        },
        _create(){
            this.saveLoading = true
            let data = {
                ...this.payload,
                ...{
                    department_id:this.payload.department_id?.[0]?.id || null,
                    from_date:Utils.timeToZone(this.payload.from_date),
                }
            }
            $ApiService.applicationService._generateUrl({data}).then((res)=>{
                this.applicationLink = res.data.data.url
                this.activeTab = 2
                this._index()
            }).finally(()=>{
                this.saveLoading = false
            })

        },
        _update(){
            this.saveLoading = true
            $ApiService.nationalityService._update({data:this.payload, id:this.elementId}).then((res)=>{
                this.visible = false
                this._index()
            }).finally(()=>{
                this.saveLoading = false
            })
        },
        _delete(){
            this.deleteLoading = true
            $ApiService.commandService._delete({id:this.elementId}).then((res)=>{
                this._index()
            }).finally(()=>{
                this.deleteLoading = false
            })
        },
        openVisible(data){
            this.visible = data
        },
        resetForm(){
            this.payload.director_id = null
            this.payload.type = null
            this.payload.work_type = null
            this.payload.from_date = null
            this.payload.status = null
        }

    }

})