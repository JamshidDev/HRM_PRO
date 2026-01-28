import { defineStore } from 'pinia'
import i18n from '@/i18n/index.js'
import { Utils} from "@utils"

const { t } = i18n.global
export const useApproveStore = defineStore('approveStore', {
    state: () => ({
        list: [],
        loading: false,
        saveLoading: false,
        showLoading:false,
        visible: false,
        visibleType: true,
        elementId: null,
        totalItems: 0,
        structureCheck2:[],
        payload: {
            receiver_organization_id: [],
            worker_position_ids: [],
            access_levels: [],
            title:null,
            description:null,
        },
        params: {
            page: 1,
            per_page: 10,
            search: null
        },
        level:{
            params:{
                page:1,
                per_page:10,
                search:null,
            },
            list:[],
            loading:false,
            total:0,
        },
        worker:{
            params:{
                page:1,
                per_page:50,
                search:null,
            },
            list:[],
            loading:false,
            total:0,
        },
        approve:{
            accessLevels:[],
            workers:[],
            visible:false,
            title:null,
            description:null,
        },
    }),
    actions: {
        _workers(infinity){
            this.worker.loading = true
            const params = {
                ...this.worker.params,
            }
            $ApiService.workerService._index({params}).then(res=>{
                const data = res.data.data.data.map(v=>({
                    id: v.id,
                    name: Utils.combineFullName(v.worker),
                    position: v.position.name,
                }))

                this.worker.list =infinity? [...this.worker.list, ...data] : data
                this.worker.total = res.data.data.total
            }).finally(()=>{
                this.worker.loading = false
            })
        },
        _accessLevel(){
            this.level.loading = true
            const params = {
                ...this.level.params,
                organization_id: this.payload.receiver_organization_id?.[0]?.id ?? undefined,
            }
            $ApiService.approveService._accessLevels({params}).then(res=>{
                this.level.list = res.data.data
                this.level.total = res.data.data.length
            }).finally(()=>{
                this.level.loading = false
            })
        },
        _index() {
            this.loading = true
            $ApiService.approveService
                ._index({ params: this.params })
                .then((res) => {
                    this.list = res.data.data.data
                    this.totalItems = res.data.data.total
                })
                .finally(() => {
                    this.loading = false
                })
        },
        _show(callback) {
            this.showLoading = true
            $ApiService.approveService
                ._show({ id: this.elementId })
                .then((res) => {
                    const v = res.data.data
                    if(callback){
                        callback(v)
                        return
                    }
                    this.approve.title = v.title
                    this.approve.description = v.description
                    this.approve.workers = v.worker_positions
                    this.approve.accessLevels = v.access_levels
                })
                .finally(() => {
                    this.showLoading = false
                })
        },
        _create(data) {
            this.saveLoading = true
            $ApiService.approveService
                ._create({ data })
                .then((res) => {
                    this.visible = false
                    this._index()
                })
                .finally(() => {
                    this.saveLoading = false
                })
        },
        _approve(status) {
            this.saveLoading = true
            let data = {
                status
            }
            $ApiService.approveService
                ._approve({ data, id: this.elementId })
                .then((res) => {
                    this.approve.visible = false
                    this._index()
                })
                .finally(() => {
                    this.saveLoading = false
                })
        },
        _delete() {
            this.loading = true
            $ApiService.approveService
                ._delete({ id: this.elementId })
                .finally(() => {
                    this.loading = false
                    this._index()
                })
        },
        _resetForm(){
            Object.assign(this.payload, {
                receiver_organization_id: [],
                worker_position_ids: [],
                access_levels: [],
                title:null,
                description:null,
            })
        }
    }
})
