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
        }
    }
})