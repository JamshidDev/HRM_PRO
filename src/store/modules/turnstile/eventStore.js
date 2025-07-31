import {defineStore} from "pinia";
import i18n from "@/i18n/index.js"
import Utils from "@/utils/Utils.js"

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
        ]

    }),
    actions: {
        _index() {
            this.loading = true
            const params = {
                ...this.params,
                organizations:this.params.organizations.map(v=>v.id).toString() || undefined,
                access_levels:this.params.access_levels.toString() || undefined,
                start:this.params.start? Utils.timeToZone(this.params.start)+' '+Utils.timeOnlySecond(this.params.start) : undefined,
                end:this.params.end? Utils.timeToZone(this.params.end)+' '+Utils.timeOnlySecond(this.params.end) : undefined,
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
            $ApiService.eventService._dashboard().then((res) => {
                this.dashboardObj = res.data.data
            }).finally(() => {
                this.dashboardLoading = false
            })
        },
        _levels() {
            this.levelLoading = true
            $ApiService.hcServerService._accessLevels().then((res) => {
                this.levelList = res.data.data
            }).finally(() => {
                this.levelLoading = false
            })
        },
        _preview() {
            this.previewLoading = true
            const params = {
                ...this.previewParams,
                organizations:this.previewParams.organizations.map(v=>v.id).toString() || undefined,
                access_levels:this.previewParams.access_levels.toString() || undefined,
                start_date_and_time:Utils.timeWithMonth(this.previewParams.start_date_and_time),
                end_date_and_time:Utils.timeWithMonth(this.previewParams.end_date_and_time),
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