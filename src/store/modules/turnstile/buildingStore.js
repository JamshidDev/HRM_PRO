import {defineStore} from "pinia";
import i18n from "@/i18n/index.js"

const {t} = i18n.global
export const useTurnstileBuildingStore = defineStore('turnstileBuildingStore', {
    state: () => ({
        list: [],
        loading: false,
        saveLoading: false,
        deleteLoading: false,
        visible: false,
        visibleType: true,
        elementId: null,
        totalItems: 0,
        allPermissionList: [],
        structureCheck: [],
        payload: {
            name: null,
            name_ru: null,
            name_en: null
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
            $ApiService.turnstileBuildingService._index({params: this.params}).then((res) => {
                this.list = res.data.data.data
                this.totalItems = res.data.data.total
            }).finally(() => {
                this.loading = false
            })
        },
        _create() {
            this.saveLoading = true
            let data = {
                ...this.payload,
            }
            $ApiService.turnstileBuildingService._create({data}).then((res) => {
                this.visible = false
                this._index()

            }).finally(() => {
                this.saveLoading = false
            })
        },
        _update() {
            this.saveLoading = true
            let data = {
                ...this.payload,
            }
            $ApiService.turnstileBuildingService._update({data, id: this.elementId}).then((res) => {
                this.visible = false
                this._index()

            }).finally(() => {
                this.saveLoading = false
            })
        },
        _delete() {
            this.deleteLoading = true
            $ApiService.turnstileBuildingService._delete({id: this.elementId}).then((res) => {
                this._index()

            }).finally(() => {
                this.deleteLoading = false
            })
        },
        resetForm() {
            this.payload.name = null
            this.payload.name_ru = null
            this.payload.name_en = null
        }
    }
})