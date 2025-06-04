import {defineStore} from "pinia";
import i18n from "@/i18n/index.js"
import Utils from "@/utils/Utils.js"
const {t} = i18n.global
export const useMedInspectionStore = defineStore('medInspectionStore', {
    state:()=>({
        list:[],
        loading:false,
        saveLoading:false,
        deleteLoading:false,
        visible:false,
        visibleType:true,
        elementId:null,
        totalItems:0,
        payload:{
            organization_id:[],
            hospital_id:null,
            worker_position_id:null,
            worker_id:null,
            start_date:null,
        },
        params:{
            page:1,
            per_page:10,
            search:null,
        },
        hospitalList:[],
        hospitalLoading:false,
        polyclinicLoading:false,
        polyclinicList:[],
    }),
    actions:{
        _index(){
            this.loading= true
            const params = {
                ...this.params,
                uuid:this.uuid,
                // organizations:this.params.organizations.map(v=>v.id).toString() || undefined,
            }
            $ApiService.medInspectionService._index({params}).then((res)=>{
                this.list = res.data.data.data
                this.totalItems = res.data.data.total
            }).finally(()=>{
                this.loading= false
            })
        },
        _polyclinics(){
            this.hospitalLoading= true
            $ApiService.medInspectionService._polyclinics({params:{page:1,per_page:1000}}).then((res)=>{
                this.hospitalList = res.data.data.data
            }).finally(()=>{
                this.hospitalLoading= false
            })
        },
        _myPolyclinics(){
            this.polyclinicLoading = true
            $ApiService.polyclinicService._index({params:{page:1,per_page:1000}}).then((res)=>{
                this.polyclinicList = res.data.data.data
            }).finally(()=>{
                this.polyclinicLoading = false
            })
        },

        _create(){
            this.saveLoading = true
            const data = {
                ...this.payload,
                polyclinic_id:this.payload.hospital_id,
                start_date:Utils.timeToZone(this.payload.start_date),
                organization_id:undefined,
                hospital_id:undefined,
            }
            $ApiService.medInspectionService._create({data}).then((res)=>{
                this.visible = false
                this._index()
            }).finally(()=>{
                this.saveLoading = false
            })

        },
        _update(){
            this.saveLoading = true
            const data = {
                ...this.payload,
                uuid:this.uuid,
            }
            $ApiService.militaryService._update({data, id:this.elementId}).then((res)=>{
                this.visible = false
                this._index()

            }).finally(()=>{
                this.saveLoading = false
            })
        },
        _delete(){
            this.deleteLoading = true
            $ApiService.militaryService._delete({id:this.elementId}).then((res)=>{
                this._index()

            }).finally(()=>{
                this.deleteLoading = false
            })
        },
        openVisible(data){
            this.visible = data
        },
        resetForm() {
            this.elementId = null
            this.payload.organization_id = []
            this.payload.hospital_id = null
            this.payload.worker_id = null
            this.payload.start_date = new Date().getTime()
            this.payload.worker_position_id = null
        },

    }

})