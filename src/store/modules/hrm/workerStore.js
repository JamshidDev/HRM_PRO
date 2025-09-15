import {defineStore} from "pinia";
import i18n from "@/i18n/index.js"
import Utils from "@/utils/Utils.js"
import {AppPaths} from "@/utils/index.js"
import router from "@/router/index.js"
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
            nationalities:[],
            country_id:null,
            region_id:null,
            city_id:null,
            current_region_id:null,
            current_city_id:null,
            marital_status:null,
            first_name:null,
            last_name:null,
            middle_name:null,
            multiple_position:false,

        },
        structureCheck:[],
        workerVisible:false,

        districtLoading:false,
        districtList:[],

        currentDistrictLoading:false,
        currentDistrictList:[],
        userRoleVisible:false,

    }),
    actions:{
        _downloadRelative(){
            this.loading= true
            let params = this._params()
            $ApiService.workerService._downloadRelative({params}).then(()=>{
                router.push(Utils.routeHrmPathMaker(AppPaths.Export))
            }).finally(()=>{
                this.loading= false
            })
        },
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
            }).finally(()=>{
                this.loading= false
            })
        },
        changeRegion(v){
            this.districtLoading = true
            $ApiService.districtService._index({params:{page:1,per_page:1000, region_id:v}}).then((res)=>{
                this.districtList = res.data.data.data
            }).finally(()=>{
                this.districtLoading = false
            })
        },
        changeCurrentRegion(v){
            this.currentDistrictLoading = true
            $ApiService.districtService._index({params:{page:1,per_page:1000, region_id:v}}).then((res)=>{
                this.currentDistrictList = res.data.data.data
            }).finally(()=>{
                this.currentDistrictLoading = false
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

            function cleanParams(params) {
                const cleaned = {};

                Object.entries(params).forEach(([key, value]) => {
                    if (
                        value !== null &&
                        value !== undefined &&
                        value !== "" &&
                        !(Array.isArray(value) && value.length === 0) &&
                        !(typeof value === "boolean" && value === false)
                    ) {
                        cleaned[key] = value;
                    }
                });

                return cleaned;
            }

           const params = {
            ...this.params,
                organizations:this.params.organizations.map(v=>v.id).toString() || undefined,
                nationalities:this.params.nationalities?.toString() || undefined,
                departments:this.params.departments.toString() || undefined,
                positions:this.params.positions.toString() || undefined,
                ages:undefined,
                first_name:this.params.first_name || undefined,
                last_name:this.params.last_name || undefined,
                middle_name:this.params.middle_name || undefined,
                multiple_position:this.params.multiple_position || undefined,
            }

           return  cleanParams(params)

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