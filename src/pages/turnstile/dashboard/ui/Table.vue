<script setup>
  import { h } from 'vue'
  import { UIBadge, UIStatus, UITable, UIUser } from '@/components/index.js'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global

  const props = defineProps({
    data: {
      type: Array,
      default: () => []
    },
    columns: {
      type: Array,
      required: false,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    },
    page: {
      type: Number,
      default: 1
    },
    perPage: {
      type: Number,
      default: 10
    },
    total: {
      type: Number,
      default: null
    }
  })

  const emit = defineEmits(['row-click', 'change-page'])

  const getNestedValue = (obj, path, defaultValue = null) => {
    if (!obj) return defaultValue

    const keys = path.split('.')
    let current = obj

    for (const key of keys) {
      if (!current || typeof current !== 'object') return defaultValue
      current = current[key]
      if (current === undefined) return null
    }

    return current ?? defaultValue
  }

  const toPixels = (value) => {
    if (typeof value === 'number') return value
    if (typeof value === 'string') return parseInt(value, 10) || undefined
    return undefined
  }

  const renderComponent = (componentName, value, componentProps = {}) => {
    switch (componentName) {
      case 'UIUser':
        return h(UIUser, {
          data: value,
          short: false,
          ...(typeof componentProps === 'object' ? componentProps : {})
        })
      case 'UIBadge': {
        const badgeProps =
          typeof componentProps === 'string' ? { type: componentProps } : componentProps
        return h(UIBadge, {
          label: value,
          ...badgeProps
        })
      }
      case 'UIStatus':
        return h(UIStatus, {
          content: value,
          ...(typeof componentProps === 'object' ? componentProps : {})
        })
      default:
        return value
    }
  }

  const keyedData = computed(() =>
    props.data.map((row, index) => (row?.id !== undefined ? row : { ...row, id: `row-${index}` }))
  )

  const uiColumns = computed(() =>
    props.columns.map((item) => ({
      key: item.key,
      title: t(item.headerName),
      width: toPixels(item.width),
      minWidth: toPixels(item.minWidth),
      render: (row) => {
        const rawValue = getNestedValue(row, item.key)
        const value = item.formatValue ? item.formatValue(rawValue) : rawValue
        if (!item.component) return value
        const componentProps =
          typeof item.componentProps === 'function'
            ? item.componentProps(rawValue)
            : item.componentProps
        return renderComponent(item.component, value, componentProps)
      }
    }))
  )
</script>

<template>
  <UITable
    :columns="uiColumns"
    :data="keyedData"
    :loading="loading"
    :page="page"
    :per-page="perPage"
    :total="total"
    @row-click="(row, index) => emit('row-click', row, index)"
    @change-page="(v) => emit('change-page', v)"
  />
</template>
