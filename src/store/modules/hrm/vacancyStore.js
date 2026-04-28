import { defineStore } from 'pinia'
import i18n from '@/i18n/index.js'
import Utils from '@/utils/Utils.js'
import dayjs from 'dayjs'
const { t } = i18n.global

const FAKE_NAMES = [
  { last: 'Karimov', first: 'Jasur', middle: 'Aliyevich' },
  { last: 'Rahimova', first: 'Nodira', middle: 'Bekovna' },
  { last: 'Toshmatov', first: 'Sanjar', middle: 'Hamidovich' },
  { last: 'Yusupova', first: 'Malika', middle: 'Rustamovna' },
  { last: 'Mirzayev', first: 'Otabek', middle: 'Ulugbekovich' },
  { last: 'Hasanova', first: 'Dilnoza', middle: 'Sherzodovna' },
  { last: 'Nazarov', first: 'Eldor', middle: 'Baxtiyor ugli' },
  { last: 'Ergasheva', first: 'Shahnoza', middle: 'Alimovna' },
]
const FAKE_STATUSES = [
  { id: 1, name: 'Kutilmoqda' },
  { id: 2, name: 'Qabul qilindi' },
  { id: 3, name: 'Rad etildi' },
]
const FAKE_EDUCATION = ["O'rta", "O'rta maxsus", 'Oliy', 'Magistr']
const FAKE_NATIONALITIES = ['O\'zbek', 'Rus', 'Qozoq', 'Tojik']
const FAKE_REGIONS = ['Toshkent', 'Samarqand', 'Buxoro', 'Farg\'ona', 'Andijon', 'Namangan']

