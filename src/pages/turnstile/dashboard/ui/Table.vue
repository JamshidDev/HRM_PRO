<script setup>
  import { h } from 'vue'
  import { UIBadge, UIStatus, UIUser } from '@/components/index.js'

  const props = defineProps({
    data: {
      type: Array,
      default: () => []
    },
    columns: {
      type: Array,
      required: true,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    },
    showNumbering: {
      type: Boolean,
      default: true
    },
    page: {
      type: Number,
      default: 1
    },
    perPage: {
      type: Number,
      default: 10
    }
  })

  const getNestedValue = (obj, path, defaultValue = null) => {
    if (!obj) return defaultValue

    const keys = path.split('.')
    let current = obj

    for (const key of keys) {
      if (!current || typeof current !== 'object') return defaultValue
      current = current[key]
      // Agar field undefined bo'lsa, loop to'xtasin va null qaytarsin
      if (current === undefined) return null
    }

    return current ?? defaultValue
  }

  const renderComponent = (componentName, value, componentProps = {}) => {
    switch (componentName) {
      case 'UIUser':
        return h(UIUser, {
          hideTooltip: true,
          data: value,
          short: false,
          ...(typeof componentProps === 'object' ? componentProps : {})
        })
      case 'UIBadge':
        const badgeProps =
          typeof componentProps === 'string' ? { type: componentProps } : componentProps
        return h(UIBadge, {
          label: value,
          ...badgeProps
        })
      case 'UIStatus':
        return h(UIStatus, {
          content: value,
          ...(typeof componentProps === 'object' ? componentProps : {})
        })
      default:
        return value
    }
  }
</script>

<template>
  <div class="w-full">
    <div class="w-full overflow-y-auto h-[calc(100vh-256px)]">
      <n-table class="sticky-table-header" :single-line="false" size="small">
        <thead>
          <tr>
            <th v-if="showNumbering" class="text-center! min-w-[40px] w-[40px]">
              {{ $t('content.number') }}
            </th>
            <template v-for="(item, index) in columns" :key="index">
              <th :style="{ minWidth: item.minWidth, width: item?.width || 'auto' }">
                {{ $t(item.headerName) }}
              </th>
            </template>
          </tr>
        </thead>
        <tbody>
          <template v-for="(row, index) in data" :key="index">
            <tr>
              <td v-if="showNumbering" class="text-center">
                <span class="text-center text-[12px] text-gray-600 block">{{
                  (page - 1) * perPage + index + 1
                }}</span>
              </td>
              <template v-for="(item, idx) in columns" :key="idx">
                <td>
                  <!-- Agar component belgilangan bo'lsa, uni render qilamiz -->
                  <component
                    v-if="item.component"
                    :is="
                      renderComponent(
                        item.component,
                        item.formatValue
                          ? item.formatValue(getNestedValue(row, item.key))
                          : getNestedValue(row, item.key),
                        typeof item.componentProps === 'function'
                          ? item.componentProps(getNestedValue(row, item.key))
                          : item.componentProps
                      )
                    "
                  />
                  <!-- Aks holda oddiy text ko'rsatamiz -->
                  <template v-else>
                    {{
                      item.formatValue
                        ? item.formatValue(getNestedValue(row, item.key))
                        : getNestedValue(row, item.key)
                    }}
                  </template>
                </td>
              </template>
            </tr>
          </template>
        </tbody>
      </n-table>
    </div>
  </div>
</template>
