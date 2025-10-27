import {defineStore} from "pinia";
import i18n from "@/i18n/index.js"
import {turnstileHikCentralAccessService} from "@/service/v1/turnstile/index.js"
import Utils from "@/utils/Utils.js"

const {t} = i18n.global
export const useTurnstileHikCentralStore = defineStore('turnstileHikCentralStore', {
    state: () => ({
        list: [],
        totalCount:[],
        loading: false,
        accessLevels: [],
        originAccessLevels: [],
        orgAccessLevels: [],
        orgAccessLevelsLoading: false,
        accessLevelsLoading: false,
        syncLoading: false,
        saveLoading: false,
        deleteLoading: false,
        visible: false,
        visibleType: true,
        elementId: null,
        totalItems: 0,
        allPermissionList: [],
        structureCheck: [],
        params: {
            page: 1,
            per_page:10,
            search: null,
        },
        payload: {
            organization: [],
            access_levels: [],
        },
        departmentList:[],
        deviceList:[],
        deviceLoading:false,
        depPayload:{
            hik_central_department_id:null,
            devices:[],
        },
        onlineDeviceList:[],
        onlineDeviceLoading:false,
        deviceVisible:false,
        searchModel:null,
        originList:[],
        query:null,
        downloading:false,
        short:false,

    }),
    actions: {
        _index(){
            this.loading = true
            const params = {
                ...this.params,
            }
            this.loading = true
            $ApiService.turnstileHikCentralAccessService._index({params}).then((res) => {
                this.list = res.data.data.data
                this.totalItems = res.data.data.total

            }).finally(() => {
                this.loading = false
            })
        },
        _org_levels(){
            this.accessLevelsLoading = true
            $ApiService.turnstileHikCentralAccessService._org_levels({params:{organization_id:this.elementId}}).then((res) => {
                
                if(res.data.data.length === 0){
                    this.accessLevels = this.originAccessLevels
                }else{
                    this.payload.access_levels = res.data.data.map(v=>v.id)
                    const selected = this.originAccessLevels.filter(v=>this.payload.access_levels.includes(v.id))
                    const notSelected = this.originAccessLevels.filter(v=>!this.payload.access_levels.includes(v.id))
                    this.accessLevels = [...selected, ...notSelected]
                }
                
            }).finally(() => {
                this.accessLevelsLoading = false
            })
        },
        _department(){
            this.deviceLoading = true
            $ApiService.turnstileHikCentralAccessService._departments().then((res) => {
                this.departmentList = res.data.data.departments
                this.deviceList = res.data.data.devices
            }).finally(() => {
                this.deviceLoading = false
            })
        },
        _onlineDevice(){
            this.onlineDeviceLoading = true
            $ApiService.turnstileHikCentralAccessService._devices().then((res) => {
                this.onlineDeviceList = res.data.data.data
                this.originList = res.data.data
                this.deviceVisible = true
            }).finally(() => {
                this.onlineDeviceLoading = false
            })
        },
        _downloadDevices(){
            this.downloading = true
            $ApiService.turnstileHikCentralAccessService._downloadDevices({params:{download:true}}).then((res) => {
                Utils.blobFileDownload(res.data,'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'download.xlsx' )
            }).finally(() => {
                this.downloading = false
            })
        },
        _refreshDevice(){
            this.onlineDeviceLoading = true
            $ApiService.turnstileHikCentralAccessService._refreshDevices().then((res) => {
                this._onlineDevice()
            }).finally(() => {
                this.onlineDeviceLoading = false
            })
        },
        _index_access_levels() {
            this.accessLevelsLoading = true
            $ApiService.turnstileHikCentralAccessService._all_access_levels().then((res) => {
                const sorted = res.data.data.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()))
                this.accessLevels = sorted
                this.originAccessLevels = sorted
            }).finally(() => {
                this.accessLevelsLoading = false
            })
        },
        _sync(){
            this.accessLevelsLoading = true
            $ApiService.turnstileHikCentralAccessService._sync().then(() => {
                this._index()
            }).finally(() => {
                this.accessLevelsLoading = false
            })
        },
        _org_access_levels(){
            this.orgAccessLevelsLoading = true
            $ApiService.turnstileHikCentralAccessService._org_access_levels().then((res) => {
                this.orgAccessLevels = res.data.data

            }).finally(() => {
                this.orgAccessLevelsLoading = false
            })
        },
        _attach_org_access_levels(){
            this.saveLoading = true
            let data = {
                organization_id: this.payload.organization[0].id,
                access_levels: this.payload.access_levels,
            }
            $ApiService.turnstileHikCentralAccessService._attach_org_access_levels(data).then((res) => {
                this.payload.organization[0].access_levels = this.accessLevels.filter(i=>data.access_levels.includes(i.id))
            }).finally(() => {
                this.saveLoading = false
            })
        },
        _update() {
            this.saveLoading = true
            let data = {
                ...this.depPayload,
            }
            $ApiService.turnstileHikCentralAccessService._update({data, id: this.elementId}).then((res) => {
                this.visible = false
                this._index()

            }).finally(() => {
                this.saveLoading = false
            })
        },
        resetForm() {
            this.payload.name = null
            this.payload.name_ru = null
            this.payload.name_en = null
        }
    }
})