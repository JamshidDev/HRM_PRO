<script setup>
  // Bo'lim tanlash — yagona daraxt select (formalar va filtrlar). Korxona bo'yicha o'zi yuklaydi, v-model — id(lar).
  import TreeOrg from '@/components/tree/TreeOrg.vue'
  import TreeSelectPanel from '@/components/tree/TreeSelectPanel.vue'
  import TreeSelectTrigger from '@/components/tree/TreeSelectTrigger.vue'
  import { useDebounceFn } from '@vueuse/core'
  import { useTreePopoverKeyboard } from '@/composables/useTreePopoverKeyboard.js'
  import { useTreePopoverWidth } from '@/composables/useTreePopoverWidth.js'

  const props = defineProps({
    // Korxona id yoki id'lar massivi (ko'p korxonali filtrlarda); bo'sh bo'lsa select o'chiq.
    organization: { type: [Number, String, Array], default: null },
    multiple: { type: Boolean, default: false },
    placeholder: { type: String, default: null },
    clearable: { type: Boolean, default: true },
    disabled: { type: Boolean, default: false },
    placement: { type: String, default: 'bottom-start' },
    closeOnSelect: { type: Boolean, default: null },
    // own=1 — HRAsistent faqat o'z bo'limlarini ko'radi (backend `own`).
    own: { type: Boolean, default: false },
    // Manba: tree — hr/departments-tree; all — get-departments-tree (kesimsiz);
    // schedule — turniket doirasi; timesheet — tabelchiga biriktirilganlar.
    source: { type: String, default: 'tree' },
    // true — v-model [{id, name}] massivi (eski formalar bilan mos), aks holda id(lar).
    returnObject: { type: Boolean, default: false },
    // Korxona almashganda tanlovni o'zi tozalasin (filtrlar uchun); formalar odatda o'zi tozalaydi.
    clearOnOrgChange: { type: Boolean, default: false },
    // Daraxtdan chiqariladigan bo'lim (o'zi va ichki bo'limlari) — masalan, «ota bo'lim» tanlashda.
    excludeId: { type: [Number, String], default: null }
  })

  // v-model: returnObject → [{id,name}]; multiple → id[]; aks holda id | null.
  const model = defineModel({ type: [Number, String, Array], default: null })
  const emits = defineEmits(['change'])

  const tree = ref([])
  const loading = ref(false)
  const search = ref(null)
  const expanded = ref([])
  // Tanlangan id → nom (qidiruv daraxtni toraytirsa ham nom yo'qolmasin).
  const names = ref(new Map())
  let reqId = 0

  const orgIds = computed(() => {
    const raw = Array.isArray(props.organization) ? props.organization : [props.organization]
    return raw
      .map((v) => (typeof v === 'object' && v ? v.id : v))
      .map(Number)
      .filter((n) => Number.isInteger(n) && n > 0)
  })

  const selectedIds = computed(() => {
    const v = model.value
    if (props.returnObject) {
      const list = Array.isArray(v) ? v : []
      list.forEach((o) => o?.name && names.value.set(Number(o.id), o.name))
      return list.map((o) => Number(o?.id)).filter((n) => Number.isInteger(n))
    }
    if (props.multiple) return (Array.isArray(v) ? v : []).map(Number)
    return v == null || v === '' ? [] : [Number(v)]
  })
  const selectedNodes = computed(() =>
    selectedIds.value.map((id) => ({ id, name: names.value.get(id) ?? `#${id}` }))
  )

  const remember = (nodes) => {
    const walk = (list) => {
      for (const n of list || []) {
        names.value.set(Number(n.id), n.name)
        walk(n.children)
      }
    }
    walk(nodes)
  }

  const parentIds = (nodes) => {
    const ids = []
    const walk = (list) => {
      for (const n of list || []) {
        if (n.children?.length) {
          ids.push(n.id)
          walk(n.children)
        }
      }
    }
    walk(nodes)
    return ids
  }

  // Yassi ro'yxat (parent_id bilan) → daraxt; ota ro'yxatda bo'lmasa — ildiz.
  const nest = (flat) => {
    const byId = new Map(flat.map((d) => [Number(d.id), { ...d, children: [] }]))
    const roots = []
    for (const d of byId.values()) {
      const parent = d.parent_id != null ? byId.get(Number(d.parent_id)) : null
      if (parent) parent.children.push(d)
      else roots.push(d)
    }
    return roots
  }

  // Qidiruv yassi manbalarda mijoz tomonida: mos bo'lim va uning ajdodlari qoladi.
  const filterTree = (nodes, term) => {
    const t = term.toLowerCase()
    return nodes
      .map((n) => {
        const kids = filterTree(n.children || [], term)
        return String(n.name || '').toLowerCase().includes(t) || kids.length
          ? { ...n, children: kids.length ? kids : n.children }
          : null
      })
      .filter(Boolean)
  }

  const withoutExcluded = (nodes) => {
    if (props.excludeId == null) return nodes
    const ex = Number(props.excludeId)
    return (nodes || [])
      .filter((n) => Number(n.id) !== ex)
      .map((n) => ({ ...n, children: withoutExcluded(n.children) }))
  }

  const fetchTree = async () => {
    const orgs = orgIds.value.join(',')
    if (props.source === 'all') {
      const res = await $ApiService.componentService._allDepartmentTree({
        params: { organization_id: orgIds.value[0], organizations: orgs }
      })
      return res.data.data || []
    }
    if (props.source === 'schedule') {
      const res = await $ApiService.workerScheduleService._department({
        params: { page: 1, per_page: 1000, organizations: orgs }
      })
      return nest(res.data.data?.data || [])
    }
    if (props.source === 'timesheet') {
      const res = await $ApiService.timesheetService._index_departments()
      // Ota bo'limlar daraxt uchun — guruh (tanlanmaydi), tanlov faqat biriktirilganlarda.
      const ancestors = (res.data.data?.department_ancestors || []).map((d) => ({ ...d, group: true }))
      return nest([...ancestors, ...(res.data.data?.departments || [])])
    }
    const res = await $ApiService.componentService._departmentTree({
      params: { organizations: orgs, search: search.value || undefined, own: props.own ? 1 : undefined }
    })
    return res.data.data || []
  }

  // Tabelchi manbasi korxonaga bog'liq emas — o'z bo'limlari.
  const needsOrg = computed(() => props.source !== 'timesheet')
  const serverSearch = computed(() => props.source === 'tree')
  let fullTree = []

  const load = async () => {
    if (needsOrg.value && !orgIds.value.length) {
      tree.value = []
      return
    }
    const id = ++reqId
    loading.value = true
    try {
      const data = await fetchTree()
      if (id !== reqId) return
      fullTree = withoutExcluded(data)
      tree.value = !serverSearch.value && search.value ? filterTree(fullTree, search.value) : fullTree
      remember(fullTree)
      // Qidiruvda va tabelchi manbasida (ota guruhlar) daraxt ochiq ko'rinsin.
      expanded.value = search.value || props.source === 'timesheet' ? parentIds(tree.value) : []
    } finally {
      if (id === reqId) loading.value = false
    }
  }

  // Korxona o'zgarsa daraxt qayta yuklanadi; clearOnOrgChange bo'lsa eski tanlov tozalanadi.
  watch(
    orgIds,
    (now, before) => {
      if (before && now.join(',') === before.join(',')) return
      if (props.clearOnOrgChange && before?.length && selectedIds.value.length) setValue([])
      search.value = null
      load()
    },
    { immediate: true }
  )

  const onSearch = useDebounceFn(() => {
    if (serverSearch.value) return load()
    tree.value = search.value ? filterTree(fullTree, search.value) : fullTree
    expanded.value = search.value ? parentIds(tree.value) : []
  }, 300)

  const setValue = (nodes) => {
    const ids = nodes.map((n) => Number(n.id))
    nodes.forEach((n) => names.value.set(Number(n.id), n.name))
    if (props.returnObject) {
      model.value = nodes.map((n) => ({ id: Number(n.id), name: n.name }))
      emits('change', props.multiple ? nodes : (nodes[0] ?? null))
      return
    }
    model.value = props.multiple ? ids : (ids[0] ?? null)
    emits('change', props.multiple ? nodes : (nodes[0] ?? null))
  }

  const shouldClose = computed(() => props.closeOnSelect ?? !props.multiple)

  const onSelect = (node) => {
    const exists = selectedIds.value.includes(Number(node.id))
    if (exists) setValue(selectedNodes.value.filter((n) => n.id !== Number(node.id)))
    else setValue(props.multiple ? [...selectedNodes.value, node] : [node])
    if (shouldClose.value && !exists) close()
  }

  // Bo'lim va uning barcha ichki bo'limlari (TreeOrg «hammasini tanlash»).
  const getChildIds = (list, elementId) => {
    const result = []
    const collect = (n) => {
      result.push(n)
      ;(n.children || []).forEach(collect)
    }
    const find = (n) => {
      if (n.id === elementId) {
        collect(n)
        return true
      }
      return (n.children || []).some(find)
    }
    ;(list || []).some(find)
    return result
  }

  const onSelectAll = (node) => {
    const branch = getChildIds(tree.value, node.id)
    const branchIds = branch.map((n) => Number(n.id))
    const allIn = branchIds.every((id) => selectedIds.value.includes(id))
    setValue(
      allIn
        ? selectedNodes.value.filter((n) => !branchIds.includes(n.id))
        : [...selectedNodes.value, ...branch.filter((n) => !selectedIds.value.includes(Number(n.id)))]
    )
  }

  const toggleExpand = (node) => {
    expanded.value = expanded.value.includes(node.id)
      ? expanded.value.filter((x) => x !== node.id)
      : [...expanded.value, node.id]
  }

  const triggerValue = computed(() => selectedNodes.value.map((n) => n.name).join(', '))

  const { show, triggerRef, panelRef, searchInputRef, close, onTriggerKeydown, onPanelKeydown } =
    useTreePopoverKeyboard({ searchable: () => false, multiple: () => props.multiple })
  const { popoverStyle } = useTreePopoverWidth(show, triggerRef, { fallback: 420 })

  const onClear = () => {
    setValue([])
    if (search.value) {
      search.value = null
      if (serverSearch.value) load()
      else tree.value = fullTree
    }
  }

  const isDisabled = computed(() => props.disabled || (needsOrg.value && !orgIds.value.length))
