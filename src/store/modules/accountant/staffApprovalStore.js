import { defineStore } from 'pinia'
import i18n from '@/i18n/index.js'
import Utils from '@/utils/Utils.js'
import {getOneMonthAgoYearMonth} from "@utils"
const { t } = i18n.global
export const useStaffApprovalStore = defineStore('pensionStore', {
    state: () => ({
        list: [],
        loading: false,
        visible: false,
        visibleType: true,
        elementId: null,
        totalItems: 0,
        params: {
            page: 1,
            per_page: 10,
            search: null,
        },
        payload:{
            confirmations: [],
            director_id: null,
            finance_id: null,
            department_positions:[],
        },
        sortableConfirmations: [],
        oneByOne: true,
        positions:[],
        generateLoading: false,
        saveLoading: false,
    }),
    actions:{
        _index() {
            this.loading = true
            const params = {
                ...this.params,
                // organizations: this.params.organizations.map((v) => v.id).toString() || undefined
            }
            $ApiService.staffApprovalService
                ._index({ params })
                .then((res) => {
                    this.list = res.data.data.data
                    this.totalItems = res.data.data.total
                })
                .finally(() => {
                    this.loading = false
                })
        },
        _showGenerate() {
            this.generateLoading = true
            $ApiService.staffApprovalService
                ._showGenerate({ params: this.params })
                .then((res) => {
                    this.positions = res.data.data.positions
                })
                .finally(() => {
                    this.generateLoading = false
                })
        },
        _create(data){
            this.saveLoading = true
            $ApiService.staffApprovalService._create({data}).then((res)=>{
                this._index()
            }).finally(()=>{
                this.visible = false
                this.saveLoading = false
            })
        },
        openVisible(data) {
            this.visible = data
        },
        resetForm() {
            this.elementId = null
            this.payload.department_positions = []
        }
    }
})
