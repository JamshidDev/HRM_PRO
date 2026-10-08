import { defineStore } from 'pinia'
import Utils from '@/utils/Utils.js'
import { usePdfViewerStore } from '@/store/modules/index.js'

export const useApplicationStore = defineStore('applicationStore', {
  state: () => ({
    list: [],
    loading: false,
    saveLoading: false,
    deleteLoading: false,
    visible: false,
    visibleType: true,
    elementId: null,
    totalItems: 0,
    departmentCheck: [],
    payload: {
      director_id: true,
      type: null,
      from_date: null,
      status: null,
      department_id: [],
      department_position_id: null
    },
    params: {
      page: 1,
      per_page: 15,
      search: null,
      organizations: [],
      created: null,
      // HR bo'limi: new | process | rejected | approved | closed | all
      stage: 'all'
    },
    // HR: imzolab kelishuvchilarga yo'naltirish modali.
    signStartLoading: false,
    forwardVisible: false,
    forwardLoading: false,
    forwardDirector: null,
    forwardMode: 'parallel',
    forwardIds: [],
    forwardViewerIds: [],
    // 'forward' — birinchi yo'naltirish, 'edit' — jarayonda o'zgartirish, 'resend' — rad etilgandan keyin qayta yuborish.
    forwardAction: 'forward',
    forwardPrefill: [],
    routeLoading: false,
    approverList: [],
    approverLoading: false,
    approverTotal: 0,
    viewerList: [],
    viewerLoading: false,
    viewerParams: { page: 1, per_page: 50, search: null, director_id: null },
    tabList: [1, 2, 3],
    activeTab: 1,
    applicationLink: null,

    form: {
      first_name: null,
      last_name: null,
      middle_name: null,
      birthday: null,
      country_id: null,
      region_id: null,
      city_id: null,
      current_region_id: null,
      current_city_id: null,
      nationality_id: null,
      address: null,
      pin: null,
      inn: null,
      marital_status: null,
      key: null,
      phones: [
        {
          id: 1,
          phone: '+998',
          main: true
        }
      ]
    },

    cityLoading: false,
    cityList: [],

    liveCityLoading: false,
    liveCityList: [],

    checkLoading: false,
    applicationData: null,

    acceptLoading: false,
    modalLoading: false
  }),
  actions: {
    _index() {
      this.loading = true
      const params = {
        ...this.params,
        created: Utils.timeToZone(this.params.created),
        organizations: this.params.organizations.map((v) => v.id).toString() || undefined,
        stage: this.params.stage === 'all' ? undefined : this.params.stage
      }
      $ApiService.applicationService
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
      let data = {
        ...this.payload,
        ...{
          department_id: this.payload.department_id?.[0]?.id || null,
          from_date: Utils.timeToZone(this.payload.from_date)
        }
      }
      $ApiService.applicationService
        ._generateUrl({ data })
        .then((res) => {
          this.applicationLink = Utils.convertFromUrlToQuery(
            res.data.data.url,
            Utils.viewerStatus.applicationDocument
          )
          this.activeTab = 2
          this._index()
        })
        .finally(() => {
          this.saveLoading = false
        })
    },
    _signStart(id, callback) {
      this.signStartLoading = true
      $ApiService.applicationService
        ._signStart({ id })
        .then((res) => callback?.(res.data.data))
        .finally(() => {
          this.signStartLoading = false
        })
    },
    openForward(director, action = 'forward', route = null) {
      this.forwardDirector = director
      this.forwardAction = action
      this.forwardPrefill = route?.items || []
      this.forwardMode = route?.mode || 'parallel'
      this.forwardIds = []
      this.forwardViewerIds = []
      this.approverList = []
      this.viewerList = []
      this.viewerParams = { page: 1, per_page: 50, search: null, director_id: director?.id ?? null }
      this.forwardVisible = true
      this._approvers()
    },
    // Kelishuvchilar — ariza korxonasining «Mas'ul xodimlar» ro'yxati (barcha xodimlar emas).
    _approvers() {
      this.approverLoading = true
      const pdfStore = usePdfViewerStore()
      $ApiService.applicationService
        ._approverOptions({ id: pdfStore.document_id })
        .then((res) => {
          this.approverList = (res.data.data || []).map((v) => ({
            ...v,
            name: Utils.combineFullName(v.worker)
          }))
        })
        .finally(() => {
          this.approverLoading = false
        })
    },
    // Tanishuvchilar — istalgan faol xodim (qidiruv + scroll).
    _viewers(infinite) {
      this.viewerLoading = true
      $ApiService.applicationService
        ._confirmation({ params: { ...this.viewerParams } })
        .then((res) => {
          const newData = res.data.data.data.map((v) => ({
            ...v,
            name: Utils.combineFullName(v.worker),
            position: v?.post_short_name,
            subPosition: v?.organization?.name
          }))
          this.viewerList = infinite ? [...this.viewerList, ...newData] : newData
        })
        .finally(() => {
          this.viewerLoading = false
        })
    },
    onSearchViewer(v) {
      this.viewerParams.page = 1
      this.viewerParams.search = v
      this._viewers()
    },
    onScrollViewer() {
      this.viewerParams.page += 1
      this._viewers(true)
    },
    // Joriy marshrut (tahrir/qayta yuborish uchun) + rahbar → modal.
    _openRoute(id, action, director) {
      this.routeLoading = true
      $ApiService.applicationService
        ._route({ id })
        .then((res) => this.openForward(director, action, res.data.data))
        .finally(() => {
          this.routeLoading = false
        })
    },
    _forward(id, callback) {
      this.forwardLoading = true
      const method = {
        forward: '_forward',
        edit: '_updateRoute',
        resend: '_resend'
      }[this.forwardAction]
      const send = $ApiService.applicationService[method]
      send({
        id,
        data: {
          mode: this.forwardMode,
          confirmations: this.forwardIds,
          viewers: this.forwardViewerIds
        }
      })
        .then(() => {
          this.forwardVisible = false
          callback?.()
        })
        .finally(() => {
          this.forwardLoading = false
        })
    },
    _accept(data, id, loadingKey = 'acceptLoading', callback) {
      this[loadingKey] = true
      const payload = {
        data: {
          ...data,
          status: data.status ? 1 : 2
        },
        id
      }

      $ApiService.applicationService
        ._accept(payload)
        .then(() => callback?.())
        .finally(() => {
          this[loadingKey] = false
        })
    },

    _update() {
      this.saveLoading = true
      $ApiService.nationalityService
        ._update({ data: this.payload, id: this.elementId })
        .then((res) => {
          this.visible = false
          this._index()
        })
        .finally(() => {
          this.saveLoading = false
        })
    },
    _delete() {
      this.deleteLoading = true
      $ApiService.commandService
        ._delete({ id: this.elementId })
        .then((res) => {
          this._index()
        })
        .finally(() => {
          this.deleteLoading = false
        })
    },

    _getCity() {
      this.cityList = []
      this.form.city_id = null
      const id = this.form.region_id
      this.cityLoading = true
      $ApiService.districtService
        ._index({ params: { page: 1, per_page: 1000, region_id: id } })
        .then((res) => {
          this.cityList = res.data.data.data
        })
        .finally(() => {
          this.cityLoading = false
        })
    },
    _getLiveCity() {
      this.liveCityList = []
      this.form.current_city_id = null
      const id = this.form.current_region_id
      this.liveCityLoading = true
      $ApiService.districtService
        ._index({ params: { page: 1, per_page: 1000, region_id: id } })
        .then((res) => {
          this.liveCityList = res.data.data.data
        })
        .finally(() => {
          this.liveCityLoading = false
        })
    },

    _checkApplication(params) {
      const store = usePdfViewerStore()
      store.errorMessage = null
      store.checkLoading = true
      $ApiService.applicationService
        ._checkApplication({ params, data: { status: 'check' } })
        .then((res) => {
          this.applicationData = res.data.data
        })
        .catch((err) => {
          store.errorMessage = err.response.data.message
        })
        .finally(() => {
          store.checkLoading = false
        })
    },
    _sendApp(params) {
      const store = usePdfViewerStore()
      this.saveLoading = true

      let data = {
        ...this.form,
        ...{
          pin: this.form.pin.split('-').join(''),
          birthday: Utils.timeToZone(this.form.birthday),
          phones: this.form.phones.map((v) => v.phone.split('-').join('').slice(4)),
          user_phone: this.form.phones
            .filter((v) => v.main)[0]
            .phone.split('-')
            .join('')
            .slice(4)
        }
      }
      $ApiService.applicationService
        ._checkApplication({ params, data })
        .then((res) => {})
        .finally(() => {
          this.saveLoading = false
        })
    },

    openVisible(data) {
      this.visible = data
    },
    resetForm() {
      this.payload.director_id = null
      this.payload.type = null
      this.payload.work_type = null
      this.payload.from_date = null
      this.payload.status = null
    }
  }
})
