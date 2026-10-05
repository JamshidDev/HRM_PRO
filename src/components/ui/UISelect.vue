<script setup>
  import { Search48Filled, Search32Filled, Dismiss16Filled } from '@vicons/fluent'
  import TreeOrg from '@/components/tree/TreeOrg.vue'
  import { useDebounceFn } from '@vueuse/core'
  import { useComponentStore } from '@/store/modules/index.js'
  import { useTreePopoverKeyboard } from '@/composables/useTreePopoverKeyboard.js'
  const store = useComponentStore()
  const instance = getCurrentInstance()
  const props = defineProps({
    multiple: { type: Boolean, default: true },
    loading: { type: Boolean, default: false },
    modelV: { type: Array, default: [] },
    checkedVal: { type: Array, default: [] },
    options: { type: Array, default: [] },
    // Popover 400px, ya'ni tor trigger ostida `bottom` (markazlashgan) holatda
    // har ikki tomondan chiqib ketadi va modal/viewport chegarasida kesiladi.
    // Shunday joylarda `bottom-start` berilsa, popover trigger'ning chap
    // qirrasidan boshlanib o'ngga cho'ziladi. Default o'zgarmaydi — 99 ta
    // sahifadagi mavjud ko'rinish saqlanadi.
    placement: { type: String, default: 'bottom' },
    // true bo'lsa katta (trigger) input ham qidiruv sifatida yoziladi.
    searchableInput: { type: Boolean, default: false },
    // Berilmasa avvalgi default matn ishlatiladi (content.search / content.choose).
    placeholder: { type: String, default: null },
    // Tanlangan qiymat bo'lsa trigger ichida tozalash (×) tugmasi chiqadi.
    clearable: { type: Boolean, default: false }
  })

  const inputFocused = ref(false)

  const searchModel = defineModel('search', { type: String, default: null })
  const emits = defineEmits(['onSearch', 'onSubmit', 'updateModel', 'updateCheck', 'defaultValue'])

  const onSelect = (v) => {
    let list = []
    if (props.modelV.map((a) => a.id).includes(v.id)) {
      list = props.modelV.filter((x) => x.id !== v.id)
    } else {
      if (props.multiple) {
        list = props.modelV
        list.push(v)
      } else {
        list = [v]
      }
    }
    emits('updateModel', list)
  }

  const collectParentIds = (nodes) => {
    const ids = []
    const walk = (list) => {
      for (const node of list || []) {
        if (Array.isArray(node.children) && node.children.length > 0) {
          ids.push(node.id)
          walk(node.children)
        }
      }
    }
    walk(nodes)
    return ids
  }

  watch(
    () => props.options,
    (v) => {
      if (isSingleOption.value && searchModel.value === null) {
        if (isExistDefaultVal.value) {
          emits('defaultValue', props.options)
        } else {
          emits('updateModel', props.options)
        }
      }

      if (searchModel.value) {
        const parentIds = collectParentIds(v)
        const merged = Array.from(new Set([...(props.checkedVal || []), ...parentIds]))
        if (merged.length !== (props.checkedVal || []).length) {
          emits('updateCheck', merged)
        }
      }
    },
    { deep: true }
  )

  const isSingleOption = computed(
    () =>
      props.options.length === 1 &&
      (props.options[0]?.children ? props.options[0].children?.length === 0 : true)
  )

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
        props.modelV.map((a) => a.id),
        idList.map((e) => e.id)
      )
    ) {
      // Remove elements
      list = props.modelV.filter((x) => !idList.map((a) => a.id).includes(x.id))
    } else {
      // Add elements
      idList.forEach((y) => {
        if (!props.modelV.map((a) => a.id).includes(y.id)) {
          list.push(y)
        }
      })
      list = [...props.modelV, ...list]
    }
    emits('updateModel', list)
  }

  const searchEvent = useDebounceFn(() => {
    emits('onSearch', searchModel.value)
  }, 800)

  const getChildIds = (tree, elementId) => {
    const result = []

    const findAndCollect = (node) => {
      if (node.id === elementId) {
        collectChildIds(node)
        return true
      }
      for (const child of node.children || []) {
        if (findAndCollect(child)) return true
      }
      return false
    }

    const collectChildIds = (node) => {
      result.push(node)
      for (const child of node.children || []) {
        collectChildIds(child)
      }
    }

    for (const items of tree || []) {
      findAndCollect(items)
    }

    return result
  }

  const changeCheckVal = (v) => {
    let list = []
    if (props.checkedVal?.includes(v.id)) {
      list = props.checkedVal.filter((x) => x !== v.id)
    } else {
      list = props.checkedVal
      list.push(v.id)
    }
    emits('updateCheck', list)
  }

  const inputVal = computed(() => props.modelV.map((a) => a.name).toString())

  // searchableInput: fokusda qidiruv matnini, aks holda tanlangan nomlarni ko'rsatadi.
  const triggerValue = computed(() => {
    if (props.searchableInput && inputFocused.value) return searchModel.value ?? ''
    return inputVal.value?.toString()
  })

  const onTriggerInput = (v) => {
    if (!props.searchableInput) return
    searchModel.value = v
    searchEvent()
  }

  const onTriggerBlur = () => {
    // Popover ichidagi klik ishlab ulgurishi uchun kichik kechikish.
    setTimeout(() => {
      inputFocused.value = false
    }, 150)
  }

  const isExistDefaultVal = computed(() => instance.vnode.props?.onDefaultValue)

  const callDefaultValue = () => {
    if (
      isSingleOption.value &&
      props.modelV.length === 0 &&
      isExistDefaultVal.value &&
      searchModel.value === null
    ) {
      emits('defaultValue', props.options)
    }
  }

  onMounted(() => {
    callDefaultValue()
  })

  // ♿ Klaviatura: ochish/yopish, qatorlar bo'ylab yurish, Tab bilan keyingi maydonga
  // o'tish. Ochilganda pastdagi qidiruv inputiga fokus tushadi.
  const { show, triggerRef, panelRef, searchInputRef, onTriggerKeydown, onPanelKeydown } =
    useTreePopoverKeyboard({
      searchable: () => props.searchableInput,
      multiple: () => props.multiple
    })

  // Tanlov bilan birga pastdagi qidiruv ham tozalanadi — daraxt to'liq holiga qaytadi.
  const onClear = () => {
    emits('updateModel', [])
    if (searchModel.value) {
      searchModel.value = null
      emits('onSearch', null)
    }
    triggerRef.value?.$el?.querySelector('input')?.focus()
  }
