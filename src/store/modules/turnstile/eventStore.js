import {
    CellularWarning24Filled,
    CellularData120Filled,
    DataUsage20Regular,
    DoorArrowLeft24Regular,
} from "@vicons/fluent"
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
        // Umumiy dashboard loading (butun sahifa uchun)
        dashboardLoading:false,
        // Har bir so'rov uchun alohida loading flaglar
        dashboardMainLoading:false,          // '/v1/turnstile/hik-central/dashboard'
        dailyAttendanceLoading:false,        // '/v1/turnstile/hik-central/dashboard/daily-attendance'
        workerStatsLoading:false,            // '/v1/turnstile/hik-central/dashboard/worker-stats'
        devicesLoading:false,                // '/v1/turnstile/hik-central/dashboard/devices'
        workDurationsLoading:false,          // '/v1/turnstile/hik-central/dashboard/work-durations'

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
            access_level_ids:[],
        },
        syncLoading:false,

        topOfflineDeviceList:[],
        dailyEvents:[],
        totalOfflineDeviceCount:0,
        devices:null,
        workerStatuses:[],
        deviceStatusList:[],

        workDuration:null,

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
        _dashboardParams(){
            return {
                ...this.dashboardParams,
                organizations:this.dashboardParams.organizations.map(v=>v.id).toString() || undefined,
                access_levels:this.dashboardParams.access_levels.toString() || undefined,
                start:this.dashboardParams.start? Utils.timeWithMonth(this.dashboardParams.start): undefined,
                end:this.dashboardParams.end? Utils.timeWithMonth(this.dashboardParams.end): undefined,
            }
        },
        async _dashboard(){
            // Umumiy va bo'linma bo'yicha loadinglarni yoqamiz
            this.dashboardLoading = true
            this.dashboardMainLoading = true
            this.dailyAttendanceLoading = true
            this.workerStatsLoading = true
            this.devicesLoading = true
            this.workDurationsLoading = true

            const params = this._dashboardParams()
            const urls = [
                '/v1/turnstile/hik-central/dashboard',
                '/v1/turnstile/hik-central/dashboard/daily-attendance',
                '/v1/turnstile/hik-central/dashboard/worker-stats',
                '/v1/turnstile/hik-central/dashboard/devices',
                '/v1/turnstile/hik-central/dashboard/work-durations',
            ]

            const requests = urls.map(async (url)=>{
                try{
                    const res = await $ApiService.eventService._allDashboard({url, params})
                    const data = res.data.data
                    return { url, data, error:null }
                }catch (error){
                    return { url, data:null, error: error?.message || 'Unknown error' }
                }
            })

            try{
                for await (const result of requests) {
                    const data = result.data
                    if(result.url === urls[0]){
                        if(!result.error) this.dashboardObj = data
                        this.dashboardMainLoading = false
                    }else if(result.url === urls[1]){
                        if(!result.error) this.dailyEvents = data
                        this.dailyAttendanceLoading = false
                    }else if(result.url === urls[2]){
                        if(!result.error){
                            this.workerStatuses = [
                                {
                                    type:"primary",
                                    icon:markRaw(DataUsage20Regular),
                                    status:"content.today",
                                    description:"turnStileDashboard.form.came_today",
                                    count:data?.worker_stats?.came_today || 0,
                                },
                                {
                                    type:"danger",
                                    icon:markRaw(DataUsage20Regular),
                                    status:"content.today",
                                    description:"turnStileDashboard.form.not_came_today",
                                    count:data?.worker_stats?.not_came_today || 0,
                                },
                                {
                                    type:"success",
                                    icon:markRaw(DataUsage20Regular),
                                    status:"content.now",
                                    description:"turnStileDashboard.form.current_in",
                                    count:data?.worker_stats?.current_in || 0,
                                },
                                {
                                    type:"warning",
                                    icon:markRaw(DataUsage20Regular),
                                    status:"content.now",
                                    description:"turnStileDashboard.form.current_out",
                                    count:data?.worker_stats?.current_out || 0,
                                },
                            ]
                        }
                        this.workerStatsLoading = false
                    }else if(result.url === urls[3]){
                        if(!result.error){
                            this.topOfflineDeviceList = data.offline_devices?.top_offline
                            this.totalOfflineDeviceCount = data.offline_devices?.total_offline
                            this.devices = data.devices
                            this.deviceStatusList =[
                                {
                                    type:"primary",
                                    icon:markRaw(DataUsage20Regular),
                                    status:"content.all",
                                    description:"turnStileDashboard.device.all",
                                    count:data.devices.all,
                                },
                                {
                                    type:"success",
                                    icon:markRaw(CellularData120Filled),
                                    status:"content.online",
                                    description:"turnStileDashboard.device.online",
                                    count:data.devices?.online || 0,
                                },
                                {
                                    type:"danger",
                                    icon:markRaw(CellularWarning24Filled),
                                    status:"content.offline",
                                    description:"turnStileDashboard.device.offline",
                                    count:data.devices?.offline || 0,
                                },
                            ]
                        }
                        this.devicesLoading = false
                    }else if(result.url === urls[4]){
                        if(!result.error) this.workDuration = data
                        this.workDurationsLoading = false
                    }
                }
            } finally {
                // Har qanday holatda ham umumiy loadingni o'chiramiz
                this.dashboardLoading = false
                // Agar biror joyda qolib ketgan bo'lsa, barchasini o'chirish
                this.dashboardMainLoading = false
                this.dailyAttendanceLoading = false
                this.workerStatsLoading = false
                this.devicesLoading = false
                this.workDurationsLoading = false
            }
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