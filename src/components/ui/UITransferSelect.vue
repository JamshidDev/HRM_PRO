<script setup>
  import UIHelper from '@/utils/UIHelper.js'
  import { NCheckbox } from 'naive-ui'

  const searchModel = ref('')
  const selectAll = ref(false)
  const selectedOptions = ref([])

  const valueModel = defineModel('value', { type: [Array, Number, String, null], default: null })

  const props = defineProps({
    value: {
      type: [Array, Number, String, null],
      default: null,
      required: true
    },
    options: {
      type: Array,
      default: [],
      required: true
    },
    valueField: {
      type: String,
      default: 'id',
      required: true
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
    }
  })

  const emits = defineEmits(['onScroll', 'updateValue', 'onSearch'])

  let timer = null
  const onSearchEv = () => {
    if (props.query === undefined) return
    clearTimeout(timer)
    timer = setTimeout(() => {
      emits('onSearch', searchModel.value)
    }, 1000)
  }

  const computedOption = computed(() => {
    if (props.query !== undefined) {
      return props.options
    }

    let query = searchModel.value?.toString()?.trim()?.toLowerCase()
    if (!query) {
      return props.options
    }

    selectedOptions.value = props.multiple
      ? [...props.options].filter((v) => valueModel.value.includes(v.id))
      : [...props.options].filter((v) => valueModel.value === v.id)

    const filtered = props.multipleSearch
      ? props.options.filter(
          (v) =>
            v?.name?.toString()?.toLowerCase()?.includes(query) ||
            v?.position?.toString()?.toLowerCase()?.includes(query)
        )
      : props.options.filter((v) => v?.name?.toString()?.toLowerCase()?.includes(query))

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

  const computedOptions = computed(() => {
    return props.options
      .map((v) => ({
        ...v,
        label: v.name,
        value: v.id
      }))
      .filter((v) => !valueModel.value.includes(v.id))
  })

  const targetOptions = computed(() => {
    return props.options
      .map((v) => ({
        ...v,
        label: v.name,
        value: v.id
      }))
      .filter((v) => valueModel.value.includes(v.id))
  })

  onMounted(() => {
    searchModel.value = props.query
  })

  const onUpdateValue = () => {}

  const targetLabel = function ({ option }) {
    return h(
      'div',
      {
        style: {
          display: 'flex',
          alignItems: 'center',
          margin: '6px 0'
        }
      },
      {
        default: () => [
          h(NCheckbox, {
            checked: true
          }),
          h(
            'div',
            {
              style: {
                display: 'flex',
                marginLeft: '6px',
                alignSelf: 'center'
              }
            },
            { default: () => option.label }
          )
        ]
      }
    )
  }
  const sourceLabel = function ({ option }) {
    return h(
      'div',
      {
        style: {
          display: 'flex',
          alignItems: 'center',
          margin: '6px 0'
        }
      },
      {
        default: () => [
          h(NCheckbox, {
            checked: true
          }),
          h(
            'div',
            {
              style: {
                display: 'flex',
                marginLeft: '6px',
                alignSelf: 'center'
              }
            },
            { default: () => option.label }
          )
        ]
      }
    )
  }
</script>

<template>
  <n-select
    clearable
    multiple
    v-model:value="valueModel"
    :options="computedOption"
    :loading="loading"
    :disabled="disabled"
    :render-label="renderLabel"
    :render-tag="renderTag"
    :label-field="labelField"
    :value-field="valueField"
    :max-tag-count="maxTagCount"
    :reset-menu-on-options-change="false"
    :virtual-scroll="true"
    :menu-props="{
      class: 'ui-transfer-select'
    }"
  >
    <template #action>
      <n-spin :show="loading">
        <div class="w-full flex min-h-[200px]">
          <n-transfer
            class="ui-transfer-source"
            virtual-scroll
            :options="computedOptions"
            v-model:value="valueModel"
            @update:value="onUpdateValue"
            source-filterable
            target-filterable
            @click.stop
          />
          <n-transfer
            class="ui-transfer-target"
            virtual-scroll
            :options="targetOptions"
            :render-target-label="targetLabel"
            v-model:value="valueModel"
            @update:value="onUpdateValue"
            source-filterable
            target-filterable
          />
        </div>
      </n-spin>
    </template>
  </n-select>
</template>

<style lang="scss">
  .ui-transfer-select {
    overflow: hidden;
    width: 600px;
  }
  .ui-transfer-select > .n-scrollbar {
    display: none !important;
  }
  .ui-transfer-select > .n-base-select-menu__empty {
    display: none !important;
  }
  .ui-transfer-source > .n-transfer-list--target {
    display: none !important;
  }
  .ui-transfer-source {
    .n-transfer-list-item__checkbox {
      pointer-events: none !important;
    }
  }
  .ui-transfer-target > .n-transfer-list--source {
    display: none !important;
  }
</style>
