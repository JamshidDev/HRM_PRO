import { defineStore } from 'pinia'
import { toRaw } from 'vue'
import i18n from '@/i18n/index.js'
import { useComponentStore } from '@/store/modules/index.js'

const { t } = i18n.global

/**
 * `tree` dan faqat `matches` daraxtidagi id'larga ega tugunlar va ularning
 * ota-zanjirini qoldiradi. To'liq daraxtda topilmagan natija bo'lsa (masalan,
 * keshdan keyin qo'shilgan) — backend javobining o'zi qaytariladi.
 */
const pickWithAncestors = (tree, matches) => {
  const ids = new Set()
  const collect = (nodes) => {
    for (const n of nodes || []) {
      ids.add(n.id)
      collect(n.children)
    }
  }
  collect(matches)

  let found = 0
  const prune = (nodes) =>
    (nodes || []).reduce((acc, n) => {
      const children = prune(n.children)
      if (ids.has(n.id)) found++
      if (ids.has(n.id) || children.length) acc.push({ ...n, children })
      return acc
    }, [])

  const result = prune(tree)
  return found === ids.size ? result : matches
}
// `table.positions` qaysi `department.list` uchun to'liq yuklangani. Ro'yxat
// o'zgarmagan bo'lsa (ro'yxat ↔ jadval almashtirilganda) qayta so'ralmaydi.
// Reaktiv emas — faqat solishtirish uchun.
let tableSource = null

