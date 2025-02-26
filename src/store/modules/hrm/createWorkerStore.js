import {defineStore} from "pinia";
import i18n from "@/i18n/index.js"
import Utils from "@/utils/Utils.js"
const {t} = i18n.global
export const useCreateWorkerStore = defineStore('createWorkerStore', {
    state:()=>({
        loading:false,
        saveLoading:false,
        elementId:null,
        passportFileName:null,
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
            address:null,
            pin:null,
            inn:null,
            phones:[{
                id:1,
                phone:'+998',
                main:true,
            }],
            marital_status:null,
            serial_number:null,
            from_date:null,
            to_date:null,
            passport_address:null,
            file:null,
        },
        params:{
            page:1,
            per_page:10,
            search:null,
        },
        candidatePhotos:[],
        mainImageId:null,
        districtList:[],
        districtLoading:false,
        currentDistrictList:[],
        currentDistrictLoading:false,
        warningVisible:false,
        successVisible:false,
        visible:false,
        savedWorker:null,


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
            this.saveLoading = true
            let data = {...this.payload}
            data.pin = this.payload.pin.split('-').join("")
            data.birthday = Utils.timeToZone(this.payload.birthday)
            data.phones = this.payload.phones.map((v)=>v.phone.split('-').join('').slice(4))
            data.photos = this.candidatePhotos.length>0? this.candidatePhotos.map((v)=>({
                photo:v.base64,
                current:v.id === this.mainImageId
            })) : []
            data.user_phone = this.payload.phones.filter((v)=>v.main)[0].phone.split('-').join('').slice(4)

            $ApiService.workerService._create({data}).then((res)=>{
                if(!res.data?.error){
                    const v = res.data.data
                    this.savedWorker = {
                        lastName:v?.last_name,
                        firstName:v?.first_name,
                        middleName:v?.middle_name,
                        position:`${t('workerPage.checkWorker.born')} ${Utils.timeOnlyDate(v?.birthday)}`,
                        photo:v.photo,
                        pin:v.id.toString()
                    }

                    this._passportFormData(v.id)
                }else{
                    this.warningVisible = true
                    this.saveLoading = false
                }
            }).catch(()=>{
                this.saveLoading = false
            })
        },
        _successEv(){
            this.visible = false
        },
        _passportFormData(id){
            let formData = new FormData()
            formData.append('worker_id', id)
            formData.append('serial_number', this.payload.serial_number)
            formData.append('from_date', Utils.timeToZone(this.payload.from_date))
            formData.append('to_date', Utils.timeToZone(this.payload.to_date))
            formData.append('address', this.payload.address)
            formData.append('file', this.payload.passport_address ?? '')
            $ApiService.passportService._create({data:formData}).then((res)=>{
            }).finally(()=>{
                this.saveLoading = false
                this.successVisible = true
            })
        },
        _resetForm(){
            this.payload.first_name = null
            this.payload.last_name = null
            this.payload.middle_name = null
            this.payload.birthday = null
            this.payload.country_id = null
            this.payload.region_id = null
            this.payload.city_id = null
            this.payload.current_region_id = null
            this.payload.current_city_id = null
            this.payload.nationality_id = null
            this.payload.academic_title = null
            this.payload.academic_degree = null
            this.payload.party = null
            this.payload.address = null
            this.payload.pin = null
            this.payload.inn = null
            this.payload.phones = [{
                id:1,
                phone:'+998',
                main:true,
            }]
            this.payload.marital_status = null
            this.payload.serial_number = null
            this.payload.from_date = null
            this.payload.to_date = null
            this.payload.passport_address = null
            this.payload.file = null

            this.passportFileName = null
            this.candidatePhotos = []
            this.mainImageId = null
        },

    }

})