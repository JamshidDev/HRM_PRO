import {defineStore} from "pinia";
import router from "@/router/index.js";
import Utils from "@/utils/Utils.js"
import {AppPaths} from "@/utils/index.js"

export const useExportStore = defineStore('exportStore', {
    state: () => ({
        loading: false,
        visible: false,
        resumeModalVisible: false,
        totalItems: 0,
        isExportingResume: false,
        exportResumeLoading: false,
        resumePayload: {
            organizations: null,
            passport: false,
            all: false,
            worker_ids: []
        },
        params: {
            page: 1,
            per_page: 10,
            search: null,
        },
        payload: {
            columns: []
        },
        columns: [],
        tasks: [],
        saveLoading: false,
    }),
    actions: {
        _columns() {
            this.loading = true
            $ApiService.exportService._columns().then((res) => {
                this.columns = res.data.data
            }).finally(() => {
                this.loading = false
            })
        },
        _tasks() {
            this.loading = true
            $ApiService.exportService._tasks({params: this.params}).then((res) => {
                this.tasks = res.data.data.data.map(i => {
                    let id;
                    if (i.status.id === 2) {
                        id = 3
                    } else if (i.status.id === 3) {
                        id = 8
                    } else if (i.status.id === 1) {
                        id = 1
                    }
                    return {
                        ...i,
                        status: {
                            ...i.status,
                            id
                        },
                    }
                })
                this.totalItems = res.data.data.total
            }).finally(() => {
                this.loading = false
            })
        },
        _export_workers(params) {
            this.saveLoading = true
            let data = {
                columns: this.payload.columns.map(i => i.column),
                query: params
            }
            $ApiService.exportService._export_workers({data}).then((res) => {
                this.visible = false
                router.push(Utils.routeHrmPathMaker(AppPaths.Export))
            }).finally(() => {
                this.saveLoading = false
            })
        },
        _export_resume(params) {
            this.exportResumeLoading = true
            let data = {
                query: {...this.resumePayload, ...params}
            }
            $ApiService.exportService._export_resume({data}).then((res) => {
                this.resumeModalVisible = false
                this.resetResumePayload()
                router.push(Utils.routeHrmPathMaker(AppPaths.Export))
            }).finally(() => {
                this.exportResumeLoading = false
            })
        },
        resetPayload() {
            this.payload.columns = [];
        },
        resetResumePayload() {
            this.resumePayload = {
                organizations: null,
                passport: false,
                all: false,
                worker_ids: []
            }
        },
        toggleAll() {
            this.resumePayload.worker_ids = []
            this.resumePayload.all = !this.resumePayload.all
        },
        toggleResumeWorker(v) {
            if (this.resumePayload.worker_ids.includes(v.id)) {
                this.resumePayload.worker_ids = this.resumePayload.worker_ids.filter(i => i != v.id)
            } else {
                this.resumePayload.worker_ids.push(v.id)
            }
        }
    },
})