const generateFakeApplications = () => {
  const count = Math.floor(Math.random() * 6) + 2
  return Array.from({ length: count }, (_, i) => {
    const name = FAKE_NAMES[i % FAKE_NAMES.length]
    const status = FAKE_STATUSES[Math.floor(Math.random() * FAKE_STATUSES.length)]
    return {
      id: i + 1,
      user: {
        last_name: name.last,
        first_name: name.first,
        middle_name: name.middle,
        photo: null,
        pin: `${30000000000000 + i}`,
        phone: `+99890${Math.floor(1000000 + Math.random() * 9000000)}`,
        birthday: `199${Math.floor(Math.random() * 9)}-0${Math.floor(Math.random() * 8) + 1}-${Math.floor(Math.random() * 27) + 1}`,
        education: FAKE_EDUCATION[Math.floor(Math.random() * FAKE_EDUCATION.length)],
        nationality: { name: FAKE_NATIONALITIES[Math.floor(Math.random() * FAKE_NATIONALITIES.length)] },
        current_region: { name: FAKE_REGIONS[Math.floor(Math.random() * FAKE_REGIONS.length)] },
        current_city: { name: 'Markaziy tuman' },
        address: `Ko\'cha ${Math.floor(Math.random() * 50) + 1}, ${Math.floor(Math.random() * 100) + 1}-uy`,
        email: `${name.first.toLowerCase()}${i}@gmail.com`,
      },
      status,
      created_at: `2026-0${Math.floor(Math.random() * 3) + 1}-${Math.floor(Math.random() * 27) + 1}`,
      files: Math.random() > 0.5 ? [{ id: 1, name: 'diplom.pdf', file: '#' }, { id: 2, name: 'passport.pdf', file: '#' }] : [],
    }
  })
}
export const useVacancyStore = defineStore('vacancyStore', {
  state: () => ({
    list: [],
    loading: false,
    saveLoading: false,
    deleteLoading: false,
    visible: false,
    visibleType: true,
    elementId: null,
    totalItems: 0,
    payload: {
      department_position_id: null,
      region_id: null,
      city_id: null,
      address: null,
      work_type: null,
      education: null,
      rate: null,
      salary: null,
      experience: null,
      to: null,
      position_obligations: '',
      qualification_requirements: '',
      working_conditions: '',
      specialties: '',
      salary_status: true,
      phd_status: false
    },
    params: {
      page: 1,
      per_page: 10,
      search: null,
      organizations: [],
      vacation_type: null
    },
    positionLoading: false,
    vacancyPositions: [],
    cityList: [],
    cityLoading: false,
    switchLoading: false,
    // Tabs
    activeTab: 'vacancies',
    selectedVacancy: null,
    // Applications
    applicationsLoading: false,
    applicationsList: [],
    applicationsTotalItems: 0,
    applicationsParams: {
      page: 1,
      per_page: 10
    },
    // Application View Modal
    applicationViewVisible: false,
    selectedApplication: null,
    applicationActionLoading: false,
    // Confirm Modal
    confirmModalVisible: false,
    confirmMessage: '',
    // View Modal
    viewVisible: false,
    viewData: null,
    viewApplications: [],
    viewLoading: false,
    changeStatusLoading: false,
    // Application action modal
    actionModalVisible: false,
    actionModalApp: null,
    actionForm: {
      type: null,
      status: null,
      next_level: false,
      message: '',
      details: []
    },
    fileTypes: [],
    fileTypesLoading: false,
    actionLoading: false,
    // Upload modal
    uploadModalVisible: false,
    uploadModalApp: null,
    uploadForm: {
      type: null,
      file: null
    },
    uploadLoading: false,
    // Meet modal
    meetModalVisible: false,
    meetModalApp: null,
    meetForm: {
      meet_date_and_time: null,
      duration: 60,
      privilege: false
    },
    meetLoading: false,
    detailVisible: false,
    selectedDetailApp: null,
    detailLoading: false,
    detailUserData: null,
    // Exam modal
    examModalVisible: false,
    examModalApp: null,
    examList: [],
    examTotal: 0,
    examLoading: false,
    examSearch: '',
    attachingExamId: null,
    detachingExamId: null,
    detachingDirectAppId: null,
    togglingExamAppId: null,
    rejectingDirectAppId: null,
    rejectConfirmVisible: false,
    rejectConfirmApp: null,
    acceptingDirectAppId: null,
    acceptConfirmVisible: false,
    acceptConfirmApp: null,
    // Finish vacancy
    finishConfirmVisible: false,
    finishLoading: false,
    // Preview modal
    previewVisible: false,
    previewLoading: false,
    previewData: null,
    // Exam result modal (offline)
    examResultModalVisible: false,
    examResultModalApp: null,
    examResultForm: {
      created: null,
      ended: null,
      result: '',
    },
    examResultLoading: false,
  }),
  actions: {
    _index() {
      this.loading = true
      const params = {
        ...this.params,
        organizations: this.params?.organizations?.map((v) => v.id)?.toString() || undefined
      }
      $ApiService.vacancyService
        ._index({ params })
        .then((res) => {
          this.list = res.data.data.data
          this.totalItems = res.data.data.total
        })
        .finally(() => {
          this.loading = false
        })
    },
    _create() {
      this.saveLoading = true
      const data = {
        ...this.payload,
        to: Utils.timeToZone(this.payload.to),
        salary: this.payload.salary_status ? this.payload.salary : 0
      }
      $ApiService.vacancyService
        ._store({ data })
        .then((res) => {
          this.visible = false
          this._index()
        })
        .finally(() => {
          this.saveLoading = false
        })
    },
    _show() {
      $ApiService.vacancyService
        ._show({ id: this.elementId })
        .then((res) => {
          const v = res.data.data
          this.payload.department_position_id = v.department_position_id
          this.payload.region_id = v.city?.region?.id
          this.payload.city_id = v.city.id
          this.payload.education = v.education.id
          this.payload.rate = v.rate?.toString()
          this.payload.salary = v.salary_status ? v.salary?.toString() : null
          this.payload.experience = v.experience?.toString()
          this.payload.to = Utils.datePickerFormatter(v.to)
          this.payload.work_type = v.work_type.id
          this.payload.address = v.address
          this.payload.position_obligations = v.position_obligations
          this.payload.qualification_requirements = v.qualification_requirements
          this.payload.working_conditions = v.working_conditions
          this.payload.specialties = v.specialties
          this.payload.salary_status = v.salary_status || false
          this.payload.phd_status = v.phd_status || false
          this._cities(this.payload.region_id)
          this.visibleType = false
          this.visible = true
        })
        .finally(() => {})
    },
    _vacancyPositions() {
      this.positionLoading = true
      $ApiService.vacancyService
        ._vacancyPosition({ page: 1, per_page: 1000 })
        .then((res) => {
          this.vacancyPositions = res.data.data.positions.map((v) => ({
            ...v,
            name: v.position,
            position: v.department,
            city: res.data.data?.city
          }))
        })
        .finally(() => {
          this.positionLoading = false
        })
    },
    _cities(v) {
      this.cityLoading = true
      $ApiService.districtService
        ._index({ params: { page: 1, per_page: 1000, region_id: v } })
        .then((res) => {
          this.cityList = res.data.data.data
        })
        .finally(() => {
          this.cityLoading = false
        })
    },
    _update() {
      this.saveLoading = true
      const data = {
        ...this.payload,
        to: Utils.timeToZone(this.payload.to),
        salary: this.payload.salary_status ? this.payload.salary : 0
      }
      $ApiService.vacancyService
        ._update({ data, id: this.elementId })
        .then((res) => {
          this.visible = false
          this._index()
        })
        .finally(() => {
          this.saveLoading = false
        })
    },
    _changePublic(v, item) {
      this.elementId = item.id
      this.switchLoading = true
      const data = {
        status: v
      }
      $ApiService.vacancyService
        ._update({ data, id: this.elementId })
        .then((res) => {})
        .finally(() => {
          this.switchLoading = false
        })
    },
    _delete() {
      this.deleteLoading = true
      $ApiService.vacancyService
        ._delete({ id: this.elementId })
        .then((res) => {
          this._index()
        })
        .finally(() => {
          this.deleteLoading = false
        })
    },
    openVisible(data) {
      this.visible = data
    },
    resetForm() {
      this.elementId = null
      this.payload.department_position_id = null
      this.payload.region_id = null
      this.payload.city_id = null
      this.payload.address = null
      this.payload.work_type = null
      this.payload.education = null
      this.payload.rate = null
      this.payload.salary = null
      this.payload.experience = null
      this.payload.to = null
      this.payload.position_obligations = ''
      this.payload.qualification_requirements = ''
      this.payload.working_conditions = ''
      this.payload.specialties = ''
      this.payload.salary_status = true
      this.payload.phd_status = false
    },
    _applications() {
      this.applicationsLoading = true
      $ApiService.vacancyService
        ._applications({ id: this.elementId, params: this.applicationsParams })
        .then((res) => {
          this.applicationsList = res.data.data.data
          this.applicationsTotalItems = res.data.data.total
        })
        .finally(() => {
          this.applicationsLoading = false
        })
    },
    openApplicationsTab(item) {
      this.elementId = item.id
      this.selectedVacancy = item
      this.applicationsParams.page = 1
      this.applicationsList = []
      this.activeTab = 'applications'
      this._applications()
    },
    openApplicationView(item) {
      this.selectedApplication = item
      this.applicationViewVisible = true
    },
    closeApplicationView() {
      this.applicationViewVisible = false
      this.selectedApplication = null
    },
    _acceptApplication() {
      this.applicationActionLoading = true
      $ApiService.vacancyService
        ._applicationAction({
          vacancyId: this.elementId,
          applicationId: this.selectedApplication.id,
          data: { status: 2 }
        })
        .then(() => {
          this.applicationViewVisible = false
          this._applications()
        })
        .finally(() => {
          this.applicationActionLoading = false
        })
    },
    _rejectApplication() {
      this.applicationActionLoading = true
      $ApiService.vacancyService
        ._applicationAction({
          vacancyId: this.elementId,
          applicationId: this.selectedApplication.id,
          data: { status: 3 }
        })
        .then(() => {
          this.applicationViewVisible = false
          this._applications()
        })
        .finally(() => {
          this.applicationActionLoading = false
        })
    },
    openConfirmModal(item) {
      this.selectedApplication = item
      this.confirmMessage = ''
      this.confirmModalVisible = true
    },
    closeConfirmModal() {
      this.confirmModalVisible = false
      this.selectedApplication = null
      this.confirmMessage = ''
    },
    _acceptWithMessage() {
      this.applicationActionLoading = true
      $ApiService.vacancyService
        ._applicationAction({
          vacancyId: this.elementId,
          applicationId: this.selectedApplication.id,
          data: { status: 2, message: this.confirmMessage }
        })
        .then(() => {
          this.confirmModalVisible = false
          this.confirmMessage = ''
          this._applications()
        })
        .finally(() => {
          this.applicationActionLoading = false
        })
    },
    openViewModal(item) {
      this.viewData = item
      this.viewApplications = []
      this.viewLoading = true
      this.activeTab = 'view'
      $ApiService.vacancyService
        ._view({ id: item.id })
        .then((res) => {
          const data = res.data.data
          this.viewData = data
          this.viewApplications = data.applications || []
        })
        .finally(() => {
          this.viewLoading = false
        })
    },
    // Levellar bo'yicha hujjat tekshiruvi kerakmi
    _levelNeedsFiles(levelId) {
      // Hujjat baholash (2) uchun file types kerak, qolganlar uchun emas
      const FILE_LEVELS = [2]
      return FILE_LEVELS.includes(levelId)
    },
    openActionModal(app, levelId) {
      this.actionModalApp = app
      this.actionForm.type = levelId
      this.actionForm.status = 2
      this.actionForm.next_level = false
      this.actionForm.message = ''
      this.actionForm.details = []
      this.fileTypes = []
      this.actionModalVisible = true
      if (this._levelNeedsFiles(levelId)) {
        this._fetchFileTypes()
      }
    },
    closeActionModal() {
      this.actionModalVisible = false
      this.actionModalApp = null
    },
    _fetchFileTypes() {
      this.fileTypesLoading = true
      $ApiService.vacancyService
        ._enums()
        .then((res) => {
          this.fileTypes = res.data.data?.vacancy_file_types || []
          this.actionForm.details = this.fileTypes.map((ft) => ({
            file_type: ft.id,
            status: 3
          }))
        })
        .finally(() => {
          this.fileTypesLoading = false
        })
    },
    _submitApplicationAction() {
      this.actionLoading = true
      const data = {
        type: this.actionForm.type,
        status: this.actionForm.status,
        next_level: this.actionForm.next_level,
        message: this.actionForm.message || '',
        ...(this.fileTypes.length > 0 && { details: this.actionForm.details })
      }
      $ApiService.vacancyService
        ._updateApplicationLevel({
          vacancyId: this.viewData?.id,
          applicationId: this.actionModalApp?.id,
          data
        })
        .then(() => {
          this.actionModalVisible = false
          this.openViewModal(this.viewData)
        })
        .finally(() => {
          this.actionLoading = false
        })
    },
    _changeStatus() {
      this.changeStatusLoading = true
      const id = this.viewData?.id
      $ApiService.vacancyService
        ._changeStatus({ id })
        .then(() => {
          this.viewLoading = true
          return $ApiService.vacancyService._view({ id })
        })
        .then((res) => {
          const data = res.data.data
          this.viewData = data
          this.viewApplications = data.applications || []
        })
        .finally(() => {
          this.changeStatusLoading = false
          this.viewLoading = false
        })
    },
    openUploadModal(app, levelId) {
      this.uploadModalApp = app
      this.uploadForm.type = levelId
      this.uploadForm.file = null
      this.uploadModalVisible = true
    },
    closeUploadModal() {
      this.uploadModalVisible = false
      this.uploadModalApp = null
    },
    _uploadFile() {
      if (!this.uploadForm.type || !this.uploadForm.file) return
      this.uploadLoading = true
      const formData = new FormData()
      formData.append('type', this.uploadForm.type)
      formData.append('file', this.uploadForm.file)
      $ApiService.vacancyService
        ._uploadApplicationFile({
          vacancyId: this.viewData?.id,
          applicationId: this.uploadModalApp?.id,
          formData
        })
        .then(() => {
          this.uploadModalVisible = false
          this.openViewModal(this.viewData)
        })
        .finally(() => {
          this.uploadLoading = false
        })
    },
    openMeetModal(app) {
      this.meetModalApp = app
      this.meetForm.meet_date_and_time = null
      this.meetForm.duration = 60
      this.meetForm.privilege = false
      this.meetModalVisible = true
    },
    closeMeetModal() {
      this.meetModalVisible = false
      this.meetModalApp = null
    },
    _createMeet() {
      this.meetLoading = true
      $ApiService.vacancyService
        ._createMeet({
          vacancyId: this.viewData?.id,
          applicationId: this.meetModalApp?.id,
          data: {
            meet_date_and_time: this.meetForm.meet_date_and_time
              ? dayjs(this.meetForm.meet_date_and_time).format('YYYY-MM-DD HH:mm:ss')
              : null,
            duration: this.meetForm.duration,
            privilege: this.meetForm.privilege
          }
        })
        .then(() => {
          this.meetModalVisible = false
          this.openViewModal(this.viewData)
        })
        .finally(() => {
          this.meetLoading = false
        })
    },
    openDetailModal(app) {
      this.selectedDetailApp = app
      this.detailUserData = null
      this.detailVisible = true
      if (!this.fileTypes.length) {
        this._fetchFileTypes()
      }
      this.detailLoading = true
      $ApiService.vacancyService
        ._showUser({
          vacancyId: this.viewData?.id,
          applicationId: app.id,
        })
        .then(res => {
          this.detailUserData = res.data?.data || null
        })
        .finally(() => {
          this.detailLoading = false
        })
    },
    openRejectConfirm(app) {
      this.rejectConfirmApp = app
      this.rejectConfirmVisible = true
    },
    closeRejectConfirm() {
      this.rejectConfirmVisible = false
      this.rejectConfirmApp = null
    },
    _rejectDirect() {
      this.rejectingDirectAppId = this.rejectConfirmApp?.id
      $ApiService.vacancyService
        ._applicationAction({
          vacancyId: this.viewData?.id,
          applicationId: this.rejectConfirmApp?.id,
          data: { status: 3 }
        })
        .then(() => {
          this.rejectConfirmVisible = false
          this.rejectConfirmApp = null
          this.openViewModal(this.viewData)
        })
        .finally(() => {
          this.rejectingDirectAppId = null
        })
    },
    openAcceptConfirm(app) {
      this.acceptConfirmApp = app
      this.acceptConfirmVisible = true
    },
    closeAcceptConfirm() {
      this.acceptConfirmVisible = false
      this.acceptConfirmApp = null
    },
    _acceptDirect() {
      this.acceptingDirectAppId = this.acceptConfirmApp?.id
      $ApiService.vacancyService
        ._applicationAction({
          vacancyId: this.viewData?.id,
          applicationId: this.acceptConfirmApp?.id,
          data: { status: 2 }
        })
        .then(() => {
          this.acceptConfirmVisible = false
          this.acceptConfirmApp = null
          this.openViewModal(this.viewData)
        })
        .finally(() => {
          this.acceptingDirectAppId = null
        })
    },
    openPreviewModal(item) {
      this.previewData = item
      this.previewVisible = true
      this.previewLoading = true
      $ApiService.vacancyService
        ._view({ id: item.id })
        .then((res) => {
          this.previewData = res.data.data
        })
        .finally(() => {
          this.previewLoading = false
        })
    },
    closePreviewModal() {
      this.previewVisible = false
      this.previewData = null
    },
    _finishVacancy() {
      this.finishLoading = true
      $ApiService.vacancyService
        ._finishVacancy({ id: this.viewData?.id, data: { finish: 2 } })
        .then(() => {
          this.finishConfirmVisible = false
          this.openViewModal(this.viewData)
        })
        .finally(() => {
          this.finishLoading = false
        })
    },
    openExamModal(app) {
      this.examModalApp = app
      this.examSearch = ''
      this.examList = []
      this.examModalVisible = true
      this._fetchExams()
    },
    closeExamModal() {
      this.examModalVisible = false
      this.examModalApp = null
    },
    _fetchExams() {
      this.examLoading = true
      $ApiService.vacancyService
        ._filterExams({ params: { page: 1, per_page: 100 } })
        .then((res) => {
          this.examList = res.data.data?.data || []
          this.examTotal = res.data.data?.total || 0
        })
        .finally(() => {
          this.examLoading = false
        })
    },
    _refreshAfterExamAction() {
      return $ApiService.vacancyService
        ._view({ id: this.viewData?.id })
        .then((res) => {
          const data = res.data.data
          this.viewData = data
          this.viewApplications = data.applications || []
          // examModalApp ni yangilangan ro'yxatdan topib update qilamiz
          const fresh = this.viewApplications.find(a => a.id === this.examModalApp?.id)
          if (fresh) this.examModalApp = fresh
        })
    },
    _detachExamDirect(app, vacancyExamId) {
      this.detachingDirectAppId = app.id
      $ApiService.vacancyService
        ._detachExam({
          vacancyId: this.viewData?.id,
          applicationId: app.id,
          data: { vacancy_exam_id: vacancyExamId }
        })
        .then(() => {
          this.openViewModal(this.viewData)
        })
        .finally(() => {
          this.detachingDirectAppId = null
        })
    },
    _toggleExamStatus(app, exams, status) {
      this.togglingExamAppId = app.id
      $ApiService.vacancyService
        ._updateExam({
          vacancyId: this.viewData?.id,
          applicationId: app.id,
          data: {
            exam_type: false,
            exam_id: exams.vacancy_application_exam,
            status: status,
          }
        })
        .then(() => {
          this.openViewModal(this.viewData)
        })
        .finally(() => {
          this.togglingExamAppId = null
        })
    },
    _attachExam(examId) {
      this.attachingExamId = examId
      $ApiService.vacancyService
        ._attachExam({
          vacancyId: this.viewData?.id,
          applicationId: this.examModalApp?.id,
          data: { exam_id: examId }
        })
        .then(() => {
          this.examModalVisible = false
          this.examModalApp = null
          this.openViewModal(this.viewData)
        })
        .finally(() => {
          this.attachingExamId = null
        })
    },
    _detachExam(vacancyExamId) {
      this.detachingExamId = vacancyExamId
      $ApiService.vacancyService
        ._detachExam({
          vacancyId: this.viewData?.id,
          applicationId: this.examModalApp?.id,
          data: { vacancy_exam_id: vacancyExamId }
        })
        .then(() => {
          this._refreshAfterExamAction()
        })
        .finally(() => {
          this.detachingExamId = null
        })
    },
    openExamResultModal(app) {
      this.examResultModalApp = app
      this.examResultForm.created = null
      this.examResultForm.ended = null
      this.examResultForm.result = ''
      this.examResultModalVisible = true
    },
    closeExamResultModal() {
      this.examResultModalVisible = false
      this.examResultModalApp = null
    },
    _submitExamResult() {
      this.examResultLoading = true
      $ApiService.vacancyService
        ._updateExam({
          vacancyId: this.viewData?.id,
          applicationId: this.examResultModalApp?.id,
          data: {
            exam_type: true,
            created: this.examResultForm.created
              ? dayjs(this.examResultForm.created).format('YYYY-MM-DD HH:mm:ss')
              : null,
            ended: this.examResultForm.ended
              ? dayjs(this.examResultForm.ended).format('YYYY-MM-DD HH:mm:ss')
              : null,
            result: this.examResultForm.result,
          }
        })
        .then(() => {
          this.examResultModalVisible = false
          this.examModalVisible = false
          this.examModalApp = null
          this.openViewModal(this.viewData)
        })
        .finally(() => {
          this.examResultLoading = false
        })
    },
    _rejectWithMessage() {
      this.applicationActionLoading = true
      $ApiService.vacancyService
        ._applicationAction({
          vacancyId: this.elementId,
          applicationId: this.selectedApplication.id,
          data: { status: 3, message: this.confirmMessage }
        })
        .then(() => {
          this.confirmModalVisible = false
          this.confirmMessage = ''
          this._applications()
        })
        .finally(() => {
          this.applicationActionLoading = false
        })
    }
  }
})