</script>

<template>
  <n-popover
    v-model:show="show"
    :placement="placement"
    trigger="click"
    :disabled="isDisabled"
    class="py-0! px-0!"
    :style="popoverStyle"
  >
    <template #trigger>
      <TreeSelectTrigger
        ref="triggerRef"
        :value="triggerValue"
        :count="selectedIds.length"
        :open="show"
        :loading="loading"
        :disabled="isDisabled"
        :clearable="clearable"
        :placeholder="placeholder || $t('content.choose')"
        @keydown="onTriggerKeydown"
        @clear="onClear"
      />
    </template>
    <div ref="panelRef" @keydown="onPanelKeydown">
      <TreeSelectPanel
        ref="searchInputRef"
        v-model:search="search"
        :loading="loading"
        :selected-count="multiple ? selectedIds.length : 0"
        :footer="multiple"
        :empty="!tree.length"
        @input="onSearch"
        @clear="onClear"
      >
        <TreeOrg
          :data="tree"
          :modelV="selectedNodes"
          :checkedVal="expanded"
          :getChildIds="getChildIds"
          :changeCheckVal="toggleExpand"
          :multiple="multiple"
          :highlight="search ?? ''"
          @onSelect="onSelect"
          @onSelectAll="onSelectAll"
        />
      </TreeSelectPanel>
    </div>
  </n-popover>
</template>
