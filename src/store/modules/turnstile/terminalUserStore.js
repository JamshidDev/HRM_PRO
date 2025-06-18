import {defineStore} from "pinia";
import i18n from "@/i18n/index.js"
import {turnstileTerminalUserService} from "@/service/v1/turnstile/index.js"
import Utils from "@/utils/Utils.js"

const {t} = i18n.global
export const useTurnstileTerminalUserStore = defineStore('turnstileTerminalUserStore', {
    state: () => ({
        list: [],
        loading: false,
        saveLoading: false,
        instanceDataLoading: false,
        instanceData: null,
        visible: false,
        visibleType: true,
        elementId: null,
        deleteLoading: false,
        totalItems: 0,
        structureCheck: [],
        photos: [],
        terminals: [],
        terminalsLoading: false,
        photosLoading: false,
        payload: {
            organization_id: [],
            search_worker_id: null,
            worker_id: null,
            photo_id: null,
            photo_index: null,
            terminals: [],
            to: null,
            isWorker: 1,
            photo: null,
            detachTerminals: [],
            allTerminalsChecked: false
        },
        params: {
            page: 1,
            per_page: 10,
            search: null,
        },
        userPayload:{
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
            work_experience:null,
            experience_date:null,
            pin:null,
            education:null,
            phones:[{
                id:1,
                phone:'+998',
                main:true,
            }],
            marital_status:null,
            photos:[],
        },
        addVisible:false,
        districtList:[],
        currentDistrictList:[],
        districtLoading:false,
        currentDistrictLoading:false,
        mainImageId:null,
        userLoading:false,
    }),
    actions: {
        _index() {
            this.loading = true
            $ApiService.turnstileTerminalUserService._index({params: this.params}).then((res) => {
                this.list = res.data.data.data
                this.totalItems = res.data.data.total
            }).finally(() => {
                this.loading = false
            })
        },
        _create() {
            this.saveLoading = true
            const data = this.payload
            let payload = {
                worker_id: data.worker_id,
                terminals: data.terminals,
            }
            if(data.photo){
                payload.photo = data.photo
            }
            if(data.photo_id){
                payload.photo_id = data.photo_id
            }
            if(data.to){
                payload.to = Utils.timeToZone(data.to)
            }
            $ApiService.turnstileTerminalUserService._create({data: payload}).then((res) => {
                this.visible = false
                this._index()
            }).finally(() => {
                this.saveLoading = false
            })
        },
        _worker_photos() {
            this.photosLoading = true
            $ApiService.turnstileTerminalUserService._worker_photos({params: {worker_id: this.payload.worker_id}}).then((res) => {
                this.photos = res.data.data
            }).finally(() => {
                this.photosLoading = false
            })
        },
        _turnstile_terminals(){
            this.terminalsLoading = true
            $ApiService.turnstileTerminalUserService._turnstile_terminals().then((res) => {
                this.terminals = res.data.data
            }).finally(() => {
                this.terminalsLoading = false
            })
        },
        _show(){
            this.instanceDataLoading = true
            $ApiService.turnstileTerminalUserService._show({id: this.elementId}).then((res) => {
                this.instanceData = res.data.data
            }).finally(() => {
                this.instanceDataLoading = false
            })
        },
        _detach() {
            this.saveLoading = true
            let data = {
                terminals: this.payload.detachTerminals,
            }
            $ApiService.turnstileTerminalUserService._detach({data, id: this.elementId}).then((res) => {
                this.elementId = null
                this._index()
            }).finally(() => {
                this.saveLoading = false
            })
        },
        _delete() {
            this.deleteLoading = true
            $ApiService.turnstileTerminalUserService._delete({id: this.elementId}).then((res) => {
                this._index()
            }).finally(() => {
                this.deleteLoading = false
            })
        },
        resetForm() {
            this.payload.worker_id = null
            this.payload.photo_id = null
            this.payload.photo = null
            this.payload.photo_index = null
            this.payload.terminals = []
            this.payload.organization_id = []
            this.payload.to = null
            this.payload.isWorker = 1
            this.payload.detachTerminals = []
            this.payload.search_worker_id = null
            this.payload.allTerminalsChecked = false
            this.photos = []
            this.terminals = []

            // this.payload.url =null
        },
        changeRegion(v){
            this.userPayload.city_id = null
            this.districtLoading = true
            $ApiService.districtService._index({params:{page:1,per_page:1000, region_id:v}}).then((res)=>{
                this.districtList = res.data.data.data
            }).finally(()=>{
                this.districtLoading = false
            })
        },
        changeCurrentRegion(v){
            this.userPayload.current_city_id = null
            this.currentDistrictLoading = true
            $ApiService.districtService._index({params:{page:1,per_page:1000, region_id:v}}).then((res)=>{
                this.currentDistrictList = res.data.data.data
            }).finally(()=>{
                this.currentDistrictLoading = false
            })
        },
        onDeletePhoto(v){
            this.userPayload.photos = this.userPayload.photos.filter((x)=>x.id !== v.id)
        },
        saveUser(){
            let data = {
                ...this.userPayload,
                pin:this.userPayload.pin.split('-').join(""),
                birthday:Utils.timeToZone(this.userPayload.birthday),
                experience_date:Utils.timeToZone(this.userPayload.experience_date),
                phones:this.userPayload.phones.map((v)=>v.phone.split('-').join('').slice(4)),
                photos:this.userPayload.photos.length>0? this.userPayload.photos.map((v)=>({
                    photo:v.base64,
                    current:v.id === this.mainImageId
                })) : [],
                user_phone:this.userPayload.phones.filter((v)=>v.main)[0].phone.split('-').join('').slice(4),
            }
            this.userLoading = true
            $ApiService.workerService._create({data}).then((res)=>{
                console.log(res.data)
                this.addVisible = false
            }).catch(()=>{
                this.userLoading = false
            })

        },
        resetUserForm(){
            this.userPayload.first_name = null
            this.userPayload.last_name = null
            this.userPayload.middle_name = null
            this.userPayload.birthday = null
            this.userPayload.country_id = null
            this.userPayload.region_id = null
            this.userPayload.city_id = null
            this.userPayload.current_region_id = null
            this.userPayload.current_city_id = null
            this.userPayload.nationality_id = null
            this.userPayload.sex = null

            this.userPayload.academic_title = null
            this.userPayload.academic_degree = null
            this.userPayload.party = null
            this.userPayload.address = null
            this.userPayload.pin = null
            this.userPayload.phones = [{
                id:1,
                phone:'+998',
                main:true,
            }]
            this.userPayload.marital_status = null
            this.userPayload.photos = []
            this.mainImageId = null
            this.userPayload.education = null
        },
    }
})