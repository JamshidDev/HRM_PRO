<script setup>
  import TreeOrg from '@/components/tree/TreeOrg.vue'
  import TreeSelectPanel from '@/components/tree/TreeSelectPanel.vue'
  import TreeSelectTrigger from '@/components/tree/TreeSelectTrigger.vue'
  import { useDebounceFn } from '@vueuse/core'
  import { useComponentStore } from '@/store/modules/index.js'
  import { useTreePopoverKeyboard } from '@/composables/useTreePopoverKeyboard.js'
  import { useTreePopoverWidth } from '@/composables/useTreePopoverWidth.js'
  const store = useComponentStore()
  const instance = getCurrentInstance()
  const props = defineProps({
    multiple: { type: Boolean, default: true },
    loading: { type: Boolean, default: false },
    modelV: { type: Array, default: () => [] },
    checkedVal: { type: Array, default: () => [] },
    options: { type: Array, default: () => [] },
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
  // Filtr paneli ichida — panel kengligida, boshqa joyda — kamida 420px.
  const { popoverStyle } = useTreePopoverWidth(show, triggerRef, { fallback: 420 })

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
    class="py-0! px-0!"
    :style="popoverStyle"
  >
    <template #trigger>
      <TreeSelectTrigger
        ref="triggerRef"
        :value="triggerValue"
        :count="modelV.length"
        :open="show"
        :loading="loading"
        :readonly="!searchableInput"
        :clearable="clearable"
        :placeholder="
          placeholder || (searchableInput ? $t('content.search') : $t('content.choose'))
        "
        @update:value="onTriggerInput"
        @focus="inputFocused = true"
        @blur="onTriggerBlur"
        @keydown="onTriggerKeydown"
        @clear="onClear"
      />
    </template>
    <div ref="panelRef" @keydown="onPanelKeydown">
      <TreeSelectPanel
        ref="searchInputRef"
        v-model:search="searchModel"
        :loading="loading"
        :selected-count="multiple ? modelV.length : 0"
        :footer="multiple"
        :empty="!options?.length"
        @input="searchEvent"
        @submit="emits('onSubmit')"
        @clear="onClear"
      >
        <template #searchEnd>
          <div class="ui-select-seg" role="group">
            <button
              type="button"
              :class="store.structureShort && 'ui-select-seg--on'"
              @click="store.structureShort = true"
            >
              {{ $t('content.short') }}
            </button>
            <button
              type="button"
              :class="!store.structureShort && 'ui-select-seg--on'"
              @click="store.structureShort = false"
            >
              {{ $t('content.long') }}
            </button>
          </div>
        </template>
        <TreeOrg
          :short="store.structureShort"
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
          <template v-if="$slots.label" #label="{ data }">
            <slot name="label" :data="data" />
          </template>
        </TreeOrg>
      </TreeSelectPanel>
    </div>
  </n-popover>
</template>

<style scoped>
  /* Qidiruv qatorining oxirida — balandligi qidiruv maydoni (34px) bilan bir xil. */
  .ui-select-seg {
    display: inline-flex;
    flex-shrink: 0;
    height: 34px;
    padding: 3px;
    border-radius: 9999px;
    background: var(--surface-ground);
  }

  .ui-select-seg button {
    padding: 0 12px;
    border-radius: 9999px;
    font-size: 12px;
    font-weight: 500;
    color: var(--textColor2);
    transition:
      background-color 0.12s ease,
      color 0.12s ease;
  }

  .ui-select-seg button.ui-select-seg--on {
    color: var(--textColor0);
    background: var(--surface-section);
    box-shadow: 0 1px 2px rgb(0 0 0 / 0.08);
  }
</style>
