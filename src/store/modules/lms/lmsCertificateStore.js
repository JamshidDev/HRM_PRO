import { defineStore } from 'pinia'
import i18n from '@/i18n/index.js'
import Utils from '@/utils/Utils.js'
import router from '@/router'

const { t } = i18n.global
export const useLmsCertificateStore = defineStore('lmsCertificateStore', {
  state: () => ({
    list: [],
    loading: false,
    downloadLoading: false,
    zipLoading: false,
    saveLoading: false,
    visible: false,
    visibleType: true,
    elementId: null,
    totalItems: 0,
    params: {
      page: 1,
      per_page: 10,
      search: null,
      group_id: null,
      organization_id: [],
      year: null,
      month: null,
      direction_id: null,
      specialization_id: null,
      edu_plan_id: null,
      confirmation: null
    },

    payload: {
      group_id: null,
      protocol_id: null,
      workers: [],
      protocol_date: null,
      cert_from: null,
      cert_to: null
    },
    workerLoading: false,
    exam: {
      loading: false
    },
    group: {
      list: [],
      loading: false,
      totalItems: 0,
      params: {
        page: 1,
        per_page: 100,
        search: null
      }
    },
    eduPlan: {
      list: [],
      loading: false,
      totalItems: 0,
      params: {
        page: 1,
        per_page: 100,
        search: null
      }
    },
    direction: {
      list: [],
      loading: false,
      totalItems: 0,
      params: {
        page: 1,
        per_page: 100,
        search: null
      }
    },
    spn: {
      list: [],
      loading: false,
      totalItems: 0,
      params: {
        page: 1,
        per_page: 100,
        search: null
      }
    },
    protocol: {
      list: [],
      params: {
        page: 1,
        per_page: 10,
        search: null
      },
      loading: false,
      totalItems: 0,
      visible: false
    }
  }),
  actions: {
    _group(infinity) {
      this.group.loading = true
      const params = {
        ...this.group.params
      }
      $ApiService.certificateService
        ._group({ params })
        .then((res) => {
          const data = res.data.data.data.map((v) => ({ id: v.id, name: v.code }))
          this.group.list = infinity ? [...this.group.list, ...data] : data
          this.group.totalItems = res.data.data.total
        })
        .finally(() => {
          this.group.loading = false
        })
    },
    _eduPlan(infinity) {
      this.eduPlan.loading = true
      const params = {
        ...this.eduPlan.params
      }
      $ApiService.certificateService
        ._eduPlan({ params })
        .then((res) => {
          const data = res.data.data.data.map((v) => ({
            id: v.id,
            name: v.name,
            position: `${t('content.group')}-${v.count_groups};  ${t('content.worker')}-${v.count_workers}`
          }))
          this.eduPlan.list = infinity ? [...this.eduPlan.list, ...data] : data
          this.eduPlan.totalItems = res.data.data.total
        })
        .finally(() => {
          this.eduPlan.loading = false
        })
    },
    _direction(infinity) {
      this.direction.loading = true
      const params = {
        ...this.direction.params
      }
      $ApiService.certificateService
        ._direction({ params })
        .then((res) => {
          const data = res.data.data.data.map((v) => ({ id: v.id, name: v.name }))
          this.direction.list = infinity ? [...this.direction.list, ...data] : data
          this.direction.totalItems = res.data.data.total
        })
        .finally(() => {
          this.direction.loading = false
        })
    },
    _spn(infinity) {
      this.spn.loading = true
      const params = {
        ...this.spn.params
      }
      $ApiService.certificateService
        ._specializations({ params })
        .then((res) => {
          const data = res.data.data.data.map((v) => ({
            id: v.id,
            name: v.name,
            position: v?.direction?.name
          }))
          this.spn.list = infinity ? [...this.spn.list, ...data] : data
          this.spn.totalItems = res.data.data.total
        })
        .finally(() => {
          this.spn.loading = false
        })
    },
    _index() {
      const params = {
        ...this.params,
        organization_id: this.params.organization_id?.[0]?.id || undefined
      }
      this.loading = true
      $ApiService.certificateService
        ._index({ params })
        .then((res) => {
          this.list = res.data.data.data
          this.totalItems = res.data.data.total
        })
        .finally(() => {
          this.loading = false
        })
    },
    // Hisobot — joriy filtrlarni (_index bilan bir xil) export endpointiga yuboradi.
    // Modal yo'q; natija fonda yig'ilib "Eksport" bo'limida paydo bo'ladi.
    _downloadReport() {
      this.downloadLoading = true
      const params = {
        ...this.params,
        page: undefined,
        per_page: undefined,
        organization_id: this.params.organization_id?.[0]?.id || undefined
      }
      $ApiService.certificateService
        ._export({ params })
        .finally(() => {
          this.downloadLoading = false
        })
    },
    // Imzolangan sertifikatlarni ZIP bilan yuklash — joriy filtrlar (_index bilan
    // bir xil). Fonda yig'ilib "Eksport" bo'limida paydo bo'ladi.
    _downloadCertificates() {
      this.zipLoading = true
      const params = {
        ...this.params,
        page: undefined,
        per_page: undefined,
        organization_id: this.params.organization_id?.[0]?.id || undefined
      }
      $ApiService.certificateService
        ._downloadCertificates({ params })
        .finally(() => {
          this.zipLoading = false
        })
    },
    _openModal(v) {
      this.payload.group_id = v.id
      // this._getWorkers()
      this._getProtocols()
      this.protocol.visible = true
    },
    _workerExam(index, status) {
      this.workerLoading = true
      const workerId = this.payload.workers[index].workerId
      $ApiService.certificateService
        ._workerExams({ params: { worker_id: workerId } })
        .then((res) => {
          this.payload.workers[index][status ? 'startOption' : 'endOption'] =
            res.data.data.data.map((v) => ({
              id: v.id,
              name: v.exam?.name,
              position: v.exam?.topic?.type?.name,
              subPosition:
                `${v.result}/${v?.exam?.tests_count}` +
                ' ' +
                Utils.timeHHMMWithMonth(v?.exam?.deadline)
            }))
        })
        .finally(() => {
          this.workerLoading = false
        })
    },
    _getProtocols() {
      this.protocol.loading = true
      const params = {
        ...this.protocol.params,
        group_id: this.payload.group_id
      }
      $ApiService.certificateService
        ._protocol({ params })
        .then((res) => {
          this.protocol.list = res.data.data.data
          this.protocol.totalItems = res.data.data.total
        })
        .finally(() => {
          this.protocol.loading = false
        })
    },
    _getWorkers() {
      const group_id = this.payload.group_id
      const protocol_id = this.payload.protocol_id === 0 ? undefined : this.payload.protocol_id
      this.workerLoading = true
      $ApiService.lmsGroupService
        ._groupWorkers({ params: { group_id, protocol_id, page: 1, per_page: 500 } })
        .then((res) => {
          this.payload.workers = res.data.data.data.map((v) => ({
            id: v.id,
            workerId: v.worker?.id,
            workerPositionId: v?.worker_position_id,
            data: {
              photo: v?.worker?.photo,
              lastName: v?.worker?.last_name,
              firstName: v?.worker?.first_name,
              middleName: v?.worker?.middle_name,
              position: v?.position ?? ''
            },
            start_exam_result: v?.certificate?.start_exam_result || null,
            end_exam_result: v?.certificate?.end_exam_result || null,
            start_exam_id: null,
            end_exam_id: null,

            showStartInput: true,
            showEndInput: true,

            startOption: [],
            endOption: []
          }))
        })
        .finally(() => {
          this.workerLoading = false
        })
    },
    _create(data) {
      this.saveLoading = true
      $ApiService.certificateService
        ._create({ data })
        .then((res) => {
          this.visible = false
        })
        .finally(() => {
          this.saveLoading = false
        })
    },
    _delete() {
      this.deleteLoading = true
      $ApiService.certificateService
        ._delete({ id: this.elementId })
        .then((res) => {
          this._index()
        })
        .finally(() => {
          this.deleteLoading = false
        })
    },
    _resetParams() {
      Object.assign(this.params, {
        organization_id: [],
        search: null,
        year: null,
        month: null,
        direction_id: null,
        specialization_id: null,
        edu_plan_id: null,
        group_id: null,
        confirmation: null
      })
    }
  }
})