</script>

<template>
  <!-- Mobil kenglik viewport'ga bog'langan. Ilgari `max-w-(--top-activator-width)`
       edi, ya'ni bu dropdown o'z o'lchamini `UIPageFilter` ning FILTR TUGMASI
       kengligidan olardi — tugma icon-only 40px bo'lgach daraxt ham 40px ga
       qisilib qolgan edi. Ichma-ich popover begona ajdodning trigger kengligiga
       bog'lanmasligi kerak. -->
  <n-popover
    v-model:show="show"
    :placement="placement"
    trigger="click"
    class="h-[400px] md:max-w-auto py-0! px-0! max-w-[calc(100vw-32px)] md:max-w-none! md:w-[400px]"
  >
    <template #trigger>
      <n-badge
        ref="triggerRef"
        class="w-full block"
        :value="modelV.length"
        type="info"
        :offset="[-10, -4]"
      >
        <n-input
          :placeholder="
            placeholder || (searchableInput ? $t('content.search') : $t('content.choose'))
          "
          :loading="loading"
          class="ui__structure-input w-full"
          type="text"
          :readonly="!searchableInput"
          :value="triggerValue"
          @update:value="onTriggerInput"
          @focus="inputFocused = true"
          @blur="onTriggerBlur"
          @keydown="onTriggerKeydown"
        >
          <template v-if="clearable && modelV.length" #suffix>
            <button
              type="button"
              :aria-label="$t('content.clear')"
              :title="$t('content.clear')"
              class="ui-select__clear flex items-center justify-center w-4 h-4 rounded-full text-textColor3 hover:text-textColor1 outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer"
              @click.stop="onClear"
              @keydown.enter.stop
              @keydown.space.stop
            >
              <n-icon size="14"><Dismiss16Filled /></n-icon>
            </button>
          </template>
        </n-input>
      </n-badge>
    </template>
    <div ref="panelRef" @keydown="onPanelKeydown">
      <div class="w-full h-[10px]"></div>
      <div class="w-full h-[344px] overflow-y-auto px-1">
        <n-spin :show="loading" class="w-full h-full">
          <TreeOrg
            :short="store.structureShort"
            :data="options"
            :modelV="modelV"
            :checkedVal="checkedVal"
            :getChildIds="getChildIds"
            :changeCheckVal="changeCheckVal"
            :multiple="multiple"
            @onSelect="onSelect"
            @onSelectAll="onSelectAll"
          >
            <template v-if="$slots.label" #label="{ data }">
              <slot name="label" :data="data" />
            </template>
          </TreeOrg>
        </n-spin>
      </div>
      <div class="w-full h-[40px] flex items-center px-1">
        <n-input-group>
          <n-button size="small" @click="store.structureShort = !store.structureShort">
            <template #icon>
              <n-checkbox v-model:checked="store.structureShort" @click.stop />
            </template>
            {{ store.structureShort ? $t('content.long') : $t('content.short') }}
          </n-button>
          <n-input
            ref="searchInputRef"
            data-tree-search
            clearable
            size="small"
            v-model:value="searchModel"
            round
            :on-keyup="searchEvent"
            @update:value="searchEvent"
            :loading="loading"
          >
            <template #prefix>
              <n-icon :component="Search48Filled" />
            </template>
          </n-input>
          <n-button @click="emits('onSubmit')" type="primary" size="small" :loading="loading">
            <template #icon>
              <Search32Filled />
            </template>
          </n-button>
        </n-input-group>
      </div>
    </div>
  </n-popover>
</template>
