import { defineStore } from 'pinia'
import i18n from '@/i18n/index.js'
import Utils from '@/utils/Utils.js'
import { ANNEXES, GROUPS, DEFAULT_RANKS } from '@/pages/accountant/tariffGrid/annexConfig.js'

const { t } = i18n.global

// Bitta razryad qatori: rank + guruh koeffitsientlari (c0..c3).
const emptyRow = (rank) => ({ rank, c0: null, c1: null, c2: null, c3: null })
const emptyColRows = () => DEFAULT_RANKS.map((rank) => emptyRow(rank))

// Bo'sh edit holati (view/tahrir manbai) — backend annexes'dan to'ldiriladi.
const blankEditState = () => ({})

// Versiya (backend annexes) → edit holati { [annexCode]: { [categoryKey]: [rows] } }.
// Struktura backend'dan keladi (legacy config yoki yangi ustunli setka — ikkalasi ham).
const editStateFromVersion = (version) => {
  const st = {}
  for (const annex of version?.annexes ?? []) {
    st[annex.code] = {}
    const ranks = annex.ranks ?? []
    const cats = annex.categories?.length ? annex.categories : [{ key: 1, name: '' }]
    for (const c of cats) st[annex.code][c.key] = ranks.map((rank) => emptyRow(rank))
  }
  for (const annex of version?.annexes ?? []) {
    const byCat = st[annex.code]
    if (!byCat) continue
    for (const cell of annex.cells ?? []) {
      const rows = byCat[cell.category]
      if (!rows) continue
      const row = rows.find((r) => String(r.rank) === String(cell.rank))
      if (row) row[`c${cell.group}`] = cell.coefficient
    }
  }
  return st
}

// Edit holati → backend cells[] (bo'sh koeffitsientlar tashlab yuboriladi).
// st kalitlari (annex kodi, kategoriya key) backend'dan kelgan tuzilishga mos.
const buildCellsFromState = (st) => {
  const cells = []
  for (const code of Object.keys(st ?? {})) {
    for (const catKey of Object.keys(st[code] ?? {})) {
      for (const row of st[code][catKey] ?? []) {
        for (const g of GROUPS) {
          const raw = row[`c${g}`]
          if (raw === null || raw === undefined || raw === '') continue
          cells.push({
            annex: code,
            category: Number(catKey),
            group: g,
            rank: row.rank,
            coefficient: Number(raw)
          })
        }
      }
    }
  }
  return cells
}

// --- YARATISH: dinamik koeffitsient ustunlari (setka = bitta ilova) ---
// createColumns: [{ key, name, rows: [{rank, c0..c3}] }]
const newColumn = (key) => ({ key, name: '', rows: emptyColRows() })
const blankCreateColumns = () => [newColumn(1)]

// createColumns → { cells[], columns[] }. Bo'sh ustunlar tashlanadi; nomi bo'sh
// (lekin koef bor) ustun bo'lsa → missingName bayrog'i qaytadi (chaqiruvchi ogohlantiradi).
const buildCreatePayload = (createColumns) => {
  const cells = []
  const columns = []
  let missingName = false
  createColumns.forEach((col, i) => {
    const colCells = []
    for (const row of col.rows) {
      for (const g of GROUPS) {
        const raw = row[`c${g}`]
        if (raw === null || raw === undefined || raw === '') continue
        colCells.push({ annex: '1', category: col.key, group: g, rank: row.rank, coefficient: Number(raw) })
      }
    }
    if (colCells.length === 0) return // bo'sh ustun — tashlab yuboramiz
    if (!col.name || !col.name.trim()) {
      missingName = true
      return
    }
    columns.push({ key: col.key, name: col.name.trim(), sort: i })
    cells.push(...colCells)
  })
  return { cells, columns, missingName }
}

