<script setup>
import { Search48Filled } from '@vicons/fluent'
import TreeOrg from '@/components/tree/TreeOrg.vue'
import { useDebounceFn } from '@vueuse/core'
import { useComponentStore } from '@/store/modules/index.js'
const store = useComponentStore()
const props = defineProps({
  multiple: { type: Boolean, default: true },
  options: { type: Array, default: [] },
  disabled: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
})

const searchModel = defineModel('search', { type: String, default: null })
const modelV = defineModel('value', { type: Array, default:[] })
const checkedVal = defineModel('cache', { type: Array, default:[] })
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

const inputVal = computed(() =>modelV.value.map((a) => a.name).toString())


const slot = useSlots()
</script>

<template>
  <n-popover placement="bottom" trigger="click" width="500px" class="h-[460px] py-0! px-1">
    <template #trigger>
      <n-badge
          :show="!disabled"
          :offset="[-10, -4]"
          class="w-full"
          :value="modelV.length"
          type="info"
      >
        <n-input
            :disabled="disabled"
            class="ui__structure-input w-full"
            type="text"
            :value="inputVal?.toString()"
            :loading="loading"
        />
      </n-badge>
    </template>
    <div class="w-full h-[10px]"></div>
    <div class="w-full h-[404px] overflow-y-auto">
      <n-spin :show="loading" class="w-full h-full">
        <TreeOrg
            :data="options"
            :modelV="modelV"
            :checkedVal="checkedVal"
            :getChildIds="getChildIds"
            :changeCheckVal="changeCheckVal"
            :multiple="multiple"
            @onSelect="onSelect"
            @onSelectAll="onSelectAll"
        >
          <template #label="{data}">
            <slot name="label" :data="data"></slot>
          </template>
        </TreeOrg>
      </n-spin>
    </div>
    <div class="w-full h-[40px] flex items-center">
      <n-input-group>
        <n-input
            size="small"
            v-model:value="searchModel"
            round
            :loading="loading"
        >
          <template #prefix>
            <n-icon :component="Search48Filled" />
          </template>
        </n-input>
        <n-button
            @click="emits('onSubmit')"
            type="primary"
            size="small"
            :loading="loading"
        >
          {{ $t('content.search') }}
        </n-button>
      </n-input-group>
    </div>
  </n-popover>
</template>
