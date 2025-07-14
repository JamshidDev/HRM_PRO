import {defineStore} from "pinia";
import i18n from "@/i18n/index.js"
import Utils from "@/utils/Utils.js"

const {t} = i18n.global
export const useHcServerStore = defineStore('hcServerStore', {
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
            access_level_id: null,
            organization_id: [],
            department_id:null,
            workers: [],
        },
        params: {
            page: 1,
            per_page: 10,
            search: null,
            organizations:[],
        },
        levelList:[],
        levelLoading:false,
        workerList:[],
        workerLoading:false,
        workerParams:{
            page:1,
            per_page:10,
            search:null,
            organization_id:null,
            department_id:null,
            department_position_id:null,
        },
        totalWorker:0,
    }),
    actions: {
        _index() {
            this.loading = true
            $ApiService.hcServerService._exportedJob({params: this.params}).then((res) => {
                this.list = res.data.data.data
                this.totalItems = res.data.data.total
            }).finally(() => {
                this.loading = false
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
        _create() {
            this.saveLoading = true
            let data = {
                ...this.payload,
                organization_id:this.payload.organization_id[0]?.id,
                worker_position_ids:this.payload.workers,
                department_id:this.payload.department_id || undefined,
                workers:undefined,
            }
            $ApiService.hcServerService._syncToServer({data, params:{job:true}}).then((res) => {
                this.visible = false
                this._index()
            }).finally(() => {
                this.saveLoading = false
            })
        },
        _workers(infinity=false){
            this.workerLoading = true
            let params = {
                ...this.workerParams,
            }
            $ApiService.reportService._worker({params}).then((res)=>{
                let data = res.data.data.data.map((v)=>({
                    ...v,
                    name:v.worker.last_name + ' '+v.worker.first_name+' '+v.worker.middle_name,
                    position:v.position?.name || v?.post_name,
                    id:v.id,
                    typeId:v.contract?.type?.id,
                    photo: v.worker?.photo
                }))
                this.totalWorker = res.data.data.total

                if(infinity){
                    this.workerList =[...this.workerList, ...data]
                }else{
                    this.workerList = data
                }
            }).finally(()=>{
                this.workerLoading = false
            })

        },
        onSearchWorker(v){
            this.workerParams.page = 1
            this.workerParams.search = v
            Utils.debouncedFn(this._workers)
        },
        onScrollWorker(e){
            const currentTarget = e.currentTarget;
            if(currentTarget.scrollTop + currentTarget.offsetHeight >= currentTarget.scrollHeight && !this.workerLoading && this.totalWorker>this.workerList.length){
                this.workerParams.page +=1
                this._workers(true)
            }
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
            this.elementId = null
            this.payload.name = null
            this.payload.access_level_id = null
            this.payload.department_id = null
            this.payload.workers = []
            this.payload.organization_id = []

        }
    }
})