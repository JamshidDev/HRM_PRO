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
        structureCheck: [],

        params: {
            page: 1,
            per_page: 10,
            search: null,
            organizations:[],
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
    }),
    actions: {
        _index() {
            this.loading = true
            const params = {
                ...this.params,
                organizations:this.params.organizations.map(v=>v.id).toString() || undefined,
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

    }
})