export const useReport2Store = defineStore('report2Store', {
  state: () => ({
    list: [],
    loading: false,
    orgCheck: [],
    selectedPosId: null,

    positionLoading: false,
    totalPosition: 0,
    positionList: [],
    byPosition: true,
    // 'list' — bo'linma kartochkalari, 'table' — bo'linma → lavozim → xodim daraxt jadvali
    viewMode: 'list',
    // Jadval ko'rinishi barcha bo'linmalar lavozimlarini birdaniga ko'rsatadi
    table: {
      loading: false,
      seq: 0,
      done: 0,
      total: 0,
      positions: {},
      // Keyingi `_loadTable` faqat shu bo'linmalarni (va keshda yo'qlarini)
      // qayta so'raydi; null — hammasi qaytadan.
      refreshIds: null
    },

    workerParams: {
      page: 1,
      per_page: 1000,
      search: null,
      organization_id: null,
      department_id: null,
      department_position_id: null
    },
    workerLoading: false,
    workerList: [],
    totalWorker: 0,
    optimizationLoading: false,
    staffingExportLoading: false,

    visible: false,
    showLoading: false,
    saveLoading: false,
    elementId: null,
    lastDepartmentId: null,
    position: {
      loading: false,
      params: {
        page: 1,
        per_page: 1000,
        search: null
      },
      list: [],
      total: 0,
      selectedId: null,
      elementId: null,
      visible: false,
      visibleType: false
    },
    positionPayload: {
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
    },
    confirmVisible: false,
    structure: {
      cache: [],
      loading: false,
      list: [],
      // Qidiruvsiz to'liq daraxt — qidiruv natijasiga ota-tashkilotlarni qo'shish uchun.
      full: null,
      seq: 0,
      params: {
        search: null
      }
    },
    department: {
      loading: false,
      params: {
        organization_id: []
      },
      payload: {
        parent_id: null,
        level: null,
        name: null,
        name_ru: null,
        name_en: null,
        comment: null
      },
      list: [],
      cache: [],
      selectedId: null,
      elementId: null,
      selectDepartments: [],
      visible: false
    }
  }),
  getters: {
    // Saqlash yoki undan keyingi qayta yuklash tugamaguncha qator amallari
    // (tahrirlash/o'chirish/lavozim qo'shish) bloklanadi — aks holda eski
    // ma'lumot ustida ikkinchi tahrir ochilib, birinchisini bosib ketadi.
    busy: (state) =>
      state.saveLoading ||
      state.showLoading ||
      state.department.loading ||
      state.position.loading ||
      state.table.loading
  },
  actions: {
    _exportStaffing(organizationId) {
      this.staffingExportLoading = true
      return $ApiService.reportService
        ._staffingExport({ params: { organization_id: organizationId } })
        .then(() => {
          window.$message?.success(t('report.staffingExportQueued'))
        })
        .finally(() => {
          this.staffingExportLoading = false
        })
    },
    _positionOrderable(order) {
      const data = {
        type: 'position',
        organization_id: this.department.params.organization_id?.[0]?.id,
        department_id: this.department.selectedId,
        order: order
      }

      $ApiService.reportService._orderable({ data }).then((res) => {
        console.log(res.data)
      })
    },
    // Backend qidiruvda faqat mos kelgan tashkilotlarni qaytaradi — ota-tashkilotlari
    // kelmaydi. Shu sababli qidiruvsiz to'liq daraxtni (`full`) saqlab, natijani shu
    // daraxtdan qirqib olamiz: mos kelganlar ota-zanjiri bilan ko'rinadi.
    async _fetchStructure(callback) {
      const seq = ++this.structure.seq
      const search = this.structure.params.search?.trim() || null
      this.structure.loading = true
      try {
        // Qidiruvsiz so'rovda har safar yangilanadi — P/F raqamlari eskirib qolmasin.
        if (!search || !this.structure.full) {
          const res = await $ApiService.reportService._structure({ params: { search: null } })
          this.structure.full = res.data.data
        }
        let list = this.structure.full
        if (search) {
          const res = await $ApiService.reportService._structure({ params: { search } })
          list = pickWithAncestors(this.structure.full, res.data.data)
        }
        // Tez yozilganda eski javob yangisining ustiga yozilmasin.
        if (seq !== this.structure.seq) return
        this.structure.list = list
        callback?.(list)
      } finally {
        if (seq === this.structure.seq) this.structure.loading = false
      }
    },
    _getOptimization() {
      this.optimizationLoading = true
      const department_id = this.department.selectedId
      $ApiService.reportService
        ._optimization({ params: { department_id } })
        .then((res) => {
          this.confirmVisible = false
          this._invalidateTable([department_id])
          this.getPosition()
        })
        .finally(() => {
          this.optimizationLoading = false
        })
    },
    _getDepartment() {
      this.department.loading = true
      let params = {
        ...this.positionParams,
        organization_id: this.department.params.organization_id?.[0]?.id
      }
      $ApiService.reportService
        ._department({ params })
        .then((res) => {
          this.department.list = res.data.data.map((v) => ({
            ...v,
            name: v?.name,
            position: v?.organization?.name
          }))
        })
        .finally(() => {
          this.department.loading = false
        })
    },
    _deleteDepartment() {
      const id = this.department.elementId
      this.department.loading = true
      $ApiService.departmentService
        ._delete({ id })
        .then((res) => {
          // Bo'linma o'zgarishi lavozimlarga ta'sir qilmaydi — jadval keshi saqlanadi.
          this.table.refreshIds = []
          this._getDepartment()
        })
        .finally(() => {
          this.department.loading = false
        })
    },
    _deletePosition(departmentId) {
      this.position.loading = true
      $ApiService.departmentPositionService._delete({ id: this.position.elementId }).finally(() => {
        this.position.loading = false
        this.refreshPositions([departmentId ?? this.department.selectedId])
      })
    },
    // Lavozim o'zgargach: jadvalda bo'linma ro'yxati (P/F jamlari) yangilanadi,
    // lavozimlar esa faqat o'zgargan bo'linmalar uchun qayta so'raladi.
    // Ro'yxat ko'rinishida jadval keshi eskiradi — keyingi ochilishda to'liq yuklanadi.
    _invalidateTable(departmentIds) {
      if (this.viewMode === 'table') {
        this.table.refreshIds = departmentIds.filter(Boolean)
        this._getDepartment()
      } else {
        tableSource = null
      }
    },
    refreshPositions(departmentIds = []) {
      this._invalidateTable(departmentIds)
      if (this.viewMode !== 'table') this.getPosition()
    },
    // Har bir bo'linma lavozimlari alohida so'rov bilan keladi, shu bois ular
    // cheklangan parallellikda yuklanadi. Eski so'rov natijasi yangisini
    // bosib ketmasligi uchun `token` tekshiriladi.
    async _loadTable() {
      const list = toRaw(this.department.list)
      const only = this.table.refreshIds
      this.table.refreshIds = null
      if (list === tableSource && !only) return

      const token = ++this.table.seq
      const ids = []
      const walk = (items) =>
        items.forEach((v) => {
          ids.push(v.id)
          if (v.children?.length) walk(v.children)
        })
      walk(list)

      // Oldingi to'liq yuklash bo'lsa — keshdagi lavozimlar qayta ishlatiladi,
      // faqat o'zgargan va yangi bo'linmalar so'raladi.
      const cache = tableSource ? this.table.positions : {}
      const positions = {}
      const fetchIds = []
      ids.forEach((id) => {
        if (only && !only.includes(id) && id in cache) positions[id] = cache[id]
        else fetchIds.push(id)
      })

      this.table.loading = true
      this.table.done = 0
      this.table.total = fetchIds.length
      let cursor = 0
      const worker = async () => {
        while (cursor < fetchIds.length) {
          const id = fetchIds[cursor++]
          positions[id] = await this._tablePositions(id).catch(() => [])
          if (this.table.seq !== token) return
          this.table.done++
        }
      }
      await Promise.all(Array.from({ length: Math.min(6, fetchIds.length) }, worker))
      if (this.table.seq !== token) return
      this.table.positions = positions
      this.table.loading = false
      tableSource = list
    },
    _tablePositions(departmentId) {
      const params = {
        ...this.position.params,
        organization_id: this.department.params.organization_id?.[0]?.id,
        department_id: departmentId
      }
      return $ApiService.reportService._position({ params }).then((res) => res.data.data.data)
    },
    _tableWorkers(departmentId, departmentPositionId) {
      const params = {
        ...this.workerParams,
        organization_id: this.department.params.organization_id?.[0]?.id,
        department_id: departmentId,
        department_position_id: departmentPositionId
      }
      return $ApiService.reportService._worker({ params }).then((res) => res.data.data.data)
    },
    getPosition() {
      this.position.loading = true
      let params = {
        ...this.position.params,
        organization_id: this.department.params.organization_id?.[0]?.id,
        department_id: this.department.selectedId
      }
      $ApiService.reportService
        ._position({ params })
        .then((res) => {
          this.position.list = res.data.data.data
          this.position.total = res.data.data.total
        })
        .finally(() => {
          this.position.loading = false
        })
    },
    getWorker() {
      this.workerLoading = true
      let params = {
        ...this.workerParams,
        organization_id: this.department.params.organization_id?.[0]?.id,
        department_id: this.department.selectedId,
        department_position_id: this.byPosition ? this.position.selectedId : undefined
      }
      $ApiService.reportService
        ._worker({ params })
        .then((res) => {
          this.workerList = res.data.data.data
          this.totalWorker = res.data.data.total
        })
        .finally(() => {
          this.workerLoading = false
        })
    },
    onChangeDepartment(v) {},
    async onChangeRadio(v) {
      this.department.selectedId = this.department.selectedId === v.id ? null : v.id
      this.position.selectedId = null
      this.position.list = []
      await nextTick()
      if (this.department.selectedId) {
        this.positionList = []
        this.workerList = []
        if (this.byPosition) {
          this.getPosition()
        } else {
          this.getWorker()
        }
      }
    },
    async onChangePosRadio(v) {
      this.position.selectedId = this.position.selectedId === v.id ? null : v.id
      await nextTick()
      this.workerList = []
      if (this.position.selectedId) {
        this.getWorker()
      }
    },
    onChangeFilter() {
      this.department.selectedId = null
      this.byPosition = !this.byPosition
    },
    onChangeOrg(v) {
      const store = useComponentStore()
      store.depParams.organizations = [v?.[0]?.id]
      this.params.organization_id = v
      this._getDepartment()
    },
    onEdit(v) {
      const store = useComponentStore()
      this.position.visibleType = false
      this.position.visible = true
      this.showLoading = true
      this.elementId = v.id
      $ApiService.reportService
        ._showPosition({ id: v.id })
        .then((res) => {
          const v = res.data.data
          store.departmentList = [v.department]
          store._departments()
          this.positionPayload.position_id = v.position.id
          this.positionPayload.department_id = v.department.id
          this.lastDepartmentId = v.department.id
          this.positionPayload.rate = v.rate
          this.positionPayload.rank = v.rank.id
          this.positionPayload.max_rank = v.max_rank.id
          this.positionPayload.group = v.group.id
          this.positionPayload.education = v.education.id
          this.positionPayload.salary = v.salary?.toString()
          this.positionPayload.experience = v.experience?.toString()
        })
        .finally(() => {
          this.showLoading = false
        })
    },
    onCreatePosition(data) {
      this.saveLoading = true
      $ApiService.departmentPositionService
        ._create({ data })
        .then((res) => {
          this.position.visible = false
          this._invalidateTable([this.positionPayload.department_id])
          if (
            this.viewMode !== 'table' &&
            this.department.selectedId === this.positionPayload.department_id
          ) {
            this.getPosition()
          }
        })
        .finally(() => {
          this.saveLoading = false
        })
    },
    onUpdatePosition() {
      this.saveLoading = true
      let data = { ...this.positionPayload }
      $ApiService.departmentPositionService
        ._update({ data, id: this.elementId })
        .then((res) => {
          this.position.visible = false
          this._invalidateTable([this.lastDepartmentId, this.positionPayload.department_id])
          if (this.viewMode === 'table') return
          this.getPosition()
          if (this.lastDepartmentId !== this.positionPayload.department_id) {
            this._getDepartment()
          }
        })
        .finally(() => {
          this.saveLoading = false
        })
    },
    resetPositionPayload() {
      Object.assign(this.positionPayload, {
        position_id: null,
        department_id: null,
        group: null,
        rank: null,
        max_rank: null,
        rate: null,
        salary: null,
        experience: null,
        education: null
      })
    }
  }
})
