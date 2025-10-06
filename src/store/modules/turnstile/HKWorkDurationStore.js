import {defineStore} from "pinia";

export const useHKWorkDurationStore = defineStore('HKWorkDurationStore', {
    state: () => ({
        loading: false,
        list: [],
        visible: false,
        visibleType: true,
        elementId: null,
        totalItems: 0,
        structureCheck: [],

        params: {
            page: 1,
            per_page: 10,
            search: null,
            access_levels:[],
            organizations:[],
        },
        previewParams:{
            year:null,
            month:null,
        },
        previewList:[],
        previewLoading:false,
        workerData:null,
        currentTime:null,
        levelList:[],
        levelLoading:false,
        eventInDayList:[],
        activeTab:1,
    }),
    actions: {

        _index() {
            this.loading = true
            const params = {
                ...this.params,
                organizations: this.params.organizations.map(v => v.id).toString() || undefined,
                access_levels: this.params.access_levels.toString() || undefined,
            }
            $ApiService.turnstileWorkDurationService._HKIndex({params}).then((res) => {
                this.list = res.data.data.data.data.map(v=>({
                    ...v,
                    date:res.data.data.date
                }))
                this.totalItems = res.data.data.data.total
            }).finally(() => {
                this.loading = false
            })
        },
        _show(){
            this.previewLoading = true
            const params = {
                ...this.previewParams,
            }
            $ApiService.turnstileWorkDurationService._HKShow({params, id:this.elementId}).then((res) => {
                this.previewList = res.data.data
            }).finally(() => {
                this.previewLoading = false
            })

        },
        _showEventsInDay(date, id){
            this.previewLoading = true
            const params = {
                date,
            }
            $ApiService.turnstileWorkDurationService._HKShowEventsInDay({params, id}).then((res) => {
                this.eventInDayList = res.data.data
                this.activeTab = 2
            }).finally(() => {
                this.previewLoading = false
            })
        },
        _levels(){
            this.levelLoading = true
            $ApiService.hcServerService._accessLevels().then((res) => {
                this.levelList = res.data.data
            }).finally(() => {
                this.levelLoading = false
            })
        },
    }
})