import { defineStore } from 'pinia'
import i18n from '@/i18n/index.js'
const { t } = i18n.global

const toTreeNode = (v, lang) => ({
  name: v?.[lang] || v.name,
  fullName: v?.[`full_${lang}`] || v?.full_name,
  uz: v.name,
  ru: v.name_ru,
  en: v.name_en,
  id: v.id,
  children: [],
  isHaveChild: Boolean(v?.descendants),
  closedAt: v.closed_at ?? null
})

const emptyPanel = () => ({
  open: false,
  // edit — tanlangan korxona formasi (asosiy), create — yangi korxona, history — tarix,
  // close/reopen — asos bilan yopish/ochish, move — drag & drop tasdig'i
  mode: 'edit',
  id: null,
  name: null,
  parentId: null,
  parentName: null,
  closedAt: null,
  data: null,
  loading: false
})

const emptyMove = () => ({
  loading: false,
  id: null,
  name: null,
  fromParentId: null,
  fromParentName: null,
  parentId: null,
  parentName: null,
  // Yangi ota ichidagi 0 dan boshlangan o'rin; null — oxiriga.
  position: null,
  comment: null
})

export const useOrganizationStore = defineStore('organizationStore', {
  state: () => ({
    list: [],
    loading: false,
    saveLoading: false,
    totalItems: 0,
    payload: {
      parent_id: null,
      city_id: null,
      level: null,
      name: null,
      name_ru: null,
      name_en: null,
      full_name: null,
      full_name_ru: null,
      full_name_en: null,
      lat: null,
      long: null,
      group: false,
      code: null,
      ones_org_code: null,
      inn: null,
      gateway_id: null
    },
    headerLang: 'uz',
    // Daraxt sahifalanmaydi — ildiz korxonalar bir so'rovda to'liq keladi.
    params: {
      page: 1,
      per_page: 1000,
      search: null
    },
    // Ochilgan tugunlar kaliti (`0-2-5` — indeks yo'li), UITree bilan bir xil format.
    expandedKeys: [],
    // Daraxtda belgilanadigan matn — natija kelgandagi qidiruv (yozilayotgani emas).
    searchHighlight: '',
    levelLoading: false,
    levelList: [],
    // Bolalari yuklanayotgan tugun kaliti (UITree spinneri uchun).
    indexPath: null,
    parentElement: null,
    originalParentId: null,
    // Tahrirlashdagi boshlang'ich qiymatlar — o'zgargan maydonlarni topish va saqlash tasdig'i uchun.
    originalPayload: null,
    // O'ng panel: tanlangan korxona va undagi amallar (avval drawer/modal edi).
    panel: emptyPanel(),
    basis: { comment: null, file: null, fileName: null, loading: false },
    history: { id: null, list: [], loading: false },
    // Drag & drop natijasi — tasdiqlanmaguncha daraxt o'zgarmaydi.
    move: emptyMove()
  }),
  getters: {
    isCreate: (state) => state.panel.mode === 'create',
    searchQuery: (state) => state.params.search?.trim() || ''
  },
  actions: {
    _index() {
      if (this.searchQuery) return this._search()
      this.loading = true
      this.expandedKeys = []
      $ApiService.organizationService
        ._index({ params: { ...this.params, search: undefined } })
        .then((res) => {
          this.list = res.data.data.data.map((v) => toTreeNode(v, this.headerLang))
          this.totalItems = res.data.data.total
          this.searchHighlight = ''
        })
        .finally(() => {
          this.loading = false
        })
    },
    // Qidiruv: `/organizations` faqat ildiz korxonalarni qaytaradi, shuning uchun
    // ichkaridagilar topilmasdi. `/structure?search=` butun daraxtdan qidiradi va
    // topilganlarni ota-bobolari bilan ichma-ich qaytaradi — hammasi ochiq ko'rsatiladi.
    _search() {
      const search = this.searchQuery
      const lang = this.headerLang
      this.loading = true
      let matches = 0
      const needle = search.toLocaleLowerCase()
      const map = (v) => {
        const node = toTreeNode(v, lang)
        node.children = (v.children || []).map(map)
        node.isHaveChild = node.children.length > 0
        if ([v.name, v.name_ru, v.name_en, v.full_name].some((s) => s?.toLocaleLowerCase().includes(needle)))
          matches++
        return node
      }
      const keys = []
      const collectKeys = (nodes, prefix) =>
        nodes.forEach((n, i) => {
          if (!n.isHaveChild) return
          const key = `${prefix}-${i}`
          keys.push(key)
          collectKeys(n.children, key)
        })
      return $ApiService.componentService
        ._structure({ params: { page: 1, per_page: 1000, search } })
        .then((res) => {
          // Javob kelguncha qidiruv matni o'zgargan bo'lsa — eskisini chizmaymiz.
          if (search !== this.searchQuery) return
          const raw = res.data.data
          const list = (Array.isArray(raw) ? raw : raw?.data || []).map(map)
          collectKeys(list, '0')
          this.list = list
          this.expandedKeys = keys
          this.totalItems = matches
          this.searchHighlight = search
        })
        .finally(() => {
          if (search === this.searchQuery) this.loading = false
        })
    },
    // Saqlash/yopishdan keyin ro'yxatni yangilaydi, lekin ochilgan tugunlarni yopib
    // yubormaydi: ochiq tugunlar id bo'yicha eslab qolinadi va bolalari qayta yuklanadi
    // (indeks bo'yicha emas — korxona ko'chirilsa indekslar siljiydi).
    // `extraOpenIds` — qo'shimcha ochiladigan tugunlar (masalan, ko'chirilgan joy).
    async _refresh(extraOpenIds = []) {
      if (this.searchQuery) return this._search()
      const openIds = new Set(extraOpenIds.filter((id) => id != null))
      const collect = (nodes, prefix) =>
        nodes.forEach((n, i) => {
          const key = `${prefix}-${i}`
          if (!this.expandedKeys.includes(key)) return
          openIds.add(n.id)
          collect(n.children || [], key)
        })
      collect(this.list, '0')

      const lang = this.headerLang
      const keys = []
      const expand = (nodes, prefix) =>
        Promise.all(
          nodes.map((n, i) => {
            if (!n.isHaveChild || !openIds.has(n.id)) return null
            const key = `${prefix}-${i}`
            return $ApiService.organizationService
              ._show({ id: n.id })
              .then((res) => {
                n.children = res.data.data.children.map((v) => toTreeNode(v, lang))
                keys.push(key)
                return expand(n.children, key)
              })
              .catch(() => null)
          })
        )

      this.loading = true
      try {
        const res = await $ApiService.organizationService._index({ params: this.params })
        const roots = res.data.data.data.map((v) => toTreeNode(v, lang))
        await expand(roots, '0')
        this.list = roots
        this.totalItems = res.data.data.total
        this.expandedKeys = keys
      } finally {
        this.loading = false
      }
    },
    _level() {
      this.levelLoading = true
      $ApiService.organizationService
        ._level()
        .then((res) => {
          this.levelList = res.data.data
        })
        .finally(() => {
          this.levelLoading = false
        })
    },
    // Daraxtda tugun ochilganda bolalarini yuklaydi.
    _loadChildren({ id, index }) {
      this.indexPath = index
      $ApiService.organizationService
        ._show({ id })
        .then((res) => {
          const node = res.data.data.children.map((v) => toTreeNode(v, this.headerLang))
          this.nestedElement(this.list, index.slice(2).split('-'), node)
        })
        .finally(() => {
          this.indexPath = null
        })
    },

    /* ---------------------------- O'ng panel ----------------------------
     * Korxona tanlanganda panel darhol tahrirlash formasi bilan ochiladi.
     * Tarix, yopish/qayta ochish va ko'chirish tasdig'i — alohida rejimlar,
     * ulardan "ortga" yana tahrirlashga qaytadi.
     */

    select(item) {
      if (this.panel.open && this.panel.id === item.id && this.panel.mode === 'edit') return
      this.resetForm()
      this.parentElement = null
      this.panel = {
        ...emptyPanel(),
        open: true,
        id: item.id,
        name: item.name,
        parentId: item.parentId ?? null,
        parentName: item.parentName ?? null,
        closedAt: item.closedAt ?? null
      }
      this.history = { id: null, list: [], loading: false }
      this._detail()
    },
    closePanel() {
      this.panel = emptyPanel()
    },
    _detail() {
      const id = this.panel.id
      if (!id) return
      this.panel.loading = true
      $ApiService.organizationService
        ._show({ id })
        .then((res) => {
          if (this.panel.id !== id) return
          const { organization } = res.data.data
          this.panel.data = organization
          this.panel.name = organization.name ?? this.panel.name
          this.panel.closedAt = organization.closed_at ?? null
          if (this.panel.mode !== 'create') this.fillForm(organization)
        })
        .finally(() => {
          if (this.panel.id === id) this.panel.loading = false
        })
    },
    fillForm(org) {
      this.resetForm()
      this.payload.name = org.name
      this.payload.name_ru = org.name_ru
      this.payload.name_en = org.name_en
      this.payload.full_name = org.full_name
      this.payload.full_name_ru = org.full_name_ru
      this.payload.full_name_en = org.full_name_en
      this.payload.level = org.level
      this.payload.parent_id = org.parent_id
      this.originalParentId = org.parent_id ?? null
      this.payload.city_id = org?.city?.id || null
      this.payload.group = Boolean(org.group)
      this.payload.code = org.code
      this.payload.ones_org_code = org.ones_org_code ?? null
      this.payload.inn = org.inn ?? null
      this.payload.gateway_id = org.gateway_id ?? null
      this.parentElement = null
      this.originalPayload = { ...this.payload }
    },
    // Sarlavhadagi "Qo'shish": korxona tanlangan bo'lsa, u ota sifatida oldindan
    // tanlab qo'yiladi (formada o'zgartirsa bo'ladi).
    startCreate() {
      const parentId = this.panel.open && this.panel.mode !== 'create' ? this.panel.id : null
      this.resetForm()
      this.parentElement = null
      this.payload.parent_id = parentId
      this.panel = { ...emptyPanel(), open: true, mode: 'create' }
    },
    startHistory() {
      this.panel.mode = 'history'
      if (this.history.id !== this.panel.id) this._history()
    },
    startBasis(mode) {
      this.basis = { comment: null, file: null, fileName: null, loading: false }
      this.panel.mode = mode
    },
    // Tarix/yopish/ko'chirishdan — tahrirlashga; tahrirlash yoki yaratishdan — panel yopiladi.
    backToView() {
      if (this.panel.id && this.panel.mode !== 'edit') this.panel.mode = 'edit'
      else this.closePanel()
    },
    _create() {
      this.saveLoading = true
      const data = { ...this.payload, group: Number(this.payload.group) }
      $ApiService.organizationService
        ._create({ data })
        .then(() => {
          this.closePanel()
          this._refresh([data.parent_id])
        })
        .finally(() => {
          this.saveLoading = false
        })
    },
    _update() {
      this.saveLoading = true
      const data = { ...this.payload, group: Number(this.payload.group) }
      $ApiService.organizationService
        ._update({ data, id: this.panel.id })
        .then(() => {
          this._detail()
          if (this.history.id) this._history()
          this._refresh([data.parent_id])
        })
        .finally(() => {
          this.saveLoading = false
        })
    },
    // Yopish / qayta ochish — asos (izoh yoki fayl) bilan.
    _basisSubmit() {
      const mode = this.panel.mode
      const { comment, file, fileName } = this.basis
      const data = {
        basis_comment: comment || undefined,
        basis_file: file || undefined,
        basis_file_name: fileName || undefined
      }
      this.basis.loading = true
      const send =
        mode === 'reopen'
          ? $ApiService.organizationService._reopen
          : $ApiService.organizationService._close
      send({ id: this.panel.id, data })
        .then(() => {
          this.panel.mode = 'edit'
          this._detail()
          if (this.history.id) this._history()
          this._refresh()
        })
        .finally(() => {
          this.basis.loading = false
        })
    },
    _history() {
      const id = this.panel.id
      if (!id) return
      this.history = { id, list: [], loading: true }
      $ApiService.organizationService
        ._events({ id })
        .then((res) => {
          if (this.history.id === id) this.history.list = res.data.data
        })
        .finally(() => {
          if (this.history.id === id) this.history.loading = false
        })
    },

    /* --------------------------- Drag & drop --------------------------- */

    // Tasdiq modal emas, o'ng panelda: sudralgan korxona tanlanadi va panel `move` rejimiga o'tadi.
    openMove(v) {
      this.move = { ...emptyMove(), ...v }
      this.select({ id: v.id, name: v.name, parentId: v.fromParentId, parentName: v.fromParentName })
      this.panel.mode = 'move'
    },
    _move() {
      const { id, parentId, position, comment, fromParentId } = this.move
      this.move.loading = true
      $ApiService.organizationService
        ._move({
          id,
          data: {
            parent_id: parentId,
            position,
            basis_comment: parentId !== fromParentId ? comment || undefined : undefined
          }
        })
        .then(() => {
          if (this.panel.id === id) {
            this.panel.mode = 'edit'
            this.panel.parentId = parentId
            this.panel.parentName = this.move.parentName
            this._detail()
            if (this.history.id) this._history()
          }
          this._refresh([parentId])
        })
        .finally(() => {
          this.move.loading = false
        })
    },

    resetForm() {
      this.payload.name = null
      this.payload.name_ru = null
      this.payload.name_en = null
      this.payload.parent_id = null
      this.payload.level = null
      this.payload.full_name = null
      this.payload.full_name_ru = null
      this.payload.full_name_en = null
      this.payload.lat = null
      this.payload.long = null
      this.payload.city_id = null
      this.payload.code = null
      this.payload.ones_org_code = null
      this.payload.inn = null
      this.payload.gateway_id = null
      this.payload.group = null
      this.payload.basis_comment = null
      this.payload.basis_file = null
      this.payload.basis_file_name = null
      this.originalParentId = null
      this.originalPayload = null
    },
    nestedElement(node, indexPath, newNode) {
      let currentNode = node
      for (const index of indexPath) {
        const childIndex = parseInt(index, 10)
        if (Array.isArray(currentNode)) {
          currentNode = currentNode[childIndex]
        } else {
          currentNode = currentNode.children[childIndex]
        }
      }
      currentNode.children = newNode
      return currentNode
    }
  }
})
