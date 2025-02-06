import {defineStore} from "pinia";
import Utils from "@/utils/Utils.js"
import {useComponentStore} from "@/store/modules/index.js"

export const useWorkerProfileStore = defineStore('workerProfileStore', {
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
            phones:[],
            marital_status:null,
        },
        params:{
            page:1,
            per_page:10,
            search:null,
        },
        tabs:[
            {
                name:'workerProfile.tabs.personal',
                id:1,
            },
            {
                name:'workerProfile.tabs.education',
                id:2,
            },
            {
                name:'workerProfile.tabs.career',
                id:3,
            },
            {
                name:'workerProfile.tabs.relative',
                id:4,
            },
            {
                name:'workerProfile.tabs.others',
                id:5,
            },
        ],
        activeTab:1,
        data:null,

        districts:[],
        districtLoading:false,
        currentDistricts:[],
        currentDistrictLoading:false,

        mainImgId:null,
        photos:[],

        workerId:null,
        passportLoading:false,
        passportList:[],

        positionList:[],



    }),
    actions:{
        _index(){
            const componentStore = useComponentStore();
            this.loading= true
            $ApiService.workerService._show({id:this.elementId}).then((res)=>{
                this.data = res.data.data
                this.workerId = this.data.profile.id

                this.payload.last_name = this.data.last_name
                this.payload.first_name = this.data.first_name
                this.payload.middle_name = this.data.middle_name
                this.payload.birthday = new Date(this.data.birthday).getTime()
                this.payload.country_id = this.data.country.id
                this.payload.region_id = this.data.region.id
                this.payload.city_id = this.data.city.id
                this.payload.current_region_id = this.data.current_region.id
                this.payload.current_city_id = this.data.current_city.id
                this.payload.address = this.data.address
                this.payload.academic_title = this.data.academic_title.id
                this.payload.academic_degree = this.data.academic_degree.id
                this.payload.nationality_id = this.data.nationality.name.id
                this.payload.pin = this.data.pin?.toString()
                this.payload.inn = this.data.inn?.toString()
                this.payload.party = this.data.party.id


                this.positionList = this.data.positions
                this.districts =[this.data.city]
                this.currentDistricts = [this.data.current_city]
                componentStore.countryList = [this.data.country]
                componentStore.nationalityList = [this.data.nationality.name]

                if(this.data.region.id ===this.data.current_region.id){
                    componentStore.regionList = [{...this.data.region}]
                }else{
                    componentStore.regionList = [{...this.data.region},{...this.data.current_region}]
                }


                this.photos = this.data.photos.map(v=>({
                    id:v.id,
                    blob:null,
                    base64:v.photo,
                    url:v.photo,
                    current:v.current
                }))
                if(this.photos.filter(v=>v.current>0).length>0){
                    this.mainImgId = this.photos.filter(v=>v.current>0)[0].id
                }

                this.payload.phones = this.data.phones.map(v=>({
                    id:v.id,
                    phone:'+998' + v.phone,
                    main:v.phone === this.data.profile.phone,
                    exist:true,
                }))
            }).finally(()=>{
                this.loading= false
            })
        },
        savePersonalInfo(){
            this.loading=true
            const data = {
                ...this.payload,
                pin:this.payload.pin.split('-').join(""),
                birthday:Utils.timeToZone(this.payload.birthday),
                user_phone:this.payload.phones.filter(v=>v.main)[0].phone.split('-').join('').slice(4),
                phones:this.payload.phones.map((v)=>v.phone.split('-').join('').slice(4)),
            }
            const id = this.workerId
            $ApiService.workerService._update({data,id}).then((res)=>{
                this._index()
            }).finally(()=>{
                this.loading=false
            })
        },
        savePhoto(){
            const photos = this.photos.filter(v=>v.blob !== null).map(v=>({
                current:this.mainImgId === v.id,
                photo:v.base64
            }))
            const worker_id = this.workerId
            if(photos.length > 0){
                this.loading=true
               for(let i=0;i<photos.length;i++){
                   const data = {
                       worker_id,
                       ...photos[i],
                   }
                   $ApiService.photoService._create({data})
               }
                this.loading=false
                this._index()
            }else if(this.photos.length>0){
                this.loading=true
                    const data = {
                        current:true,
                        photo:null,
                    }
                $ApiService.photoService._update({data, id:this.mainImgId})
                    .then(()=>{
                        this._index()
                    })
                    .finally(()=>{
                    this.loading=false
                })
            }



        },
        _deletePhoto(id){
            this.loading=true
            $ApiService.photoService._delete({id}).then((res)=>{
                this._index()
            }).finally(()=>{
                this.loading=false
            })

        },
        _district(){
            let region_id = this.payload.region_id
            this.districtLoading = true
            $ApiService.districtService._index({params:{page:1,per_page:1000, region_id}}).then((res)=>{
                this.districts = res.data.data.data
            }).finally(()=>{
                this.districtLoading = false
            })
        },
        _currentDistrict(){
            let region_id = this.payload.current_region_id
            this.currentDistrictLoading = true
            $ApiService.districtService._index({params:{page:1,per_page:1000, region_id}}).then((res)=>{
                this.currentDistricts = res.data.data.data
            }).finally(()=>{
                this.currentDistrictLoading = false
            })
        },

        _indexPassport(){
            this.passportLoading = true
            const params ={
                uuid:this.elementId
            }
            $ApiService.passportService._index({params}).then((res)=>{
                this.passportList = res.data.data.map(v=>({
                    id:v.id,
                    serial_number:v.serial_number,
                    address:v.address,
                    from_date:new Date(v.from_date).getTime(),
                    to_date:new Date(v.to_date).getTime(),
                    file:{
                        name:v.file
                    },
                    exist:true,
                }))
            }).finally(()=>{
                this.passportLoading = false
            })
        },
        _storePassport(data){
            this.passportLoading = true
            $ApiService.passportService._create({data}).then((res)=>{
                this._indexPassport()
            }).finally(()=>{
                this.passportLoading = false
            })
        },
        _updatePassport(data, id){
            this.passportLoading = true
            const params={
                _method:'PUT'
            }
            $ApiService.passportService._update({data, id, params}).then((res)=>{
                this._indexPassport()
            }).finally(()=>{
                this.passportLoading = false
            })

        },
        _deletePassport(id){
            this.passportLoading = true
            $ApiService.passportService._delete({id}).then((res)=>{
                this._indexPassport()
            }).finally(()=>{
                this.passportLoading = false
            })
        },
        _deletePhone(id){
            this.loading=true
            $ApiService.phoneService._delete({id}).then((res)=>{
                this._index()
            }).finally(()=>{

            })

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