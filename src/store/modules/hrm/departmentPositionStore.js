import { defineStore } from 'pinia'
import { useComponentStore } from '@stores'

const initialPayload = () => ({
  organization_id: [],
  position_id: null,
  department_id: null,
  group: null,
  rank: null,
  max_rank: null,
  rate: null,
  salary: null,
  experience: null,
  education: null,
  organizations: [],
  departments: []
})

const initialParams = () => ({
  page: 1,
  per_page: 10,
  search: null,
  organizations: [],
  departments: []
})

export const useDepartmentPositionStore = defineStore('departmentPositionStore', {
  state: () => ({
    list: [],
    loading: false,
    saveLoading: false,
    visible: false,
    visibleType: true,
    elementId: null,
    totalItems: 0,
    payload:initialPayload(),
    params: initialParams(),

    filterDepParams: {
      page: 1,
      per_page: 1000,
      search: null,
      key: null
    },

    depParams: {
      page: 1,
      per_page: 1000,
      search: null,
      key: 'department-position-from-key'
    },
    preview:{
      visible:false,
      loading:false,
      total:0,
      list:[],
      params:{
        page:1,
        per_page:10,
        search:null,
      }
    }
  }),
  actions: {
    _preview(){
      const params = {
        ...this.preview.params,
        department_positions:this.elementId,
      }
      this.preview.loading = true
      $ApiService.workerService._index({ params }).then(res =>{
        this.preview.list = res.data.data.data
        this.preview.total = res.data.data.total
      }).finally(()=>{
        this.preview.loading = false
      })
    },
    onChangeStructure(v) {
      const store = useComponentStore()
      this.payload.organization_id = v
      store.departmentList = []
      this.payload.department_id = null
      store.depParams.organizations = v.length > 0 ? [v?.[0]?.id] : []
    },
    _index() {
      this.loading = true
      let params = {
        ...this.params,
        organizations: this.params.organizations.map((v) => v.id).toString() || undefined,
        departments: this.params.departments.toString() || undefined
      }
      $ApiService.departmentPositionService
        ._index({ params })
        .then((res) => {
          this.list = res.data.data.data.map(v =>({
            ...v,
            colorType:Number(v.rate)>Number(v.worker_rate) ? 'success':Number(v.rate) === Number(v.worker_rate)? 'default':'error'
          }))
          this.totalItems = res.data.data.total
        })
        .finally(() => {
          this.loading = false
        })
    },
    _create(callback = null) {
      let data = {
        ...this.payload,
        organization_id: undefined
      }

      if(callback){
        callback?.(data)
      }

      this.saveLoading = true
      $ApiService.departmentPositionService
        ._create({ data })
        .then((res) => {
          this.visible = false
          this._index()
        })
        .finally(() => {
          this.saveLoading = false
        })
    },
    _update() {
      this.saveLoading = true
      let data = {
        ...this.payload,
        organization_id: undefined
      }
      $ApiService.departmentPositionService
        ._update({ data, id: this.elementId })
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
      $ApiService.departmentPositionService
        ._delete({ id: this.elementId })
        .then(() => {
          this._index()
        })
        .finally(() => {
          this.loading = false
        })
    },
    changePreviewPage({page, per_page}){
      this.preview.params.page = page
      this.preview.params.per_page = per_page
      this._preview()
    },
    openVisible(data) {
      this.visible = data
    },
    resetForm() {
      this.elementId = null
      this.payload = initialPayload()
    }
  }
})
