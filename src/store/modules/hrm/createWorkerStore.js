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
            academic_title:null,
            academic_degree:null,
            party:null,
            address:null,
            pin:null,
            inn:null,
            phones:[{
                id:1,
                phone:'+998',
                main:true,
            }],
        },
        passport:{
            serial_number:null,
            from_date:null,
            to_date:null,
            address:null,
            c:null,
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
                if(res.data?.errorMsg === 'Ok'){
                    const uuid = res.data.data.uuid
                    this._passportFormData(uuid)
                }else{
                    this.warningVisible = true
                    this.saveLoading = false
                }
            }).catch(()=>{
                this.saveLoading = false
            })
        },
        _passportFormData(uuid){
            if(this.passport.serial_number && this.passport.from_date &&  this.passport.to_date && this.passport.address){
                let formData = new FormData()
                formData.append('uuid', uuid)
                formData.append('serial_number', this.passport.serial_number)
                formData.append('from_date', Utils.timeToZone(this.passport.from_date))
                formData.append('to_date', Utils.timeToZone(this.passport.to_date))
                formData.append('address', this.passport.address)
                formData.append('file', this.passport.file)
                $ApiService.passportService._create({data:formData}).then((res)=>{
                    console.log(res.data)
                }).finally(()=>{
                    this.saveLoading = false
                    this.successVisible = true
                })

            }else{
                this.saveLoading = false
                this.successVisible = true
            }
        },

    }

})