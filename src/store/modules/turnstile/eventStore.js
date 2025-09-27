import {defineStore} from "pinia";
import i18n from "@/i18n/index.js"
import Utils from "@/utils/Utils.js"
import router from "@/router/index.js"
import {AppPaths} from "@/utils/index.js"

const {t} = i18n.global
export const useEventStore = defineStore('eventStore', {
    state: () => ({
        list: [],
        loading: false,
        saveLoading: false,
        deleteLoading: false,
        visible: false,
        visibleType: true,
        elementId: null,
        totalItems: 0,
        structureCheck2: [],
        structureCheck3: [],

        params: {
            page: 1,
            per_page: 10,
            search: null,
            organizations:[],
            direction:null,
            start:null,
            end:null,
            access_levels:[],
        },
        cardList:[
            {
                name:t('hcEvent.cards.cardOne'),
                id:1,
            },
            {
                name:t('hcEvent.cards.cardTwo'),
                id:2,
            },
            {
                name:t('hcEvent.cards.cardThree'),
                id:3,
            },
            {
                name:t('hcEvent.cards.cardFour'),
                id:4,
            },
        ],
        detailShow:false,
        dashboardLoading:false,
        dashboardObj:null,
        levelLoading:false,
        levelList:[],
        previewList:[],
        previewTotal:0,
        previewParams:{
            page: 1,
            per_page: 10,
            search: null,
            organizations:[],
            access_levels:[],
            type:null,
            hours:null,
            end_time:null,
            start_time:null,
            start_date_and_time:null,
            end_date_and_time:null,
        },
        dashboardParams:{
            organizations:[],
            access_levels:[],
            type:null,
            hours:null,
            end_time:null,
            start_time:null,
            start_date_and_time:null,
            end_date_and_time:null,
        },
        previewLoading:false,
        previewVisible:false,
        temperatureStatus:{
            1:{
                name:t("hcEvent.form.normal"),
                id:3
            },
            2:{
                name:t("hcEvent.form.noNormal"),
                id:4
            },
            3:{
                name:t("hcEvent.form.unknown"),
                id:2
            },
        },
        typeList:[
            {
                name:t('hcEvent.cards.cardOne'),
                id:'late_workers'
            },
            {
                name:t('hcEvent.cards.cardTwo'),
                id:'absent_workers'
            },
            {
                name:t('hcEvent.cards.cardThree'),
                id:'early_leave_workers'
            },
            {
                name:t('hcEvent.cards.cardFour'),
                id:'work_hours'
            },
        ],
        jobList:[],
        jobItems:0,
        jobLoading:false,
        jobPayload:{
            f_date:null,
        },
        jobParams:{
            page: 1,
            per_page: 10,
            search: null,
        },
        syncPayload:{
            from_date:null,
            // to_date:null,
            access_level_ids:[],
        },
        syncLoading:false,
        topOfflineDeviceList:[],
        dailyEvents:[],
        totalOfflineDeviceCount:0,
        devices:null,

    }),
    actions: {
        _syncEvent(){
            this.syncLoading = true
            const data = {
                ...this.syncPayload,
                from_date:Utils.timeToZone(this.syncPayload.from_date),
                to_date:Utils.timeToZone(this.syncPayload.from_date),
            }
            $ApiService.eventService._sync({data}).then((res) => {
                const now = Date.now()
                localStorage.setItem("lastClickTime", now.toString())
                this.visible=false
                router.push(Utils.routeTurnstilePathMaker(AppPaths.SyncLog))
            }).finally(() => {
                this.syncLoading = false
            })
        },
        _params(){
            return {
                ...this.params,
                organizations:this.params.organizations.map(v=>v.id).toString() || undefined,
                access_levels:this.params.access_levels.toString() || undefined,
                start:this.params.start? Utils.timeWithMonth(this.params.start): undefined,
                end:this.params.end? Utils.timeWithMonth(this.params.end): undefined,
            }
        },
        _indexJob(){
            this.jobLoading = true
            const params = {
                ...this.jobParams
            }
            $ApiService.eventService._jobIndex({params}).then((res) => {
                this.visible = true
                this.jobList = res.data.data.data
                this.jobItems = res.data.data.total
            }).finally(() => {
                this.jobLoading = false
            })
        },
        _createJob(){
            this.jobLoading = true
            const data = {
                ...this.jobPayload,
                f_date:Utils.timeWithMonth(this.jobPayload.f_date)
            }
            $ApiService.eventService._jobCreate({data}).then((res) => {
                this._indexJob()
            })
        },
        _download(){
            this.previewLoading = true
            const params = {
                ...this.previewParams,
                organizations:this.params.organizations.map(v=>v.id).toString() || undefined,
                access_levels:this.params.access_levels.toString() || undefined,
                start_date_and_time:Utils.timeWithMonth(this.params.start),
                end_date_and_time:Utils.timeWithMonth(this.params.end),
                download:1,
            }
            $ApiService.eventService._download({params}).then(() => {
                this.previewVisible = false
                router.push(Utils.routeHrmPathMaker(AppPaths.Export))
            }).finally(() => {
                this.previewLoading = false
            })
        },
        _index() {
            this.loading = true
            const params = {
                ...this._params(),
            }
            $ApiService.eventService._index({params}).then((res) => {
                this.list = res.data.data.data
                this.totalItems = res.data.data.total
            }).finally(() => {
                this.loading = false
            })
        },
        _dashboard(){
            this.dashboardLoading = true
            const params = {
                ...this.dashboardParams,
                organizations:this.dashboardParams.organizations.map(v=>v.id).toString() || undefined,
                access_levels:this.dashboardParams.access_levels.toString() || undefined,
                start:this.dashboardParams.start? Utils.timeWithMonth(this.dashboardParams.start): undefined,
                end:this.dashboardParams.end? Utils.timeWithMonth(this.dashboardParams.end): undefined,
            }
            $ApiService.eventService._dashboard({params}).then((res) => {
                this.dashboardObj = res.data.data
                this.topOfflineDeviceList = res.data.data.offline_devices?.top_offline
                this.totalOfflineDeviceCount = res.data.data.offline_devices?.total_offline
                this.dailyEvents = res.data.data.daily_attendance_chart
                this.devices = res.data.data.devices
                this.deviceStatusList =[
                    {
                        type:"primary",
                        status:"all",
                        count:res.data.data.devices.all,
                    },
                    {
                        type:"success",
                        status:"online",
                        count:res.data.data.devices?.online || 0,
                    },
                    {
                        type:"danger",
                        status:"offline",
                        count:res.data.data.devices?.offline || 0,
                    },
                    {
                        type:"warning",
                        status:"left",
                        count:res.data.data?.left_workplace_early || 0,
                    }

                ]
            }).finally(() => {
                this.dashboardLoading = false
            })
        },
        _levels() {
            this.levelLoading = true
            $ApiService.hcServerService._accessLevels().then((res) => {
                this.levelList = res.data.data
                if(res.data.data.length === 1){
                    this.syncPayload.access_level_ids = [res.data.data[0].id]
                }
            }).finally(() => {
                this.levelLoading = false
            })
        },
        _preview() {
            this.previewLoading = true
            const params = {
                ...this.previewParams,
                organizations:this.params.organizations.map(v=>v.id).toString() || undefined,
                access_levels:this.params.access_levels.toString() || undefined,
                start_date_and_time:Utils.timeWithMonth(this.params.start),
                end_date_and_time:Utils.timeWithMonth(this.params.end),
            }
            $ApiService.eventService._preview({params}).then((res) => {
                this.previewList = res.data.data.data
                this.previewTotal = res.data.data.total
            }).finally(() => {
                this.previewLoading = false
            })
        },
        resetPreviewParams(){
            this.previewParams.organizations = []
            this.previewParams.access_levels = []
            this.previewParams.hours = null
            this.previewParams.end_time = null
            this.previewParams.start_time = null
            this.previewParams.start_date_and_time = null
            this.previewParams.end_date_and_time = null
        }

    }
})