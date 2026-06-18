import { defineStore } from 'pinia'
import i18n from '@/i18n/index.js'
import Utils from '@/utils/Utils.js'

const { t } = i18n.global
export const useLmsWorkerStore = defineStore('lmsWorkerStore', {
  state: () => ({
    list: [],
    loading: false,
    saveLoading: false,
    deleteLoading: false,
    showLoading: false,
    visible: false,
    visibleType: true,
    elementId: null,
    totalItems: 0,
    structureCheck: [],
    structureCheck2: [],
    payload: {
      edu_plan_id: null,
      organizations: [],
      worker_position_ids: []
    },
    params: {
      page: 1,
      per_page: 10,
      search: null,
      edu_plan_id: null,
      organizations: []
    },
    workerList: [],
    workerLoading: false,
    totalWorker: 0,
    workerParams: {
      page: 1,
      per_page: 200,
      search: '',
      edu_plan_id: null,
      organizations: []
    },

    eduPlanList: [],
    eduPlanLoading: false,
    selectedWorkers: [],
    isActiveDelete: false
  }),
  actions: {
    _eduPlans() {
      this.eduPlanLoading = true
      $ApiService.lmsWorkerService
        ._eduPlans({ params: { page: 1, per_page: 1000 } })
        .then((res) => {
          this.eduPlanList = res.data.data.data.map((v) => ({
            ...v,
            name: ` (${v?.start_date}) ` + v.name,
            position: v?.specialization?.name + `\n (${v.count_workers})`,
            subPosition: v?.learning_center?.name
          }))
        })
        .finally(() => {
          this.eduPlanLoading = false
        })
    },
    // infinite = true (scroll) → keyingi sahifa ro'yxatga QO'SHILADI; aks holda
    // (birinchi yuklash / qidiruv) ro'yxat yangidan to'ldiriladi.
    // Dedup QILINMAYDI — backend qaytargan barcha yozuvlar (id takror bo'lsa ham)
    // option bo'lib chiqadi.
    _workers(infinite = false) {
      this.workerLoading = true
      this.workerParams.edu_plan_id = this.payload.edu_plan_id
      this.workerParams.organizations =
        this.payload.organizations.map((v) => v.id).toString() || undefined
      $ApiService.lmsWorkerService
        ._workers({ params: this.workerParams })
        .then((res) => {
          const newData = res.data.data.data.map((v) => ({
            ...v,
            name: Utils.combineFullName(v.worker),
            position: v?.position
          }))
          if (infinite) {
            this.workerList = [...this.workerList, ...newData]
          } else {
            // qidiruvda tanlanganlar yo'qolmasin (natijada bo'lmaganlarini saqlaymiz)
            const newIds = new Set(newData.map((v) => v.id))
            const keepSelected = this.workerList.filter(
              (v) => this.payload.worker_position_ids.includes(v.id) && !newIds.has(v.id)
            )
            this.workerList = [...newData, ...keepSelected]
          }
          this.totalWorker = res.data.data.total
        })
        .finally(() => {
          this.workerLoading = false
        })
    },
    _index() {
      this.loading = true
      const params = {
        ...this.params,
        organizations: this.params.organizations.map((v) => v.id).toString() || undefined
      }
      $ApiService.lmsWorkerService
        ._index({ params })
        .then((res) => {
          this.list = res.data.data.data
          this.totalItems = res.data.data.total
        })
        .finally(() => {
          this.loading = false
        })
    },
    _create(data) {
      this.saveLoading = true
      $ApiService.lmsWorkerService
        ._create({ data })
        .then((res) => {
          this.visible = false
          this._index()
        })
        .finally(() => {
          this.saveLoading = false
        })
    },
    _delete() {
      this.loading = true
      $ApiService.lmsWorkerService._delete({ data: { ids: this.selectedWorkers } }).then(() => {
        this._index()
      })
    },

    openVisible(data) {
      this.visible = data
    },
    resetForm() {
      this.payload.edu_plan_id = null
      this.payload.organizations = []
      this.payload.worker_position_ids = []
      this.workerParams.page = 1
      this.workerParams.search = ''
      this.workerList = []
      this.totalWorker = 0
    }
  }
})
