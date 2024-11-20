import {defineStore} from "pinia";
import i18n from "@/i18n/index.js"
const {t} = i18n.global
export const useCreateWorkerStore = defineStore('createWorkerStore', {
    state:()=>({
        loading:false,
        elementId:null,
        payload:{
            first_name:null,
            last_name:null,
            middle_name:null,
            birthday:null,
            country_id:null,
            region_id:null,
            city_id:null,
            current_region_id:null,
            current_city_id:null,
            nationality_id:null,
            academic_title:null,
            academic_degree:null,
            party:null,
            address:null,
            pin:null,
        },
        passport:{
            serial_number:null,
            from_date:null,
            to_date:null,
            address:null,
            file:null,
        },
        params:{
            page:1,
            per_page:10,
            search:null,
        },
        candidatePhotos:[],
        mainImageId:null,

        candidatePhones:[
            {
                id:1,
                phone:'+998'
            }
        ],

        districtList:[],
        districtLoading:false,

        currentDistrictList:[],
        currentDistrictLoading:false,


    }),
    actions:{
        _index(){
            this.loading= true
            $ApiService.departmentService._index({params:this.params}).then((res)=>{
                this.tabDataList[0] = res.data.data.data
                this.totalItems = res.data.data.total
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
        save(){
            this.saveWorkerPhoto()
        },
        saveWorkerPhoto(id){
            console.log(this.candidatePhotos)
        },






    }

})