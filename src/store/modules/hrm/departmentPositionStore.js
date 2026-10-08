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
  departments: [],
  // Tarif setka + oklad oshiruvchi koeffitsientlar
  tariff_grid_id: null,
  tariff_grid_column: null,
  coefficients: [] // [{ id?, percent, reason, valid_from, valid_to }]
})

// Bugungi sana (YYYY-MM-DD, mahalliy) — koeffitsient muddati tekshiruvi uchun.
const todayLocal = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const initialParams = () => ({
  page: 1,
  per_page: 15,
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
    payload: initialPayload(),
    params: initialParams(),

    // Tarif setka (biriktirilgan) + ustunlar + oklad hisobi holati
    gridOptions: [],
    gridLoading: false,
    gridColumns: [], // tanlangan setka ustunlari [{key,name}] — >1 bo'lsa tanlanadi
    gridGroupIds: [], // setkada MAVJUD guruhlar (raqam) — group tanlagichni cheklaydi
    gridRankIds: [], // setkada MAVJUD razryadlar (string) — rank tanlagichni cheklaydi
    amountLoading: false,
    coeffOriginal: [], // edit rejimida sync diff uchun

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
    preview: {
      visible: false,
      loading: false,
      total: 0,
      list: [],
      params: {
        page: 1,
        per_page: 15,
        search: null
      }
    },

    // Oklad o'zgarish tarixi (lavozim darajasi)
    salaryHistory: {
      visible: false,
      loading: false,
      total: 0,
      list: [],
      dpId: null,
      params: {
        page: 1,
        per_page: 10
      }
    }
  }),
  getters: {
    // Asosiy oklad (setkadan yoki qo'lda).
    baseSalary(state) {
      return Number(state.payload.salary) || 0
    },
    // Yakuniy oklad = asosiy + Σ round(base × percent/100), faqat faol muddatlilar.
    totalSalary(state) {
      const base = Number(state.payload.salary) || 0
      const today = todayLocal()
      return (state.payload.coefficients || []).reduce((sum, c) => {
        const from = c.valid_from ? String(c.valid_from).slice(0, 10) : null
        const to = c.valid_to ? String(c.valid_to).slice(0, 10) : null
        if (from && today < from) return sum
        if (to && today > to) return sum
        const pct = Number(c.percent) || 0
        return sum + Math.round((base * pct) / 100)
      }, base)
    }
  },
  actions: {
    // --- Tarif setka ---
    // Biriktirilgan setkalar (union+fallback) — org/bo'lim bo'yicha.
    _fetchGrids() {
      const orgId = this.payload.organization_id?.[0]?.id
      const deptId = this.payload.department_id
      if (!orgId && !deptId) {
        this.gridOptions = []
        return
      }
      this.gridLoading = true
      $ApiService.tariffGridService
        ._forPosition({
          params: { organization_id: orgId || undefined, department_id: deptId || undefined }
        })
        .then((res) => {
          this.gridOptions = res.data.data || []
        })
        .finally(() => {
          this.gridLoading = false
        })
    },
    // Setka detali (annex) → ustun/guruh/razryad o'lchamlari. clearInvalid=true (yangi tanlov):
    // mos kelmaydigan group/rank tozalanadi + bitta ustun avto-tanlanadi.
    _applyGridDims(annex, clearInvalid) {
      const cats = annex?.categories || []
      const cells = annex?.cells || []
      this.gridColumns = cats
      this.gridGroupIds = [...new Set(cells.map((c) => Number(c.group)))].sort((a, b) => a - b)
      this.gridRankIds = [...new Set(cells.map((c) => String(c.rank)))]
      if (clearInvalid) {
        if (cats.length === 1) this.payload.tariff_grid_column = cats[0].key
        if (this.payload.group != null && !this.gridGroupIds.includes(Number(this.payload.group))) {
          this.payload.group = null
        }
        if (this.payload.rank != null && !this.gridRankIds.includes(String(this.payload.rank))) {
          this.payload.rank = null
        }
      }
    },
    // Setka tanlash → o'lchamlarini oladi, so'ng okladni hisoblaydi.
    _selectGrid(gridId) {
      this.payload.tariff_grid_id = gridId || null
      this.payload.tariff_grid_column = null
      this.gridColumns = []
      this.gridGroupIds = []
      this.gridRankIds = []
      if (!gridId) return
      $ApiService.tariffGridService._show({ id: gridId }).then((res) => {
        this._applyGridDims(res.data.data?.version?.annexes?.[0], true)
        this._recomputeAmount()
      })
    },
    // Edit: setka o'lchamlarini yuklaydi — oklad/ustun/group/rank QAYTA HISOBLANMAYDI (saqlangan qoladi).
    _loadGridColumns(gridId) {
      if (!gridId) {
        this.gridColumns = []
        this.gridGroupIds = []
        this.gridRankIds = []
        return
      }
      $ApiService.tariffGridService._show({ id: gridId }).then((res) => {
        this._applyGridDims(res.data.data?.version?.annexes?.[0], false)
      })
    },
    // Setka + guruh + razryad (+ustun) → asosiy oklad (koef×baza).
    _recomputeAmount() {
      const id = this.payload.tariff_grid_id
      const group = this.payload.group
      const rank = this.payload.rank
      if (!id || group === null || group === undefined || !rank) return
      if (this.gridColumns.length > 1 && !this.payload.tariff_grid_column) return
      this.amountLoading = true
      $ApiService.tariffGridService
        ._amount({
          id,
          params: { column: this.payload.tariff_grid_column || undefined, group, rank }
        })
        .then((res) => {
          const d = res.data.data
          this.payload.salary = String(d.amount)
          this.payload.tariff_grid_column = d.column
        })
        .catch(() => {
          // Bunday katak yo'q (guruh/razryad/ustun mos emas) — okladni tozalaymiz.
          this.payload.salary = null
        })
        .finally(() => {
          this.amountLoading = false
        })
    },

    // --- Koeffitsientlar ---
    addCoeffRow() {
      this.payload.coefficients.push({ percent: null, reason: null, valid_from: null, valid_to: null })
    },
    removeCoeffRow(idx) {
      this.payload.coefficients.splice(idx, 1)
    },
    _loadCoefficients(id) {
      return $ApiService.departmentPositionService._coefficients({ id }).then((res) => {
        const list = (res.data.data || []).map((c) => ({
          id: c.id,
          percent: c.percent,
          reason: c.reason,
          valid_from: c.valid_from,
          valid_to: c.valid_to
        }))
        this.payload.coefficients = list
        this.coeffOriginal = list.map((c) => ({ ...c }))
      })
    },
    _cleanCoefficients() {
      return (this.payload.coefficients || [])
        .filter((c) => c.percent !== null && c.percent !== '' && c.percent !== undefined)
        .map((c) => ({
          percent: Number(c.percent),
          reason: c.reason || undefined,
          valid_from: c.valid_from || undefined,
          valid_to: c.valid_to || undefined
        }))
    },
    // Edit rejimida koeffitsientlarni endpointlar orqali sinxronlaydi (add/update/delete diff).
    _syncCoefficients(id) {
      const cur = this.payload.coefficients || []
      const orig = this.coeffOriginal || []
      const curIds = new Set(cur.filter((c) => c.id).map((c) => c.id))
      const ops = []
      for (const o of orig) {
        if (!curIds.has(o.id)) {
          ops.push($ApiService.departmentPositionService._deleteCoefficient({ id, coefId: o.id }))
        }
      }
      for (const c of cur) {
        if (c.percent === null || c.percent === '' || c.percent === undefined) continue
        const body = {
          percent: Number(c.percent),
          reason: c.reason || undefined,
          valid_from: c.valid_from || undefined,
          valid_to: c.valid_to || undefined
        }
        if (!c.id) {
          ops.push($ApiService.departmentPositionService._addCoefficient({ id, data: body }))
        } else {
          const o = orig.find((x) => x.id === c.id)
          const changed =
            !o ||
            Number(o.percent) !== Number(c.percent) ||
            (o.reason || '') !== (c.reason || '') ||
            (o.valid_from || '') !== (c.valid_from || '') ||
            (o.valid_to || '') !== (c.valid_to || '')
          if (changed) {
            ops.push(
              $ApiService.departmentPositionService._updateCoefficient({ id, coefId: c.id, data: body })
            )
          }
        }
      }
      return Promise.all(ops)
    },

    _preview() {
      const params = {
        ...this.preview.params,
        department_positions: this.elementId
      }
      this.preview.loading = true
      $ApiService.workerService
        ._index({ params })
        .then((res) => {
          this.preview.list = res.data.data.data
          this.preview.total = res.data.data.total
        })
        .finally(() => {
          this.preview.loading = false
        })
    },
    // --- Oklad o'zgarish tarixi (lavozim darajasi) ---
    openSalaryHistory(id) {
      this.salaryHistory.dpId = id
      this.salaryHistory.params.page = 1
      this.salaryHistory.list = []
      this.salaryHistory.total = 0
      this.salaryHistory.visible = true
      this._salaryHistory()
    },
    _salaryHistory() {
      const id = this.salaryHistory.dpId
      if (!id) return
      this.salaryHistory.loading = true
      $ApiService.departmentPositionService
        ._salaryHistory({ id, params: { ...this.salaryHistory.params } })
        .then((res) => {
          this.salaryHistory.list = res.data.data.data
          this.salaryHistory.total = res.data.data.total
        })
        .finally(() => {
          this.salaryHistory.loading = false
        })
    },
    onSalaryHistoryPage(v) {
      this.salaryHistory.params.page = v.page
      this.salaryHistory.params.per_page = v.per_page
      this._salaryHistory()
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
          this.list = res.data.data.data.map((v) => ({
            ...v,
            colorType:
              Number(v.rate) > Number(v.worker_rate)
                ? 'success'
                : Number(v.rate) === Number(v.worker_rate)
                  ? 'default'
                  : 'error'
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
        organization_id: undefined,
        // Boshlang'ich koeffitsientlar create body'da (backend insert qiladi).
        coefficients: this._cleanCoefficients()
      }

      if (callback) {
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
      // Update body koeffitsientlarni qayta ishlamaydi — ular alohida endpointlar orqali sinxronlanadi.
      let data = {
        ...this.payload,
        organization_id: undefined,
        coefficients: undefined
      }
      $ApiService.departmentPositionService
        ._update({ data, id: this.elementId })
        .then(() => this._syncCoefficients(this.elementId))
        .then(() => {
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
    changePreviewPage({ page, per_page }) {
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
      this.gridOptions = []
      this.gridColumns = []
      this.coeffOriginal = []
    }
  }
})
