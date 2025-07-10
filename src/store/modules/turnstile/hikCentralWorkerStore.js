import {defineStore} from "pinia";
import i18n from "@/i18n/index.js"
import {turnstileHikCentralAccessService, turnstileHikCentralWorkerService} from "@/service/v1/turnstile/index.js"
import Utils from "@/utils/Utils.js"

const {t} = i18n.global
export const useTurnstileHikCentralWorkerStore = defineStore('turnstileHikCentralWorkerStore', {
    state: () => ({
        list: [],
        loading: false,
        accessLevels: [],
        accessLevelsLoading: false,
        saveLoading: false,
        deleteLoading: false,
        visible: false,
        visibleType: true,
        elementId: null,
        totalItems: 0,
        allPermissionList: [],
        structureCheck: [],
        photos: [],
        photosLoading: false,
        params: {
            page: 1,
            per_page: 10,
            search: null,
        },
        payload: {
            level_org_id: [],
            worker_org_id: [],
            worker_wrapper_id: null,
            worker_id: null,
            photo_id: null,
            photo_index: null,
            access_level_id: null,
            photo: null,
            end_time: null
        },
    }),
    actions: {
        _index() {
            this.loading = true
            $ApiService.turnstileHikCentralWorkerService._index({params: this.params}).then((res) => {
                this.list = res.data.data.data
                this.totalItems = res.data.data.total
            }).finally(() => {
                this.loading = false
            })
        },
        _add_worker(){
            this.saveLoading = true
            console.log(this.payload)
            let payload = {
                access_level_id: this.payload.access_level_id,
                worker_id: this.payload.worker_id,
                end_time: Utils.timeToZone(this.payload.end_time)
            }
            if(this.payload.photo){
                payload.photo = this.payload.photo
            }
            if(this.payload.photo_id){
                payload.photo_id= this.payload.photo_id
            }
            $ApiService.turnstileHikCentralWorkerService._add_worker(payload).then((res) => {
                this.visible = false
                this._index()
            }).finally(() => {
                this.saveLoading = false
            })
        },
        _worker_photos() {
            this.photosLoading = true
            this.photos = []
            $ApiService.turnstileTerminalUserService._worker_photos({params: {worker_id: this.payload.worker_id}}).then((res) => {
                this.photos = res.data.data
            }).finally(() => {
                this.photosLoading = false
            })
        },
        _access_levels() {
            this.accessLevels = []
            this.accessLevelsLoading = true
            $ApiService.turnstileHikCentralWorkerService._access_levels({
                organization_id: this.payload.level_org_id[0].id,
            }).then((res) => {
                this.accessLevels = res.data.data
            }).finally(() => {
                this.accessLevelsLoading = false
            })
        },
        // _create() {
        //     this.saveLoading = true
        //     let data = {
        //         ...this.payload,
        //     }
        //     $ApiService.turnstileBuildingService._create({data}).then((res) => {
        //         this.visible = false
        //         this._index()
        //
        //     }).finally(() => {
        //         this.saveLoading = false
        //     })
        // },
        // _update() {
        //     this.saveLoading = true
        //     let data = {
        //         ...this.payload,
        //     }
        //     $ApiService.turnstileBuildingService._update({data, id: this.elementId}).then((res) => {
        //         this.visible = false
        //         this._index()
        //
        //     }).finally(() => {
        //         this.saveLoading = false
        //     })
        // },
        // _delete() {
        //     this.deleteLoading = true
        //     $ApiService.turnstileBuildingService._delete({id: this.elementId}).then((res) => {
        //         this._index()
        //
        //     }).finally(() => {
        //         this.deleteLoading = false
        //     })
        // },
        resetForm() {
            this.payload.level_org_id = []
            this.payload.worker_org_id = []
            this.payload.worker_wrapper_id = null
            this.payload.worker_id = null
            this.payload.photo_id = null
            this.payload.photo_index = null
            this.payload.access_level_id = null
            this.payload.photo = null
            this.payload.end_time = null
            this.photos = []
        }

    }
})