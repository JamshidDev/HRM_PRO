import {defineStore} from "pinia";
import i18n from "@/i18n/index.js"

const {t} = i18n.global
export const useSyncLogStore = defineStore('syncLogStore', {
    state: () => ({
        list: [],
        loading: false,
        showLoading: false,
        saveLoading: false,
        deleteLoading: false,
        visible: false,
        visibleType: true,
        elementId: null,
        totalItems: 0,
        allPermissionList: [],
        structureCheck2: [],
        previewList:[],
        previewTotal:0,
        params: {
            page: 1,
            per_page: 10,
            search: null,
            organizations:[],
            access_levels:[],
        },
        levelLoading:false,
        levelList:[],
        sortByTime:0,
        sortByCount:0,
        offlineDeviceList:[],
        offlineDeviceLoading:false,
        offlineDeviceVisible:false,

    }),
    actions: {
        _index() {
            this.loading = true
            const params = {
                ...this.params,
                organizations:this.params.organizations.map(v=>v.id).toString() || undefined,
                access_levels:this.params.access_levels.toString() || undefined,
            }
            $ApiService.syncLogService._index({params}).then((res) => {
                this.list = res.data.data.data
                this.totalItems = res.data.data.total
            }).finally(() => {
                this.loading = false
            })
        },
        _offlineDeviceList(){
            this.offlineDeviceLoading = true
            $ApiService.syncLogService._offlineDevice({id:this.elementId}).then((res) => {
                this.offlineDeviceList = res.data.data.devices
            }).finally(() => {
                this.offlineDeviceLoading = false
            })
        },
        _show() {
            this.showLoading = true
            $ApiService.syncLogService._show({id:this.elementId}).then((res) => {
                this.previewList = res.data.data
            }).finally(() => {
                this.showLoading = false
            })
        },
        _levels(){
            this.levelLoading = true
            $ApiService.hcServerService._accessLevels().then((res) => {
                this.levelList = res.data.data
            }).finally(() => {
                this.levelLoading = false
            })
        }
    }
})