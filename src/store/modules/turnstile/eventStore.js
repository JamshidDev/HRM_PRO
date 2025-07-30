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

    }
})