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
        positionVisible:false,
        commandVisible:false,
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
            sex:null,
            address:null,
            // pin:null,
            inn:null,
            phones:[],
            marital_status:null,
            work_experience:null,
            experience_date:null,
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
        previewLoading:false,
        workerPreview:false,
        rolesList:[],
        rolePayload:{
            organization_id:[],
            role:null,
        },
        roleVisible:false,
        structureCheck:[],
        roleLoading:false,

        userRoleParams:{
            page:1,
            per_page:10,
            search:null,
            organizations:[],
        },
        userRoleList:[],
        userRoleLoading:false,
        userRoleTotal:0,

        editVisible:false,
        editPayload:{
            organization_id:[],
            department_id:[],
            department_position_id:null,
            contract_number:null,
            contract_date:null,
            group:null,
            rank:null,
            rate:null,
            type:null,
            salary:null,
            schedule_id:null,
            table_number:null,
        },
        positionLoading:false,
        positionId:null,
        structureCheckV2:[],
        departmentCheckV2:[],
        structureCheck2:[],



    }),
    actions:{
        _index(){
            const componentStore = useComponentStore();
            this.loading= true
            $ApiService.workerService._show({id:this.elementId}).then((res)=>{
                this.data = res.data.data
                this.workerId = this.data?.id

                this.payload.last_name = this.data.last_name
                this.payload.first_name = this.data.first_name
                this.payload.middle_name = this.data.middle_name
                this.payload.work_experience = this.data.work_experience.toString()
                this.payload.birthday = new Date(this.data.birthday).getTime()
                this.payload.experience_date = new Date(this.data.experience_date).getTime()
                this.payload.country_id = this.data.country.id
                this.payload.region_id = this.data.region.id
                this.payload.city_id = this.data.city.id
                this.payload.current_region_id = this.data.current_region.id
                this.payload.current_city_id = this.data.current_city.id
                this.payload.address = this.data.address
                this.payload.nationality_id = this.data.nationality?.id
                this.payload.sex = this.data?.sex
                this.payload.pin = this.data.pin?.toString()
                // this.payload.inn = this.data.inn?.toString()
                this.payload.marital_status = this.data.marital_status?.id


                this.positionList = this.data.positions
                this.districts =[this.data.city]
                this.currentDistricts = [this.data.current_city]
                componentStore.countryList = [this.data.country]

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

                this.payload.phones = this.data.phones.map((v,index)=>({
                    id:v.id,
                    phone:'+998' + v.phone,
                    main:this.data.profile? v.phone === this.data.profile?.phone :index === 0,
                    exist:true,
                }))

                this.rolesList = []
                for (const role of this.data.profile?.roles){
                    const roles =role.organizations.map((x)=>({
                        ...x,
                        roleName:role?.name,
                        roleId:role?.id,
                    }))
                    this.rolesList = [...this.rolesList,...roles]
                }


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
                experience_date:Utils.timeToZone(this.payload.experience_date),
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
                   $ApiService.photoService._create({data}).then((res)=>{
                       this.photos = res.data.data.map(v=>({
                           id:v.id,
                           blob:null,
                           base64:v.photo,
                           url:v.photo,
                           current:v.current
                       }))
                       if(this.photos.filter(v=>v.current>0).length>0){
                           this.mainImgId = this.photos.filter(v=>v.current>0)[0].id
                       }

                   })
               }
                this.loading=false
                // this._index()
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
        _deleteRole(data, id){
            $ApiService.workerService._deleteRole({data, id}).then((res)=>{
                this._index()
            })
        },
        _storeRole(data, id){
            this.roleLoading = true
            $ApiService.workerService._storeRole({data, id}).then((res)=>{
                this._index()
            }).finally(()=>{
                this.roleLoading = false
                this.roleVisible = false
            })
        },
        _updatePosition(){
            const id = this.positionId
            const data = {
                ...this.editPayload,
                ...((this.editPayload.organization_id.length>0 && this.editPayload.department_position_id)? {
                    organization_id:this.editPayload.organization_id?.[0]?.id,
                } : {
                    organization_id:undefined,
                    department_position_id:undefined,
                }),
                department_id:undefined,
            }
            this.positionLoading = true
            $ApiService.workerService._updatePosition({data, id}).then((res)=>{
                console.log(res.data)
                this._index()
            }).finally(()=>{
                this.positionLoading = false
                this.editVisible = false

            })

        },

        _userRole(){
            this.userRoleLoading = true
            const params = {
                ...this.userRoleParams,
                organizations:this.userRoleParams.organizations.map(v=>v.id).toString() || undefined,
            }
            $ApiService.workerService._userRole({params}).then((res)=>{
                this.userRoleList = res.data.data.data
                this.userRoleTotal = res.data.data.total
            }).finally(()=>{
                this.userRoleLoading = false
            })
        },

        resetForm(){
            this.elementId = null
            // this.payload.pin = null
            this.payload.position = null
        }

    }

})