// Xavfsiz formula: faqat raqam, x, + - * / ( ) .
function compileFormula(expr) {
  const e = String(expr ?? '').trim().replace(/,/g, '.').replace(/X/g, 'x')
  if (!e || !/^[0-9x+\-*/().\s]+$/.test(e)) return null
  try {
    // eslint-disable-next-line no-new-func
    const fn = new Function('x', `"use strict"; return (${e});`)
    const tv = fn(1)
    return typeof tv === 'number' && Number.isFinite(tv) ? fn : null
  } catch {
    return null
  }
}

const emptyGridPayload = () => ({
  name: null,
  note: null,
  tariff_base_id: null,
  // base_amount / min_floor — faqat jonli oklad preview uchun (tanlangan bazadan); serverga yuborilmaydi.
  base_amount: null,
  min_floor: null,
  effective_date: null
})
const emptyVersionPayload = () => ({
  base_amount: null,
  min_floor: null,
  effective_date: null,
  note: null
})

export const useTariffGridStore = defineStore('tariffGridStore', {
  state: () => ({
    annexes: ANNEXES,
    groups: GROUPS,

    // Ro'yxat
    list: [],
    totalItems: 0,
    loading: false,
    params: { page: 1, per_page: 10, search: null },

    // Detal / ko'rish (modal)
    viewVisible: false,
    detail: null,
    detailLoading: false,
    versions: [],
    versionsLoading: false,
    viewVersion: null,
    detailEditing: false,

    // Versiya tarixi — ALOHIDA modal (jadval ro'yxat + sahifalash + yil filtri)
    historyVisible: false,
    historyView: 'list', // 'list' = versiyalar jadvali | 'matrix' = tanlangan versiya matritsasi
    historyGridName: '',
    versionsParams: { page: 1, per_page: 10, year: null },
    versionsTotal: 0,
    versionYears: [],

    // Versiya solishtirish (compare) — 2 ta versiya tanlab farqini ko'rish (salary-1c kabi).
    compareSelection: [], // tanlangan versiya id'lari (max 2)
    compareVisible: false,
    compareLoading: false,
    compareData: null,

    // Yaratish / meta tahrir
    gridVisible: false,
    gridVisibleType: true, // true=create, false=edit-meta
    gridSaveLoading: false,
    elementId: null,
    gridPayload: emptyGridPayload(),

    // Versiya (koeffitsient o'zgartirish)
    versionPayload: emptyVersionPayload(),
    versionSaveLoading: false,
    saveVersionVisible: false,
    versionFiles: [], // UIUpload modeli (asos hujjat, ixtiyoriy)

    // Matritsa holati (ilova/kategoriya bo'yicha rows) — KO'RISH va TAHRIR bir manbadan
    editState: blankEditState(),

    // YARATISH: dinamik koeffitsient ustunlari (setka = bitta ilova)
    createColumns: blankCreateColumns(),

    // «Mavjud setkadan nusxa» uchun manba setkalar ro'yxati
    copySources: [],

    // Biriktiruv (scope) modali — setka ↔ korxona/bo'lim (tree + "+qo'shish" builder)
    scopeVisible: false,
    scopeGridId: null,
    scopeGridName: '',
    scopeSaving: false,
    scopeForm: { organization_ids: [], department_ids: [] },
    scopeOrgLabels: {}, // id -> nom (korxona chiplari uchun)
    scopeDeptLabels: {} // id -> { name, org_name } (bo'lim chiplari uchun)
  }),

  getters: {
    // Amaldagi baza — endi ALOHIDA baza obyektidan keladi (backend versiyada resolve qiladi),
    // shuning uchun tahrirda ham ko'rilayotgan versiyaning base_amount'i ishlatiladi.
    currentBase(state) {
      return Number(state.viewVersion?.base_amount ?? state.detail?.version?.base_amount ?? 0)
    },
    currentFloor(state) {
      return state.viewVersion?.min_floor ?? state.detail?.version?.min_floor ?? null
    },
    currentVersionNo(state) {
      return state.viewVersion?.version ?? state.detail?.version?.version ?? null
    }
  },

  actions: {
    _index() {
      this.loading = true
      $ApiService.tariffGridService
        ._index({ params: this.params })
        .then((res) => {
          this.list = res.data.data.data
          this.totalItems = res.data.data.total
        })
        .finally(() => {
          this.loading = false
        })
    },
    _show(id) {
      this.detailLoading = true
      this.detail = null
      this.viewVersion = null
      this.detailEditing = false
      this.elementId = id
      $ApiService.tariffGridService
        ._show({ id })
        .then((res) => {
          this.detail = res.data.data
          // KO'RISH ham editState'dan chiziladi — bitta manba (view/edit bir xil ko'rinish).
          this.editState = this.detail?.version
            ? editStateFromVersion(this.detail.version)
            : blankEditState()
        })
        .finally(() => {
          this.detailLoading = false
        })
    },
    // Versiya tarixi — sahifalangan ro'yxat (alohida modal).
    _versions(id) {
      this.versionsLoading = true
      $ApiService.tariffGridService
        ._versions({
          id,
          params: {
            page: this.versionsParams.page,
            per_page: this.versionsParams.per_page,
            year: this.versionsParams.year || undefined
          }
        })
        .then((res) => {
          const d = res.data.data
          this.versions = d.data ?? []
          this.versionsTotal = d.total ?? 0
          this.versionYears = d.years ?? []
        })
        .finally(() => {
          this.versionsLoading = false
        })
    },
    onVersionsPage(v) {
      this.versionsParams.page = v.page
      this.versionsParams.per_page = v.per_page
      this._versions(this.elementId)
    },
    onVersionsYear(y) {
      this.versionsParams.year = y ?? null
      this.versionsParams.page = 1
      this._versions(this.elementId)
    },
    // Versiya matritsasini ochish (tarix modalида) — jadval ko'rinishi.
    _version(id, versionId) {
      this.versionsLoading = true
      $ApiService.tariffGridService
        ._version({ id, versionId })
        .then((res) => {
          this.viewVersion = res.data.data
          this.editState = editStateFromVersion(this.viewVersion)
          this.historyView = 'matrix'
        })
        .finally(() => {
          this.versionsLoading = false
        })
    },
    backToVersionList() {
      this.historyView = 'list'
      this.viewVersion = null
    },
    // Solishtirish uchun versiya tanlash — ko'pi bilan 2 ta (3-chisi eng eskisini siqib chiqaradi).
    _toggleCompareSelect(id) {
      const i = this.compareSelection.indexOf(id)
      if (i >= 0) {
        this.compareSelection.splice(i, 1)
      } else {
        if (this.compareSelection.length >= 2) this.compareSelection.shift()
        this.compareSelection.push(id)
      }
    },
    // Tanlangan 2 versiyani solishtirish. from = eski (kichik version), to = yangi.
    _compareVersions() {
      if (this.compareSelection.length !== 2) return
      const rows = this.versions
        .filter((v) => this.compareSelection.includes(v.id))
        .sort((a, b) => a.version - b.version)
      if (rows.length !== 2) return
      this.compareVisible = true
      this.compareLoading = true
      this.compareData = null
      $ApiService.tariffGridService
        ._compareVersions({ id: this.elementId, params: { from_id: rows[0].id, to_id: rows[1].id } })
        .then((res) => {
          this.compareData = res.data.data
        })
        .catch((e) => {
          $Toast.error(e?.response?.data?.message ?? t('content.error'))
          this.compareVisible = false
        })
        .finally(() => {
          this.compareLoading = false
        })
    },
    // Excel (.xlsx) yuklab olish — loyiha umumiy download funksiyasi (Utils.blobFileDownload).
    _excel(id) {
      $ApiService.tariffGridService
        ._excel({ id })
        .then((response) => {
          Utils.blobFileDownload(
            response.data,
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            `tarif-setka-${id}.xlsx`
          )
        })
        .catch(() => {
          $Toast.error(t('content.error'))
        })
    },
    _store() {
      if (!this.gridPayload.name || !this.gridPayload.name.trim()) {
        $Toast.warning(t('tariffGrid.form.name'))
        return
      }
      if (!this.gridPayload.tariff_base_id) {
        $Toast.warning(t('tariffGrid.form.baseSelect'))
        return
      }
      if (!this.gridPayload.effective_date) {
        $Toast.warning(t('tariffGrid.form.effectiveDate'))
        return
      }
      const { cells, columns, missingName } = buildCreatePayload(this.createColumns)
      if (missingName) {
        $Toast.warning(t('tariffGrid.form.columnNameRequired'))
        return
      }
      if (cells.length === 0) {
        $Toast.warning(t('tariffGrid.form.noCells'))
        return
      }
      this.gridSaveLoading = true
      const data = {
        name: this.gridPayload.name.trim(),
        note: this.gridPayload.note || undefined,
        tariff_base_id: Number(this.gridPayload.tariff_base_id),
        effective_date: this.gridPayload.effective_date,
        cells,
        columns
      }
      $ApiService.tariffGridService
        ._store({ data })
        .then(() => {
          this.gridVisible = false
          this._index()
        })
        .finally(() => {
          this.gridSaveLoading = false
        })
    },

    // «Mavjud setkadan nusxa» — manba setkalar ro'yxatini yuklaydi.
    _loadCopySources() {
      $ApiService.tariffGridService
        ._index({ params: { page: 1, per_page: 200 } })
        .then((res) => {
          this.copySources = res.data.data.data
        })
    },
    // Mavjud setkadan koeffitsientlarni create formaga ko'chiradi (createColumns quriladi).
    copyFromGrid(gridId) {
      return $ApiService.tariffGridService._show({ id: gridId }).then((res) => {
        const annex = res.data.data?.version?.annexes?.[0]
        if (!annex) return
        const cats = annex.categories?.length ? annex.categories : [{ key: 1, name: '' }]
        this.createColumns = cats.map((cat) => ({
          key: cat.key,
          name: cat.name || `${t('tariffGrid.form.columnName')}`,
          rows: DEFAULT_RANKS.map((rank) => {
            const row = { rank, c0: null, c1: null, c2: null, c3: null }
            for (const cell of annex.cells ?? []) {
              if (String(cell.rank) === String(rank) && cell.category === cat.key) {
                row[`c${cell.group}`] = cell.coefficient
              }
            }
            return row
          })
        }))
        $Toast.success(t('tariffGrid.form.copyFrom'))
      })
    },

    // Koeffitsient ustuni qo'shish / o'chirish (create formasi).
    addColumn() {
      const nextKey = this.createColumns.reduce((m, c) => Math.max(m, c.key), 0) + 1
      this.createColumns.push(newColumn(nextKey))
    },
    removeColumn(idx) {
      if (this.createColumns.length <= 1) return
      this.createColumns.splice(idx, 1)
    },
    _update() {
      this.gridSaveLoading = true
      const data = {
        name: this.gridPayload.name,
        note: this.gridPayload.note,
        active: this.gridPayload.active
      }
      $ApiService.tariffGridService
        ._update({ id: this.elementId, data })
        .then(() => {
          this.gridVisible = false
          this._index()
        })
        .finally(() => {
          this.gridSaveLoading = false
        })
    },
    _delete(id) {
      $ApiService.tariffGridService
        ._delete({ id })
        .then((res) => {
          $Toast.success(res?.data?.message ?? t('content.delete'))
          this._index()
        })
        .catch((e) => {
          $Toast.error(e?.response?.data?.message ?? t('content.error'))
        })
    },
    // Saqlash formini ochish (izoh / sana / asos-fayl).
    openSaveVersion() {
      this.saveVersionVisible = true
    },
    // Versiyani tasdiqlash (pending → faol).
    _confirmVersion(versionId) {
      this.versionsLoading = true
      $ApiService.tariffGridService
        ._confirmVersion({ id: this.elementId, versionId })
        .then(() => {
          $Toast.success(t('tariffGrid.status.confirmed'))
          this._versions(this.elementId)
        })
        .finally(() => {
          this.versionsLoading = false
        })
    },
    async _storeVersion() {
      if (!this.versionPayload.effective_date) {
        $Toast.warning(t('tariffGrid.form.effectiveDate'))
        return
      }
      this.versionSaveLoading = true
      try {
        let document
        const file = this.versionFiles?.[0]?.file
        if (file) document = await Utils.fileToBase64(file)
        // Baza (base_amount/min_floor) endi alohida obyekt — bu yerda yuborilmaydi.
        const data = {
          effective_date: this.versionPayload.effective_date,
          note: this.versionPayload.note || undefined,
          document,
          cells: buildCellsFromState(this.editState)
        }
        await $ApiService.tariffGridService._storeVersion({ id: this.elementId, data })
        this.saveVersionVisible = false
        this.detailEditing = false
        this.versionFiles = []
        // Yangi versiya "kutilmoqda" — «Tarix» modalда tasdiqlanadi.
        $Toast.info(t('tariffGrid.pendingHint'))
        this._show(this.elementId)
      } finally {
        this.versionSaveLoading = false
      }
    },

    // Ko'rish modalini ochish (faqat joriy versiya — tarixsiz).
    openView(id) {
      this.viewVisible = true
      this._show(id)
    },
    // Tarix modalini ochish (ALOHIDA modal — sahifalangan versiyalar jadvali).
    openHistory(id, name = '') {
      this.elementId = id
      this.historyGridName = name
      this.historyView = 'list'
      this.viewVersion = null
      this.versionsParams = { page: 1, per_page: 10, year: null }
      this.compareSelection = []
      this.compareData = null
      this.historyVisible = true
      this._versions(id)
    },

    // --- Biriktiruv (scope): setka ↔ korxona/bo'lim (tree + "+qo'shish") ---
    openScope(id, name = '') {
      this.scopeGridId = id
      this.scopeGridName = name
      this.scopeForm = { organization_ids: [], department_ids: [] }
      this.scopeOrgLabels = {}
      this.scopeDeptLabels = {}
      this.scopeVisible = true
      $ApiService.tariffGridService._scope({ id }).then((res) => {
        const d = res.data.data || {}
        this.scopeForm.organization_ids = (d.organizations || []).map((o) => o.id)
        this.scopeForm.department_ids = (d.departments || []).map((o) => o.id)
        for (const o of d.organizations || []) this.scopeOrgLabels[o.id] = o.name
        for (const dep of d.departments || [])
          this.scopeDeptLabels[dep.id] = { name: dep.name, org_name: dep.org_name || null }
      })
    },
    // Butun korxona birikuvini ro'yxatga qo'shadi (dublsiz).
    addScopeOrg(org) {
      if (!org?.id) return
      if (!this.scopeForm.organization_ids.includes(org.id)) {
        this.scopeForm.organization_ids.push(org.id)
        this.scopeOrgLabels[org.id] = org.name
      }
    },
    // Bo'lim birikuvlarini ro'yxatga qo'shadi (org nomi konteksti bilan, dublsiz).
    addScopeDepts(depts, orgName) {
      for (const d of depts || []) {
        if (!d?.id) continue
        if (!this.scopeForm.department_ids.includes(d.id)) {
          this.scopeForm.department_ids.push(d.id)
          this.scopeDeptLabels[d.id] = {
            name: d.name,
            org_name: orgName || d.organization?.name || null
          }
        }
      }
    },
    removeScopeOrg(id) {
      this.scopeForm.organization_ids = this.scopeForm.organization_ids.filter((x) => x !== id)
      delete this.scopeOrgLabels[id]
    },
    removeScopeDept(id) {
      this.scopeForm.department_ids = this.scopeForm.department_ids.filter((x) => x !== id)
      delete this.scopeDeptLabels[id]
    },
    _saveScope() {
      this.scopeSaving = true
      $ApiService.tariffGridService
        ._setScope({
          id: this.scopeGridId,
          data: {
            organization_ids: this.scopeForm.organization_ids,
            department_ids: this.scopeForm.department_ids
          }
        })
        .then((res) => {
          $Toast.success(res?.data?.message ?? t('content.success'))
          this.scopeVisible = false
        })
        .catch((e) => {
          $Toast.error(e?.response?.data?.message ?? t('content.error'))
        })
        .finally(() => {
          this.scopeSaving = false
        })
    },

    // --- Form ochish/yopish ---
    startCreate() {
      this.gridVisibleType = true
      this.elementId = null
      this.gridPayload = emptyGridPayload()
      this.editState = blankEditState()
      this.createColumns = blankCreateColumns()
      this.gridVisible = true
    },
    startEditMeta(row) {
      this.gridVisibleType = false
      this.elementId = row.id
      this.gridPayload = { name: row.name, note: row.note, active: row.active }
      this.gridVisible = true
    },
    startCoefEdit() {
      // Tahrir doim FAOL versiyadan boshlanadi (tarixni ko'rish rejimidan chiqamiz).
      // Baza (base_amount/min_floor) tahrirlanmaydi — u alohida obyekt.
      this.viewVersion = null
      const v = this.detail?.version
      this.versionPayload = {
        base_amount: null,
        min_floor: null,
        effective_date: null,
        note: null
      }
      this.editState = v ? editStateFromVersion(v) : blankEditState()
      this.detailEditing = true
    },
    cancelCoefEdit() {
      // Saqlanmagan o'zgarishlarni bekor qilib, faol versiya koeffitsientlarini tiklaymiz.
      this.detailEditing = false
      this.saveVersionVisible = false
      this.versionFiles = []
      this.editState = this.detail?.version
        ? editStateFromVersion(this.detail.version)
        : blankEditState()
    },

    // Tahrirda yangi razryad (satr) qo'shadi — barcha kategoriyaga bo'sh satr, DEFAULT_RANKS tartibida.
    addRankToEdit(annexCode, rank) {
      const byCat = this.editState[annexCode]
      const r = String(rank ?? '').trim()
      if (!byCat || !r) return
      for (const catKey of Object.keys(byCat)) {
        const rows = byCat[catKey]
        if (!rows.some((x) => String(x.rank) === r)) {
          rows.push({ rank: r, c0: null, c1: null, c2: null, c3: null })
        }
      }
      const idx = (x) => {
        const i = DEFAULT_RANKS.indexOf(String(x))
        return i < 0 ? 999 : i
      }
      for (const catKey of Object.keys(byCat)) {
        byCat[catKey].sort((a, b) => idx(a.rank) - idx(b.rank) || String(a.rank).localeCompare(String(b.rank)))
      }
    },

    // Formula — berilgan rows massiviga qo'llaydi.
    applyFormulaToRows(rows, { groups = [], ranks = [], expr = '' }) {
      const fn = compileFormula(expr)
      if (!fn) {
        $Toast.warning(t('tariffGrid.formula.invalid'))
        return
      }
      const gset = groups.length ? new Set(groups.map(Number)) : new Set(GROUPS)
      const rset = ranks.length ? new Set(ranks.map(String)) : null
      let count = 0
      for (const row of rows) {
        if (rset && !rset.has(String(row.rank))) continue
        for (const g of GROUPS) {
          if (!gset.has(g)) continue
          const cur = row[`c${g}`]
          const x = cur === null || cur === undefined || cur === '' ? 0 : Number(cur)
          let val = fn(x)
          if (!Number.isFinite(val)) continue
          val = Math.round(val * 100) / 100
          row[`c${g}`] = val < 0 ? 0 : val
          count++
        }
      }
      $Toast.success(t('tariffGrid.formula.applied') + ': ' + count)
    }
  }
})
