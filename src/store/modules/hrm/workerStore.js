import {defineStore} from "pinia";
import i18n from "@/i18n/index.js"
import Utils from "@/utils/Utils.js"
const {t} = i18n.global
export const useWorkerStore = defineStore('workerStore', {
    state:()=>({
        list:[],
        loading:false,
        saveLoading:false,
        deleteLoading:false,
        visible:false,
        visibleType:true,
        elementId:null,
        totalItems:0,
        allPermissionList:[],
        payload:{
            pin:null,
            position:null,
        },
        params:{
            page:1,
            per_page:10,
            search:null,
            organizations:[],
            departments:[],
            birthday:null,
            contract_type:null,
            position_type:null,
            ages:[1,100],
            positions:[],
            sex:null,
            nationality_id:null,
            country_id:null,
            region_id:null,
            city_id:null,
            current_region_id:null,
            current_city_id:null,

        },
        structureCheck:[],
        workerVisible:false,

        districtLoading:false,
        districtList:[],

    }),
    actions:{
        _index(){
            this.loading= true
            let params = this._params()
            $ApiService.workerService._index({params}).then((res)=>{
                this.list = res.data.data.data
                this.totalItems = res.data.data.total
            }).finally(()=>{
                this.loading= false
            })
        },
        _show(){
            this.loading= true
            $ApiService.workerService._index({id:this.elementId}).then((res)=>{
                console.log(res.data.data)
            }).finally(()=>{
                this.loading= false
            })
        },
        changeRegion(v){
            this.params.city_id = null
            this.districtLoading = true
            $ApiService.districtService._index({params:{page:1,per_page:1000, region_id:v}}).then((res)=>{
                this.districtList = res.data.data.data
            }).finally(()=>{
                this.districtLoading = false
            })
        },
        _create(){
            this.saveLoading = true
            let data = {
                uuid:this.payload.pin,
                position:this.payload.position,
            }
            $ApiService.confirmationService._create({data}).then((res)=>{
                this.visible = false
                this._index()
               
            }).finally(()=>{
                this.saveLoading = false
            })

        },
        _update(){
            this.saveLoading = true
            let data = {
                uuid:this.payload.pin,
                position:this.payload.position,
            }
            $ApiService.confirmationService._update({data, id:this.elementId}).then((res)=>{
                this.visible = false
                this._index()
               
            }).finally(()=>{
                this.saveLoading = false
            })
        },
        _delete(){
            this.deleteLoading = true
            $ApiService.confirmationService._delete({id:this.elementId}).then((res)=>{
                this._index()
               
            }).finally(()=>{
                this.deleteLoading = false
            })
        },
        _params(){
            return {
                ...this.params,
                organizations:this.params.organizations.map(v=>v.id).toString() || undefined,
                departments:this.params.departments.toString() || undefined,
                positions:this.params.positions.toString() || undefined,
                ages:undefined,
            }
        },
        openVisible(data){
            this.visible = data
        },
        resetForm(){
            this.elementId = null
            this.payload.pin = null
            this.payload.position = null
        }

    }

})