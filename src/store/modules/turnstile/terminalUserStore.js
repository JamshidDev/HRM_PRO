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
        visible: false,
        visibleType: true,
        elementId: null,
        totalItems: 0,
        structureCheck: [],
        photos: [],
        devices: [],
        devicesLoading: false,
        photosLoading: false,
        payload: {
            organization_id: [],
            worker_id: null,
            photo_id: null,
            photo_index: null,
            terminals: [],
            to: null,
            isWorker: 1,
            photo: null,
        },
        params: {
            page: 1,
            per_page: 10,
            search: null,
        },
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
            const payload = this.payload
            let data = {
                organization_id: payload.organization_id,
                worker_id: payload.worker_id,
                terminals: payload.terminals,
            }
            if(payload.photo){
                data.photo = payload.photo
            }
            if(payload.photo_id){
                data.photo_id = payload.photo_id
            }
            if(payload.to){
                data.to = Utils.timeToZone(payload.to)
            }
            $ApiService.turnstileTerminalUserService._create({data}).then((res) => {
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
        _turnstile_devices(){
            this.devicesLoading = true
            $ApiService.turnstileTerminalUserService._turnstile_devices().then((res) => {
                this.devices = res.data.data
            }).finally(() => {
                this.devicesLoading = false
            })
        },
        // _update() {
        //     this.saveLoading = true
        //     let data = {
        //         ...this.payload,
        //     }
        //     $ApiService.turnstileTerminalService._update({data, id: this.elementId}).then((res) => {
        //         this.visible = false
        //         this._index()
        //
        //     }).finally(() => {
        //         this.saveLoading = false
        //     })
        // },
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
            this.payload.terminals = []
            this.payload.organization_id = []
            this.payload.to = null
            this.payload.isWorker = 1
            this.photos = []
            this.devices = []
            // this.payload.url =null
        }
    }
})