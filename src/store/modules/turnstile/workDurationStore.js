import {defineStore} from "pinia";
import i18n from "@/i18n/index.js"
import {turnstileWorkDurationService} from "@/service/v1/turnstile/index.js"

const {t} = i18n.global
export const useTurnstileWorkDurationStore = defineStore('turnstileWorkDurationStore', {
    state: () => ({
        list: [],
        loading: false,
        visible: false,
        visibleType: true,
        elementId: null,
        totalItems: 0,
        allPermissionList: [],
        structureCheck: [],
        params: {
            page: 1,
            per_page: 10,
            search: null,
        },
    }),
    actions: {
        _index() {
            this.loading = true
            $ApiService.turnstileWorkDurationService._index({params: this.params}).then((res) => {
                this.list = res.data.data.data
                this.totalItems = res.data.data.total
            }).finally(() => {
                this.loading = false
            })
        },
    }
})