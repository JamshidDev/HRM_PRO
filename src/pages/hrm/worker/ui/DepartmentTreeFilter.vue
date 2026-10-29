<script setup>
  import TreeOrg from '@/components/tree/TreeOrg.vue'
  import TreeSelectPanel from '@/components/tree/TreeSelectPanel.vue'
  import TreeSelectTrigger from '@/components/tree/TreeSelectTrigger.vue'
  import { useTreePopoverKeyboard } from '@/composables/useTreePopoverKeyboard.js'
  import { useTreePopoverWidth } from '@/composables/useTreePopoverWidth.js'
  import { useDebounceFn } from '@vueuse/core'

  // Bitta korxona bo'limlari daraxti — o'z ma'lumotini o'zi yuklaydi (global store'ga yozmaydi).
  const props = defineProps({
    organizationId: { type: Number, default: null },
    modelValue: { type: Array, default: () => [] }
  })
  const emits = defineEmits(['update:modelValue', 'change', 'nodes'])

  const tree = ref([])
  const loading = ref(false)
  const search = ref(null)
  const expanded = ref([])

  const load = async () => {
    if (!props.organizationId) {
      tree.value = []
      return
    }
    loading.value = true
    try {
      const res = await $ApiService.componentService._departmentTree({
        params: { organization_id: props.organizationId, search: search.value || undefined }
      })
      tree.value = res.data.data ?? []
    } finally {
      loading.value = false
    }
  }

  watch(
    () => props.organizationId,
    () => {
      search.value = null
      load()
    },
    { immediate: true }
  )

  const flat = computed(() => {
    const out = new Map()
    const walk = (nodes) =>
      nodes.forEach((n) => {
        out.set(n.id, n)
        walk(n.children ?? [])
      })
    walk(tree.value)
    return out
  })

  // TreeOrg tanlovni obyektlar ro'yxati sifatida kutadi.
  const selected = computed(() =>
    props.modelValue.map((id) => flat.value.get(id) ?? { id, name: `#${id}`, children: [] })
  )

  const emitIds = (ids) => {
    emits('update:modelValue', ids)
    emits('nodes', ids.map((id) => flat.value.get(id)).filter(Boolean))
    emits('change', ids)
  }

  const onSelect = (v) => {
    const ids = props.modelValue.includes(v.id)
      ? props.modelValue.filter((id) => id !== v.id)
      : [...props.modelValue, v.id]
    emitIds(ids)
  }

  const getChildIds = (nodes, elementId) => {
    const result = []
    const collect = (node) => {
      result.push(node)
      ;(node.children ?? []).forEach(collect)
    }
    const find = (list) =>
      list.some((n) => (n.id === elementId ? (collect(n), true) : find(n.children ?? [])))
    find(nodes)
    return result
  }

  // Shoxobcha: hammasi tanlangan bo'lsa olib tashlanadi, aks holda qo'shiladi.
  const onSelectAll = (v) => {
    const branch = getChildIds(tree.value, v.id).map((n) => n.id)
    const all = branch.every((id) => props.modelValue.includes(id))
    emitIds(
      all
        ? props.modelValue.filter((id) => !branch.includes(id))
        : [...new Set([...props.modelValue, ...branch])]
    )
  }

  const changeCheckVal = (v) => {
    expanded.value = expanded.value.includes(v.id)
      ? expanded.value.filter((x) => x !== v.id)
      : [...expanded.value, v.id]
  }

  const onSearch = useDebounceFn(load, 300)

  const inputVal = computed(() => selected.value.map((a) => a.name).join(', '))

  const { show, triggerRef, panelRef, searchInputRef, onTriggerKeydown, onPanelKeydown } =
    useTreePopoverKeyboard({ multiple: () => true })
  const { popoverStyle } = useTreePopoverWidth(show, triggerRef, { fallback: 420 })
</script>

<template>
  <n-popover
    v-model:show="show"
    placement="bottom"
    trigger="click"
    class="py-0! px-0!"
    :style="popoverStyle"
  >
    <template #trigger>
      <TreeSelectTrigger
        ref="triggerRef"
        :value="inputVal"
        :count="modelValue.length"
        :open="show"
        :loading="loading"
        :disabled="!organizationId"
        clearable
        @clear="emitIds([])"
        @keydown="onTriggerKeydown"
      />
    </template>
    <div ref="panelRef" @keydown="onPanelKeydown">
      <TreeSelectPanel
        ref="searchInputRef"
        v-model:search="search"
        :loading="loading"
        :selected-count="modelValue.length"
        :empty="!tree.length"
        @input="onSearch"
        @submit="show = false"
        @clear="emitIds([])"
      >
        <TreeOrg
          :data="tree"
          :modelV="selected"
          :checkedVal="expanded"
          :getChildIds="getChildIds"
          :changeCheckVal="changeCheckVal"
          :multiple="true"
          :highlight="search ?? ''"
          @onSelect="onSelect"
          @onSelectAll="onSelectAll"
        />
      </TreeSelectPanel>
    </div>
  </n-popover>
</template>
