import {
    CellularWarning24Filled,
    CellularData120Filled,
    DataUsage20Regular,
} from "@vicons/fluent"
import {defineStore} from "pinia";
import i18n from "@/i18n/index.js"
import Utils from "@/utils/Utils.js"
import { getTableConfig } from "@/pages/turnstile/dashboard/ui/tableConfig"
import router from "@/router/index.js"
import {AppPaths} from "@/utils/index.js"

const {t} = i18n.global

export const useTurnstileDashboardStore = defineStore('turnstileDashboardStore', {
    state: () => ({
        dashboardLoading: false,

        dashboardMainLoading: false,          // '/v1/turnstile/hik-central/dashboard'
        dailyAttendanceLoading: false,        // '/v1/turnstile/hik-central/dashboard/daily-attendance'
        workerStatsLoading: false,            // '/v1/turnstile/hik-central/dashboard/worker-stats'
        devicesLoading: false,                // '/v1/turnstile/hik-central/dashboard/devices'
        workDurationsLoading: false,          // '/v1/turnstile/hik-central/dashboard/work-durations'

        dashboardObj: {},
        topOfflineDeviceList: [],
        dailyEvents: [],
        totalOfflineDeviceCount: 0,
        devices: null,
        workerStatuses: [],
        deviceStatusList: [],
        workDuration: null,

        dashboardParams: {
            organizations: [],
            departments: [],
            access_levels: [],
            end_time: localStorage.getItem('turnstile_end_time') || '18:00',
            start_time: localStorage.getItem('turnstile_start_time') || '09:00',
        },
        structureCheck2: [],

        previewList: [],
        previewTotal: 0,
        previewLoading: false,
        previewVisible: false,
        previewParams: {
            page: 1,
            per_page: 10,
            search: null,
            organizations: [],
            access_levels: [],


            type: null,
            hours: null,
            end_time: null,
            start_time: null,
            date:null,
            norm_hours:null,
            status:null,
        },
        timeRange:null,
        tableColumns:[],
        filterVisible:{
            start_time:false,
            end_time:false,
            hours:false,
            start_date_and_time:false,
            end_date_and_time:false,
          },
          yesterday:false,
          isOnlineDevice:null,
          cardTypes:{
            late_come:{
                name:"turnStileDashboard.cards.late_come",
                key:"late_come",
            },
            come:{
                name:"turnStileDashboard.cards.come",
                key:'come',
            },
            not_come:{
                name:"turnStileDashboard.cards.not_come",
                key:'not_come',
                uiKey:'not_come_yesterday'
            },
            early_leave:{
                name:"turnStileDashboard.cards.early_leave_yesterday",
                key:'early_leave',
                uiKey:'early_leave_yesterday'
            },
            work_hours:{
                name:"turnStileDashboard.cards.work_hours",
                key:'work_hours'
            },
            current_in:{
                name:"turnStileDashboard.cards.current_in",
                key:'current_in'
            },
            current_out:{
                name:"turnStileDashboard.cards.current_out",
                key:'current_out'
            },
            daily_attendance:{
                name:"turnStileDashboard.cards.daily_attendance",
                key:'daily_attendance'
            },
            devices:{
                name:"turnStileDashboard.cards.devices",
                key:'devices'
            },
            lesson_worked:{
                name:"turnStileDashboard.cards.lesson_worked",
                key:'lesson_worked'
            },
            device_status:{
                 name:"turnStileDashboard.cards.device_status",
                 key:'device_status'
            },

            device_status_online:{
                name:"turnStileDashboard.cards.device_status_online",
            },
            device_status_offline:{
                name:"turnStileDashboard.cards.device_status_offline",
           },
            early_leave_yesterday:{
                name:"turnStileDashboard.cards.early_leave_yesterday",
            },
            not_come_yesterday:{
                name:"turnStileDashboard.cards.not_come_yesterday",
            },
          },
          filterDepParams:{
            page:1,
            per_page:100,
            search:null,
            key:null,
          },

          statDashboardLoading:false,
          workerInOut:[],

    }),

    actions: {
        _getStatDashboard(){
            const params = {
                date:'2025-12-01'
            }
            this.statDashboardLoading = true
            $ApiService.turnstileDashboardService._statDashboard({params}).then(res => {
                console.log(res.data)
            }).finally(()=>{
                this.statDashboardLoading = false
            })

        },
        async _dashboard() {
            // Umumiy va bo'linma bo'yicha loadinglarni yoqamiz
            this.dashboardLoading = true
            this.dashboardMainLoading = true
            this.dailyAttendanceLoading = true
            this.workerStatsLoading = true
            this.devicesLoading = true
            this.workDurationsLoading = true
            const params = {
                ...this._previewQueryParams(),
                start_time:this.dashboardParams.start_time,
                end_time:this.dashboardParams.end_time,
                date:'2025-11-01',
            }
            const urls = [
                '/v1/turnstile/schedule/stats-one',
                '/v1/turnstile/schedule/stats-four',
                '/v1/turnstile/schedule/stats-three',
                '/v1/turnstile/schedule/stats-five',
                '/v1/turnstile/hik-central/dashboard/work-durations',
                '/v1/turnstile/schedule/stats-six',
            ]

            const requests = urls.map(async (url) => {
                try {
                    const res = await $ApiService.eventService._allDashboard({ url, params })
                    const data = res.data.data
                    return { url, data, error: null }
                } catch (error) {
                    return { url, data: null, error: error?.message || 'Unknown error' }
                }
            })

            try {
                for await (const result of requests) {
                    const data = result.data
                    if (result.url === urls[0]) {
                        if (!result.error) {
                            this.workerStatuses = [
                                {
                                    type: "primary",
                                    icon: markRaw(DataUsage20Regular),
                                    status: "content.today",
                                    description: "turnStileDashboard.form.scheduled_workers_today",
                                    count: data?.scheduled_workers_today || 0,
                                    previewType:'come',
                                },
                                {
                                    type: "primary",
                                    icon: markRaw(DataUsage20Regular),
                                    status: "content.today",
                                    description: "turnStileDashboard.form.came_today",
                                    count: data?.attended_workers_today || 0,
                                    previewType:'come',
                                },
                                {
                                    type: "danger",
                                    icon: markRaw(DataUsage20Regular),
                                    status: "content.today",
                                    description: "turnStileDashboard.form.not_came_today",
                                    count: data?.absent_workers_today || 0,
                                    previewType:'not_come',
                                },
                            ]
                            this.dashboardObj.lateEarlyWorker = data.late_and_early
                        }
                        this.dashboardMainLoading = false
                    } else if (result.url === urls[1]) {
                        // daily chart
                        if (!result.error){
                            this.dailyEvents = data.daily_attendance_chart
                            this.dashboardObj.vacation_workers = data.vacation_workers
                        }
                        this.dailyAttendanceLoading = false
                    } else if (result.url === urls[2]) {
                        // In - Out
                        if (!result.error) {

                            this.workerInOut = [
                                {
                                    type: "success",
                                    icon: markRaw(DataUsage20Regular),
                                    status: "content.now",
                                    description: "turnStileDashboard.form.current_in",
                                    count: data?.worker_stats?.current_in || 0,
                                    previewType:'current_in',
                                },
                                {
                                    type: "warning",
                                    icon: markRaw(DataUsage20Regular),
                                    status: "content.now",
                                    description: "turnStileDashboard.form.current_out",
                                    count: data?.worker_stats?.current_out || 0,
                                    previewType:'current_out',
                                },
                            ]

                        }
                        this.workerStatsLoading = false
                    } else if (result.url === urls[3]) {
                        // devices
                        if (!result.error) {
                            this.topOfflineDeviceList = data.offline_devices?.top_offline
                            this.totalOfflineDeviceCount = data.offline_devices?.total_offline
                            this.devices = data.devices
                            this.deviceStatusList = [
                                {
                                    type: "primary",
                                    icon: markRaw(DataUsage20Regular),
                                    status: "content.all",
                                    description: "turnStileDashboard.device.all",
                                    count: data.devices.all,
                                    isOnlineDevice:null,
                                },
                                {
                                    type: "success",
                                    icon: markRaw(CellularData120Filled),
                                    status: "content.online",
                                    description: "turnStileDashboard.device.online",
                                    count: data.devices?.online || 0,
                                    isOnlineDevice:true,
                                },
                                {
                                    type: "danger",
                                    icon: markRaw(CellularWarning24Filled),
                                    status: "content.offline",
                                    description: "turnStileDashboard.device.offline",
                                    count: data.devices?.offline || 0,
                                    isOnlineDevice:false,
                                },
                            ]
                        }
                        this.devicesLoading = false
                    } else if (result.url === urls[4]) {
                        if (!result.error) this.workDuration = data
                        this.workDurationsLoading = false
                    }
                }
            } finally {
                this.dashboardLoading = false
                this.dashboardMainLoading = false
                this.dailyAttendanceLoading = false
                this.workerStatsLoading = false
                this.devicesLoading = false
                this.workDurationsLoading = false
            }
        },

        // Preview method - har bir dashboard card uchun batafsil ma'lumot
        _preview(isPagination = false) {

            if(!isPagination){
                this.previewList = []
            }
            const params = this._previewQueryParams()
            this.previewLoading = true

            $ApiService.eventService._preview({ params }).then((res) => {
                // API response strukturasi bo'yicha ma'lumotlarni olish
                let rawData = res.data.data
                let total = res.data.data.total

                // Raw data ni formatlash va previewList ga berish
                this.previewList = this._formatPreviewResponse(rawData, this.previewParams.type)
            }).finally(() => {
                this.previewLoading = false
            })
        },

        _previewQueryParams(){
            return {
                ...this.previewParams,
                organizations: this.dashboardParams.organizations.map(v => v.id).toString() || undefined,
                departments: this.dashboardParams.departments.toString() || undefined,
                access_levels: this.dashboardParams.access_levels.toString() || undefined,
                date:Utils.timeToZone(this.previewParams.date),
            }
        },

        // Preview responselarini formatlash methodi
        _formatPreviewResponse(rawData, cardType) {
            let responseDate =[]
            this.tableColumns  = getTableConfig(cardType).columns


            if(cardType === 'devices'){
                responseDate = rawData[getTableConfig(cardType)?.responseField]
            }else if(cardType === 'device_status'){
                responseDate = rawData
            }
            else{
                responseDate = rawData[getTableConfig(cardType)?.responseField].data
            }

            if(!responseDate || !Array.isArray(responseDate)) return []
            this.previewTotal = rawData[getTableConfig(cardType)?.responseField]?.total || 0

            let data = responseDate.map((v, index) => {

                if(cardType === 'late_come'){
                    return {
                        ...v,
                        user:this._userContructor(v, v.position_name),
                    }
                }else if(cardType === 'come'){
                    return {
                        ...v,
                        user:this._userContructor(v, v.position_name),
                    }
                }
                else if(cardType === 'current_in'){
                    return {
                        ...v,
                        user:this._userContructor(v, v.position_name),
                    }
                }else if(cardType === 'current_out'){
                    return {
                        ...v,
                        user:this._userContructor(v, v.position_name),
                    }
                }
                else if(cardType === 'daily_attendance'){
                    return {
                        ...v,
                        user:this._userContructor(v.worker, v.worker.id),
                    }
                }
                else if(cardType === 'not_come'){
                    return {
                        ...v,
                        user:this._userContructor(v, v.position_name),
                    }
                }else if(cardType === 'lesson_worked'){
                    return {
                        ...v,
                        user:this._userContructor(v, v.position_name),
                        total_minutes: v.total_minutes + ' ' + t('date.minute'),
                        hours: v.hours + ' ' + t('date.hour'),
                    }
                }
                else if(cardType === 'early_leave'){
                    return {
                        ...v,
                        user:this._userContructor(v, v?.position_name),

                    }
                }else return v


            })

            if(cardType === 'devices'){

                return data.sort((a, b) => new Date(a.last_sync) - new Date(b.last_sync))
            }else if(cardType === 'device_status' && this.isOnlineDevice !== null){
                const status = this.isOnlineDevice ? 1 : 2
                return data.filter(v => v.status === status)
            }


            return data
        },

        // Yangi API response format uchun yordamchi methodlar
       _userContructor(v, position){
        return {
            photo:v?.photo,
            firstName:v.first_name,
            middleName:v.middle_name,
            lastName:v.last_name,
            position:position,
        }
       },

        // Download method - preview ma'lumotlarini yuklab olish
        _download() {
            this.previewLoading = true
            const params = {
                ...this._previewQueryParams(),
                download: 1,
            }

            $ApiService.eventService._download({ params }).then(() => {
                this.previewVisible = false
                // You can add router navigation here if needed
                router.push(Utils.routeHrmPathMaker(AppPaths.Export))
            }).finally(() => {
                this.previewLoading = false
            })
        },
        resetPreviewParams() {
            this.previewParams.organizations = []
            this.previewParams.access_levels = []
            this.previewParams.page = 1
            this.previewParams.hours = null
            this.previewParams.search = null
            this.previewParams.end_time = null
            this.previewParams.start_time = null
            this.previewParams.status = null
        },

        // Preview modalini ochish va card type ni o'rnatish
        openPreview(cardType) {
            this.resetPreviewParams()
            this.previewParams.type = cardType
            this.previewParams.organizations = [...this.dashboardParams.organizations]
            this.previewParams.access_levels = [...this.dashboardParams.access_levels]
            this.previewParams.start_date_and_time = this.dashboardParams.start
            this.previewParams.end_date_and_time = this.dashboardParams.end
            this.previewVisible = true
            this._preview()
        },


    }
})
