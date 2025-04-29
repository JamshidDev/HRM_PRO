import {defineStore} from "pinia";
import i18n from "@/i18n/index.js"

const {t} = i18n.global
export const useTurnstileOrganizationStore = defineStore('turnstileOrganizationStore', {
    state: () => ({
        tree: [],
        loading: false,
        saveLoading: false,
        deleteLoading: false,
        instanceLoading: false,
        visible: false,
        visibleType: true,
        elementId: null,
        allPermissionList: [],
        structureCheck: [],
        instanceTerminalList: [],
        payload: {
            organization_id: [],
            terminals: [],
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
            $ApiService.turnstileOrganizationService._index({params: this.params}).then((res) => {
                this.tree = res.data.data
            }).finally(() => {
                this.loading = false
            })
        },
        _create() {
            this.saveLoading = true
            let data = {
                ...this.payload,
                organization_id:this.payload.organization_id?.[0].id,
            }
            $ApiService.turnstileOrganizationService._create({data}).then((res) => {
                this._index()
            }).finally(() => {
                this.saveLoading = false
            })
        },
        _show(){
            this.instanceLoading = true
            this.payload.terminals = []
            $ApiService.turnstileOrganizationService._show({id: this.payload.organization_id?.[0]?.id}).then((res) => {
                this.payload.terminals = res.data.data.map(i=>i.id)
            }).finally(() => {
                this.instanceLoading = false
            })
        },
        _update() {
            this.saveLoading = true
            let data = {
                ...this.payload,
                organization_id:this.payload.organization_id?.[0].id,
            }
            $ApiService.turnstileOrganizationService._update({data, id: this.elementId}).then((res) => {
                this.visible = false
                this._index()

            }).finally(() => {
                this.saveLoading = false
            })
        },
        _delete() {
            this.deleteLoading = true
            $ApiService.turnstileOrganizationService._delete({id: this.elementId}).then((res) => {
                this._index()

            }).finally(() => {
                this.deleteLoading = false
            })
        },
        resetForm() {
            this.payload.organization_id = []
            this.payload.terminals = []
        }
    }
})