import { defineStore } from 'pinia'
import i18n from '@/i18n/index.js'
import Utils from '@/utils/Utils.js'

export const useStructureReportStore = defineStore('structureReportStore', {
  state: () => ({
    list: [],
    totalItems: 0,
    loading: false,
    generateLoading: false,
    saveLoading: false,
    params: {
      page: 1,
      per_page: 10,
      search: null,
      year: null,
      month: null,
      organizations: []
    },
    structureCheck: [],
    reportLabels: [],
    reportUUID: null,
    reportYear: null,
    reportMonth: null,
    reportRawData: [],
    reportData: [],
    organizations: [],
    activeOrgTab: null,
    modalVisible: false,
    modalTab: 'organizations',
    selectedOrganizations: [],
    director_id: null,
    confirmations: [],
    editDirectorData: null,
    editConfirmationData: [],
    editMode: false,
    elementId: null,
    originalOrgIds: [],
    originalReportData: [],
    originalReportRawData: [],
    originalOrganizations: [],
    originalActiveOrgTab: null,
    excelModalVisible: false,
    excelReportUUID: null,
    excelLoading: { one: false, two: false, three: false },
    generalExcelModalVisible: false,
    statModalVisible: false,
    statLoading: false,
    statTree: [],
    managementModalVisible: false,
    managementYear: null,
    managementMonth: null,
    reportsPerMonth: [],
    reportsPerMonthLoading: false,
    reportsPerMonthTotal: 0,
    reportsPerMonthPage: 1,
    reportsPerMonthPerPage: 10,
    addOrganizations: [],
    addOrganizationsCheck: [],
    addLoading: false,
    reportsPerMonthSearch: null
  }),
  actions: {
    _index() {
      this.loading = true
      const params = {
        ...this.params,
        organizations: this.params.organizations.map((v) => v.id).toString() || undefined
      }
      $ApiService.structureReportService
        ._index({ params })
        .then((res) => {
          this.list = res.data.data.data || []
          this.totalItems = res.data.data.total || 0
        })
        .finally(() => {
          this.loading = false
        })
    },
    _generate() {
      this.generateLoading = true
      const data = {
        organizations: this.selectedOrganizations.map((v) => v.id)
      }
      const generateReq = $ApiService.structureReportService._generate({ data })
      const labelsReq = (!this.reportLabels || this.reportLabels.length === 0)
        ? $ApiService.structureReportService._labels()
        : Promise.resolve(null)

      Promise.all([generateReq, labelsReq])
        .then(([genRes, labelsRes]) => {
          if (labelsRes) {
            this.reportLabels = labelsRes.data.data || labelsRes.data || []
          }
          const resData = genRes.data?.data || genRes.data || {}
          const report = resData.report || {}
          this.reportUUID = typeof report === 'string' ? report : (report?.uuid || report?.id || null)
          this.elementId = report?.uuid || report?.id || this.reportUUID
          this.reportYear = report?.year || null
          this.reportMonth = report?.month || null
          const rawData = resData.data || []
          this.reportRawData = Array.isArray(rawData) ? rawData : []
          this.reportData = this.reportRawData.map((v) => v.data || v)
          this.organizations = this.reportData.map((v) => ({
            id: v.organization_id,
            name: v.organization_name
          }))
          if (this.reportData.length > 0) {
            this.activeOrgTab = String(this.reportData[0].organization_id)
            this.modalTab = 'reports'
          }
        })
        .finally(() => {
          this.generateLoading = false
        })
    },
    _labels(callback) {
      this.loading = true
      $ApiService.structureReportService
        ._labels()
        .then((res) => {
          this.reportLabels = res.data.data || res.data || []
          callback?.()
        })
        .finally(() => {
          this.loading = false
        })
    },
    getStatValue(orgData, key) {
      const stat = orgData?.stats?.find((s) => s.key === key)
      return stat ? stat.value : 0
    },
    setStatValue(orgData, key, value) {
      if (!orgData?.stats) return
      const stat = orgData.stats.find((s) => s.key === key)
      if (stat) {
        stat.value = value ?? 0
      }
    },
    _save() {
      this.saveLoading = true
      const formatContracts = (contracts) => {
        if (!contracts) return contracts
        return contracts.map((c) => ({
          ...c,
          old_position_date: Utils.timeToZone(c.old_position_date)
        }))
      }
      const rawData = this.reportRawData.map((item) => {
        const orgId = item.data?.organization_id || item.organization?.id
        const orgContracts = this.reportData.find((v) => String(v.organization_id) === String(orgId))?.contracts
        if (orgContracts && orgContracts.length > 0) {
          return { ...item, data: { ...item.data, contracts: formatContracts(orgContracts) } }
        }
        return item
      })
      const data = {
        director_id: this.director_id,
        confirmations: this.confirmations,
        report: this.reportUUID,
        data: rawData
      }
      $ApiService.structureReportService
        ._save({ data })
        .then(() => {
          this.modalVisible = false
          this._index()
        })
        .finally(() => {
          this.saveLoading = false
        })
    },
    _show(uuid) {
      this.generateLoading = true
      const showReq = $ApiService.structureReportService._show({ id: uuid })
      const labelsReq = (!this.reportLabels || this.reportLabels.length === 0)
        ? $ApiService.structureReportService._labels()
        : Promise.resolve(null)

      Promise.all([showReq, labelsReq])
        .then(([showRes, labelsRes]) => {
          if (labelsRes) {
            this.reportLabels = labelsRes.data.data || labelsRes.data || []
          }
          const resData = showRes.data?.data || {}
          this.elementId = resData.uuid || uuid
          this.reportUUID = resData.uuid || uuid
          this.reportYear = resData.year || null
          this.reportMonth = resData.month || null

          // normalize: worker nested yoki flat bo'lishi mumkin
          const normalizeUser = (obj) => {
            if (!obj || typeof obj !== 'object') return null
            const w = obj.worker || obj
            return {
              id: obj.id,
              photo: w.photo,
              last_name: w.last_name,
              first_name: w.first_name,
              middle_name: w.middle_name,
              position: obj.position || w.position
            }
          }

          // director — detaildan kelgan objectni saqlaymiz
          const director = resData.director_id || resData.director
          this.editDirectorData = typeof director === 'object' && director !== null
            ? normalizeUser(director)
            : null

          // confirmations — detaildan kelgan objectlarni saqlaymiz
          const confs = resData.confirmations || []
          this.editConfirmationData = confs
            .filter((c) => typeof c === 'object' && c !== null)
            .map(normalizeUser)
            .filter(Boolean)

          // details — har bir detail ichida organization, data, id bor
          const details = resData.details || resData.data || []
          this.reportRawData = Array.isArray(details) ? details : []
          this.reportData = this.reportRawData.map((v) => v.data || v)
          this.organizations = this.reportRawData.map((v) => ({
            id: v.organization?.id || v.data?.organization_id,
            name: v.organization?.name || v.data?.organization_name
          }))
          this.selectedOrganizations = this.organizations.map((v) => ({
            id: v.id,
            name: v.name
          }))

          // original holatni saqlaymiz
          this.originalOrgIds = this.organizations.map((v) => v.id)
          this.originalReportData = [...this.reportData]
          this.originalReportRawData = [...this.reportRawData]
          this.originalOrganizations = [...this.organizations]
          this.originalActiveOrgTab = this.organizations.length > 0 ? String(this.organizations[0].id) : null

          if (this.organizations.length > 0) {
            this.activeOrgTab = String(this.organizations[0].id)
          }
        })
        .finally(() => {
          this.generateLoading = false
        })
    },
    _refreshConfirmations(uuid) {
      const id = uuid || this.elementId
      return $ApiService.structureReportService._show({ id }).then((res) => {
        const resData = res.data?.data || {}
        const normalizeUser = (obj) => {
          if (!obj || typeof obj !== 'object') return null
          const w = obj.worker || obj
          return {
            id: obj.id,
            photo: w.photo,
            last_name: w.last_name,
            first_name: w.first_name,
            middle_name: w.middle_name,
            position: obj.position || w.position
          }
        }
        const director = resData.director_id || resData.director
        this.editDirectorData = typeof director === 'object' && director !== null
          ? normalizeUser(director)
          : null

        const confs = resData.confirmations || []
        this.editConfirmationData = confs
          .filter((c) => typeof c === 'object' && c !== null)
          .map(normalizeUser)
          .filter(Boolean)
      })
    },
    _update() {
      this.saveLoading = true
      const data = {
        director_id: this.director_id || this.editDirectorData?.id || null,
        confirmations: this.editConfirmationData.map((c) => c.id),
        report: this.reportUUID,
        data: this.reportRawData
      }
      $ApiService.structureReportService
        ._update({ id: this.elementId, data })
        .then(() => {
          this.modalVisible = false
          this._index()
        })
        .finally(() => {
          this.saveLoading = false
        })
    },
    _updateDetail(orgId) {
      this.saveLoading = true
      const formatContracts = (contracts) => {
        if (!contracts) return contracts
        return contracts.map((c) => ({
          ...c,
          old_position_date: Utils.timeToZone(c.old_position_date)
        }))
      }
      const detail = this.reportRawData.find((v) => {
        return (v.organization?.id || v.data?.organization_id) === orgId
      })
      if (!detail) {
        this.saveLoading = false
        return
      }
      const reportId = detail.id
      const orgData = detail.data || detail
      // yangi generate qilingan data — id yo'q, umumiy _update ishlatamiz
      if (!reportId) {
        const rawData = this.reportRawData.map((item) => {
          const oid = item.data?.organization_id || item.organization?.id
          const orgContracts = this.reportData.find((v) => String(v.organization_id) === String(oid))?.contracts
          if (orgContracts && orgContracts.length > 0) {
            return { ...item, data: { ...item.data, contracts: formatContracts(orgContracts) } }
          }
          return item
        })
        const data = {
          director_id: this.director_id || this.editDirectorData?.id || null,
          confirmations: this.editConfirmationData.map((c) => c.id),
          report: this.reportUUID,
          data: rawData
        }
        $ApiService.structureReportService
          ._update({ id: this.elementId, data })
          .then(() => {
            window.$message?.success(i18n.global.t('structureReport.saved'))
            this._show(this.elementId)
          })
          .finally(() => {
            this.saveLoading = false
          })
        return
      }
      const orgContracts = this.reportData.find((v) => String(v.organization_id) === String(orgId))?.contracts
      const payload = {
        data: {
          stats: orgData.stats || [],
          organization_id: orgId,
          ...(orgContracts && orgContracts.length > 0 ? { contracts: formatContracts(orgContracts) } : {})
        }
      }
      $ApiService.structureReportService
        ._updateDetail({ id: reportId, data: payload })
        .then(() => {
          window.$message?.success(i18n.global.t('structureReport.saved'))
        })
        .finally(() => {
          this.saveLoading = false
        })
    },
    _deleteDetail(orgId) {
      this.saveLoading = true
      const detail = this.reportRawData.find((v) => {
        return (v.organization?.id || v.data?.organization_id) === orgId
      })
      if (!detail) {
        this.saveLoading = false
        return
      }
      const reportId = detail.id
      $ApiService.structureReportService
        ._deleteDetail({ id: reportId })
        .then(() => {
          window.$message?.success(i18n.global.t('structureReport.deleted'))
          return $ApiService.structureReportService._show({ id: this.elementId })
        })
        .then((res) => {
          const resData = res.data?.data || {}
          const details = resData.details || resData.data || []
          this.reportRawData = Array.isArray(details) ? details : []
          this.reportData = this.reportRawData.map((v) => v.data || v)
          this.organizations = this.reportRawData.map((v) => ({
            id: v.organization?.id || v.data?.organization_id,
            name: v.organization?.name || v.data?.organization_name
          }))
          this.selectedOrganizations = this.organizations.map((v) => ({
            id: v.id,
            name: v.name
          }))
          if (this.organizations.length > 0) {
            this.activeOrgTab = String(this.organizations[0].id)
          } else {
            this.activeOrgTab = null
            this.modalTab = 'organizations'
          }
        })
        .finally(() => {
          this.saveLoading = false
        })
    },
    _delete(id) {
      this.loading = true
      $ApiService.structureReportService
        ._delete({ id })
        .then(() => {
          this._index()
        })
        .finally(() => {
          this.loading = false
        })
    },
    _downloadExcel(type) {
      this.excelLoading[type] = true
      $ApiService.structureReportService
        ._excel({ data: { report: this.excelReportUUID, type } })
        .then((res) => {
          const blob = new Blob([res.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
          const url = window.URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = url
          link.download = `hisobot_${type}_${Date.now()}.xlsx`
          link.click()
          window.URL.revokeObjectURL(url)
          window.$message?.success(i18n.global.t('structureReport.downloaded'))
        })
        .catch(() => {
          window.$message?.error(i18n.global.t('structureReport.downloadFailed'))
        })
        .finally(() => {
          this.excelLoading[type] = false
        })
    },
    openExcelModal(uuid) {
      this.excelReportUUID = uuid
      this.excelModalVisible = true
    },
    openModal() {
      this.editMode = false
      this.elementId = null
      this.selectedOrganizations = []
      this.reportData = []
      this.reportRawData = []
      this.reportUUID = null
      this.reportYear = null
      this.reportMonth = null
      this.organizations = []
      this.activeOrgTab = null
      this.director_id = null
      this.confirmations = []
      this.editDirectorData = null
      this.editConfirmationData = []
      this.modalTab = 'organizations'
      this.modalVisible = true
    },
    openEditModal(uuid) {
      this.editMode = true
      this.elementId = uuid
      this.selectedOrganizations = []
      this.reportData = []
      this.reportRawData = []
      this.reportUUID = null
      this.reportYear = null
      this.reportMonth = null
      this.organizations = []
      this.activeOrgTab = null
      this.director_id = null
      this.confirmations = []
      this.editDirectorData = null
      this.editConfirmationData = []
      this.modalTab = 'organizations'
      this.modalVisible = true
      this._show(uuid)
    },
    _fetchReportsPerMonth() {
      this.reportsPerMonthLoading = true
      const params = {
        year: this.managementYear,
        month: this.managementMonth,
        page: this.reportsPerMonthPage,
        per_page: this.reportsPerMonthPerPage,
        search: this.reportsPerMonthSearch || undefined
      }
      $ApiService.structureReportService
        ._reportsPerMonth({ params })
        .then((res) => {
          this.reportsPerMonth = res.data?.data?.data || []
          this.reportsPerMonthTotal = res.data?.data?.total || 0
        })
        .finally(() => {
          this.reportsPerMonthLoading = false
        })
    },
    openManagementModal() {
      this.managementYear = this.params.year
      this.managementMonth = this.params.month
      this.reportsPerMonthPage = 1
      this.reportsPerMonth = []
      this.reportsPerMonthSearch = null
      this.addOrganizations = []
      this.addOrganizationsCheck = []
      this.managementModalVisible = true
      this._fetchReportsPerMonth()
    },
    _saveReportsPerMonth() {
      if (!this.addOrganizations.length) return
      this.addLoading = true
      const existingIds = this.reportsPerMonth.map((v) => v.organization?.id).filter(Boolean)
      const newIds = this.addOrganizations.map((v) => v.id)
      const organizations = [...new Set([...existingIds, ...newIds])]
      const data = {
        organizations,
        year: this.managementYear,
        month: this.managementMonth
      }
      $ApiService.structureReportService
        ._updateReportsPerMonth({ data })
        .then(() => {
          this.addOrganizations = []
          this.addOrganizationsCheck = []
          this.reportsPerMonthPage = 1
          this._fetchReportsPerMonth()
        })
        .finally(() => {
          this.addLoading = false
        })
    },
    _deleteReportsPerMonth(id) {
      return $ApiService.structureReportService
        ._deleteReportsPerMonth({ id })
        .then(() => {
          this._fetchReportsPerMonth()
        })
    },
    _deleteAllReportsPerMonth() {
      this.reportsPerMonthLoading = true
      const params = {
        year: this.managementYear,
        month: this.managementMonth,
        page: 1,
        per_page: 1000,
        search: this.reportsPerMonthSearch || undefined
      }
      $ApiService.structureReportService
        ._reportsPerMonth({ params })
        .then((res) => {
          const all = res.data?.data?.data || []
          return Promise.all(all.map((item) =>
            $ApiService.structureReportService._deleteReportsPerMonth({ id: item.id })
          ))
        })
        .then(() => {
          this.reportsPerMonthPage = 1
          this._fetchReportsPerMonth()
        })
        .finally(() => {
          this.reportsPerMonthLoading = false
        })
    },
    _fetchReportsStat() {
      this.statLoading = true
      const params = {
        year: this.params.year,
        month: this.params.month,
        organizations: this.params.organizations.map((v) => v.id).toString() || undefined
      }
      $ApiService.structureReportService
        ._reportsStat({ params })
        .then((res) => {
          this.statTree = res.data?.data?.organizations || []
        })
        .finally(() => {
          this.statLoading = false
        })
    }
  }
})
