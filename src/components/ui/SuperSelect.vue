<script setup>
  import UIHelper from '@/utils/UIHelper.js'
  import i18n from '@/i18n'
  const instance = getCurrentInstance()
  const selectAll = ref(false)
  const selectedOptions = ref([])
  const t = i18n.global.t

  const valueModel = defineModel('value', { type: [Array, Number, String, null], default: null })
  const searchModel = defineModel('search', { type: [String, null], default: null })

  const props = defineProps({
    options: {
      type: Array,
      default: [],
      required: true
    },
    valueField: {
      type: String,
      default: 'id'
    },
    labelField: {
      type: String,
      default: 'name'
    },
    renderLabel: {
      type: Function,
      default: UIHelper.selectRender.label
    },
    renderTag: {
      type: Function,
      default: UIHelper.selectRender.value
    },
    loading: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    },
    multiple: {
      type: Boolean,
      default: false
    },
    maxTagCount: {
      type: Number,
      default: 1
    },
    query: {
      type: String,
      default: undefined
    },
    pinSelect: {
      type: Boolean,
      default: false
    },
    multipleSearch: {
      type: Boolean,
      default: false
    },
    clearable: {
      type: Boolean,
      default: false
    },
    totalCount: {
      type: Number,
      default: 0
    },
    perPage: {
      type: Number,
      default: 100
    },
    placeholder: {
      type: String,
      default: 'content.choose'
    }
  })

  const emits = defineEmits([
    'onScroll',
    'updateValue',
    'onSearch',
    'onScrollEv',
    'updateShow',
    'focus'
  ])

  const onCloseEv = (v) => {
    valueModel.value = props.multiple ? valueModel.value.filter((x) => x !== v.id) : null
  }

  const localSearch = computed(() => 'onUpdate:search' in (instance?.vnode.props || {}))

  const fuzzySearch = (text, query) => {
    if (!query || !text) return true

    const words = query.toLowerCase().trim().split(/\s+/)
    const target = text.toLowerCase()

    return words.every((word) => target.includes(word))
  }

  const computedOption = computed(() => {
    selectedOptions.value = props.multiple
      ? [...props.options, ...selectedOptions.value].filter((v) => valueModel.value.includes(v.id))
      : [...props.options, ...selectedOptions.value].filter((v) => valueModel.value === v.id)

    const options = Array.from(
      new Map([...props.options, ...selectedOptions.value].map((v) => [v.id, v])).values()
    )

    if (localSearch.value) return options

    let query = searchModel.value?.toString()?.trim()?.toLowerCase()
    if (!query) return options

    const filtered = props.multipleSearch
      ? props.options.filter((v) => fuzzySearch(v.name, query) || fuzzySearch(v.position, query))
      : props.options.filter((v) => fuzzySearch(v.name, query))

    return Array.from(
      new Map([...filtered, ...selectedOptions.value].map((v) => [v.id, v])).values()
    )
  })

  watchEffect(() => {
    if (props.multiple) {
      selectAll.value =
        computedOption.value.length === valueModel.value.length && computedOption.value.length > 0
    }
  })

  const onUpdateCheck = (v) => {
    valueModel.value = v ? computedOption.value.map((x) => x[props.valueField]) : []
  }

  const onScrollEv = (e) => {
    if (props.perPage > computedOption.value.length) return

    emits('onScroll', e)
    if (props.totalCount === 0) return

    const { scrollTop, offsetHeight, scrollHeight } = e.currentTarget
    const isAtBottom = scrollHeight - scrollTop - offsetHeight < 2
    if (isAtBottom && !props.loading && props.totalCount > props.options.length) {
      emits('onScrollEv')
    }
  }

  let timer = null
  const onSearchEv = () => {
    if (props.localSearch) return
    clearTimeout(timer)
    timer = setTimeout(() => {
      emits('onSearch', searchModel.value)
    }, 800)
  }

  onUnmounted(() => {
    clearTimeout(timer)
  })
</script>

<template>
  <n-select
    :placeholder="t(placeholder)"
    :clearable="clearable"
    @scroll="onScrollEv"
    @update:show="(e) => emits('updateShow', e)"
    @focus="emits('focus')"
    :multiple="multiple"
    v-model:value="valueModel"
    :options="computedOption"
    :loading="loading"
    :disabled="disabled"
    :render-label="renderLabel"
    :render-tag="UIHelper.selectRender.value2(onCloseEv, multiple)"
    :label-field="labelField"
    :value-field="valueField"
    :max-tag-count="maxTagCount"
    :reset-menu-on-options-change="false"
    :virtual-scroll="true"
  >
    <template #header>
      <div class="w-full flex">
        <n-input
          clearable
          v-model:value="searchModel"
          class="w-full skip-format"
          :placeholder="$t(pinSelect ? 'content.pin' : 'content.search')"
          :on-keyup="onSearchEv"
          @paste="onSearchEv"
          @keydown.stop
          @clear="onSearchEv"
          v-mask="pinSelect ? '####-####-####-##' : undefined"
        />
      </div>
    </template>
    <template v-if="multiple" #action>
      <n-checkbox @update:checked="onUpdateCheck" v-model:checked="selectAll">
        <span class="text-secondary text-xs"
          >{{ $t('content.selectAll') }} - ({{ computedOption.length }})</span
        >
      </n-checkbox>
    </template>
  </n-select>
</template>
