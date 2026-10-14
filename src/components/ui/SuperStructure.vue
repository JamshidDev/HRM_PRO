<script setup>
  import TreeOrg from '@/components/tree/TreeOrg.vue'
  import TreeSelectPanel from '@/components/tree/TreeSelectPanel.vue'
  import TreeSelectTrigger from '@/components/tree/TreeSelectTrigger.vue'
  import { useTreePopoverKeyboard } from '@/composables/useTreePopoverKeyboard.js'
  import { useTreePopoverWidth } from '@/composables/useTreePopoverWidth.js'
  import { useDebounceFn } from '@vueuse/core'
  import { useComponentStore } from '@/store/modules/index.js'
  const store = useComponentStore()
  const props = defineProps({
    multiple: { type: Boolean, default: true },
    options: { type: Array, default: [] },
    disabled: { type: Boolean, default: false },
    loading: { type: Boolean, default: false }
  })

  const searchModel = defineModel('search', { type: String, default: null })
  const modelV = defineModel('value', { type: Array, default: [] })
  const checkedVal = defineModel('cache', { type: Array, default: [] })
  const emits = defineEmits(['onSearch', 'onSubmit', 'updateModel', 'updateCheck'])

  const onSelect = (v) => {
    let list = []
    if (modelV.value.map((a) => a.id).includes(v.id)) {
      list = modelV.value.filter((x) => x.id !== v.id)
    } else {
      if (props.multiple) {
        list = modelV.value
        list.push(v)
      } else {
        list = [v]
      }
    }
    modelV.value = list
    // emits('updateModel', list)
  }

  const onSelectAll = (v) => {
    const idList = getChildIds(props.options, v.id)
    let list = []

    const checkRadio = (valList = [], idList = []) => {
      for (const id of idList) {
        if (!valList.includes(id)) {
          return false
        }
      }
      return true
    }

    if (
      checkRadio(
        modelV.value.map((a) => a.id),
        idList.map((e) => e.id)
      )
    ) {
      // Remove elements
      list = modelV.value.filter((x) => !idList.map((a) => a.id).includes(x.id))
    } else {
      // Add elements
      idList.forEach((y) => {
        if (!modelV.value.map((a) => a.id).includes(y.id)) {
          list.push(y)
        }
      })
      list = [...modelV.value, ...list]
    }
    modelV.value = list
    // emits('updateModel', list)
  }

  const getChildIds = (tree, elementId) => {
    const result = []

    const findAndCollect = (node) => {
      if (node.id === elementId) {
        collectChildIds(node)
        return true
      }
      for (const child of node.children) {
        if (findAndCollect(child)) return true
      }
      return false
    }

    const collectChildIds = (node) => {
      result.push(node)
      for (const child of node.children) {
        collectChildIds(child)
      }
    }

    for (const items of tree) {
      findAndCollect(items)
    }

    return result
  }

  const changeCheckVal = (v) => {
    let list = []
    if (checkedVal.value?.includes(v.id)) {
      list = checkedVal.value.filter((x) => x !== v.id)
    } else {
      list = checkedVal.value
      list.push(v.id)
    }

    // emits('updateCheck', list)
    checkedVal.value = list
  }

  const inputVal = computed(() => modelV.value.map((a) => a.name).toString())

  const slot = useSlots()
  // ♿ Klaviatura: ochish/yopish, qatorlar bo'ylab yurish, Tab bilan keyingi maydonga
  // o'tish. Ochilganda pastdagi qidiruv inputiga fokus tushadi.
  const { show, triggerRef, panelRef, searchInputRef, onTriggerKeydown, onPanelKeydown } =
    useTreePopoverKeyboard({
      disabled: () => props.disabled,
      multiple: () => props.multiple
    })
  // Filtr paneli ichida — panel kengligida, boshqa joyda — kamida 500px.
  const { popoverStyle } = useTreePopoverWidth(show, triggerRef, { fallback: 500 })
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
        :value="inputVal?.toString()"
        :count="modelV.length"
        :open="show"
        :disabled="disabled"
        :loading="loading"
        @keydown="onTriggerKeydown"
      />
    </template>
    <div ref="panelRef" @keydown="onPanelKeydown">
      <TreeSelectPanel
        ref="searchInputRef"
        v-model:search="searchModel"
        :loading="loading"
        :selected-count="multiple ? modelV.length : 0"
        :empty="!options?.length"
        @submit="emits('onSubmit')"
        @clear="modelV = []"
      >
        <TreeOrg
          :data="options"
          :modelV="modelV"
          :checkedVal="checkedVal"
          :getChildIds="getChildIds"
          :changeCheckVal="changeCheckVal"
          :multiple="multiple"
          :highlight="searchModel ?? ''"
          @onSelect="onSelect"
          @onSelectAll="onSelectAll"
        >
          <template #label="{ data }">
            <slot name="label" :data="data"></slot>
          </template>
        </TreeOrg>
      </TreeSelectPanel>
    </div>
  </n-popover>
</template>
