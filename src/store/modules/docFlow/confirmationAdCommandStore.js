import { defineStore } from 'pinia'
import i18n from '@/i18n/index.js'
const { t } = i18n.global
export const useConfirmationAdContractStore = defineStore('confirmationAdContractStore', {
  state: () => ({
    list: [],
    loading: false,
    saveLoading: false,
    deleteLoading: false,
    visible: false,
    visibleType: true,
    elementId: null,
    totalItems: 0,
    // API `document` ichida tur va tashkilotni faqat id bilan qaytaradi —
    // nomlar enum/tuzilma ro'yxatlaridan id bo'yicha topiladi (bir marta yuklanadi).
    typeNames: {},
    organizationNames: {},
    // Shartnoma xodimi ham `document` da yo'q (faqat `worker_id`) — u asosiy
    // shartnomadan (`contract_id`) olinadi: { [contract_id]: { worker, position } }.
    contractWorkers: {},
    payload: {
      parent_id: null,
      level: null,
      name: null
    },
    params: {
      page: 1,
      per_page: 15,
      search: null
    }
  }),
  actions: {
    _index() {
      this._lookups()
      this.loading = true
      $ApiService.documentService
        ._confirmationAdContract({ params: this.params })
        .then((res) => {
          this.list = res.data.data.data
          this.totalItems = res.data.data.total
          this._contractWorkers()
        })
        .finally(() => {
          this.loading = false
        })
    },
    _lookups() {
      if (Object.keys(this.typeNames).length === 0) {
        // Enum shartnoma turiga qarab qisqartirib beradi: 1 (mehnat) va 2 (FXSH)
        // birgalikda barcha qo'shimcha kelishuv turlarini qamraydi.
        Promise.all(
          [1, 2].map((contract_type) =>
            $ApiService.componentService._contractAddition({ params: { contract_type } })
          )
        ).then((responses) => {
          const names = {}
          responses.forEach((res) => res.data.data?.forEach((x) => (names[x.id] = x.name)))
          this.typeNames = names
        })
      }
      if (Object.keys(this.organizationNames).length === 0) {
        $ApiService.componentService._allStructure().then((res) => {
          const names = {}
          const walk = (list) =>
            list?.forEach((x) => {
              names[x.id] = x.name
              walk(x.children)
            })
          walk(res.data.data)
          this.organizationNames = names
        })
      }
    },
    _contractWorkers() {
      const ids = new Set(
        this.list
          .filter((row) => row.document && !row.document.worker)
          .map((row) => row.document.contract_id)
          .filter((id) => id && !(id in this.contractWorkers))
      )
      ids.forEach((id) => {
        // Qayta so'ralmasligi uchun javob kelguncha ham joy band qilinadi.
        this.contractWorkers[id] = null
        $ApiService.contractService
          ._show({ id })
          .then((res) => {
            const contract = res.data.data
            this.contractWorkers[id] = {
              worker: contract?.worker,
              position: contract?.contract_position?.position?.name
            }
          })
          .catch(() => {
            delete this.contractWorkers[id]
          })
      })
    },
    _level() {
      this.levelLoading = true
      $ApiService.departmentService
        ._level()
        .then((res) => {
          this.levelList = res.data.data
        })
        .finally(() => {
          this.levelLoading = false
        })
    },
    _create() {
      this.saveLoading = true
      let data = { ...this.payload }
      $ApiService.departmentService
        ._create({ data })
        .then((res) => {
          this.visible = false
          this.updateList()
        })
        .finally(() => {
          this.saveLoading = false
        })
    },
    _update() {
      this.saveLoading = true
      let data = { ...this.payload }
      $ApiService.departmentService
        ._update({ data, id: this.elementId })
        .then((res) => {
          this.visible = false
          this.updateList()
        })
        .finally(() => {
          this.saveLoading = false
        })
    },
    _delete() {
      let deep = this.activeDeep
      this.deleteLoading = true

      this.tabList = this.tabList.filter((x, idx) => idx < deep)
      this.tabDataList = this.tabDataList.filter((x, idx) => idx < deep)

      $ApiService.departmentService
        ._delete({ id: this.elementId })
        .then((res) => {
          this.updateList()
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
      this.payload.name = null
      this.payload.parent_id = null
      this.payload.level = null
    },
    goDeep(v) {
      this.id = v.id
      const currentTab = v.deep
      $ApiService.departmentService
        ._show({ id: v.id })
        .then((res) => {
          this.tabList = this.tabList.filter((x, idx) => idx < currentTab)
          this.tabDataList = this.tabDataList.filter((x, idx) => idx < currentTab)
          this.tabList.push({
            name: res.data.data.department.name,
            key: currentTab + 1,
            parentId: res.data.data.department.id
          })
          this.tabDataList.push(res.data.data.children)
          this.activeTab = currentTab + 1
        })
        .finally(() => {
          this.id = null
        })
    },
    closeTab(deep) {
      if (deep !== 1) {
        this.tabList = this.tabList.filter((a, idx) => idx !== Number(deep) - 1)
        this.tabDataList = this.tabDataList.filter((v, idx) => idx !== Number(deep) - 1)
        this.activeTab = Number(deep) - 1
      }
    },
    updateList() {
      let deep = this.activeDeep
      if (deep !== 1) {
        $ApiService.departmentService._show({ id: this.activeParentId }).then((res) => {
          if (res.data.data.children.length === 0 && deep !== 2) {
            this.activeTab = this.activeTab - 1
            this.tabDataList.pop()
            this.tabList.pop()

            let parentId = this.tabList[this.tabList.length - 1].parentId
            $ApiService.departmentService._show({ id: parentId }).then((res) => {
              this.tabDataList[this.tabDataList.length - 1] = res.data.data.children
            })
          } else if (res.data.data.children.length === 0 && deep === 2) {
            this.activeTab = this.activeTab - 1
            this.tabDataList.pop()
            this.tabList.pop()
            this._index()
          } else {
            this.tabDataList[deep - 1] = res.data.data.children
          }
        })
        this.tabList = this.tabList.filter((x, idx) => idx < deep)
        this.tabDataList = this.tabDataList.filter((x, idx) => idx < deep)
      } else {
        this._index()
      }
    }
  }
})
