<script setup>
  import {
    UITableColumns,
    UITableSelectAll,
    UITableSelectRow,
    UITableActionsMenu
  } from '@/components/index.js'
  import { TABLE_FILL_HEIGHT_KEY } from './tableFillHeightKey.js'
  import { useTableColumns } from '@/composables/index.js'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global

  const props = defineProps({
    columns: { type: Array, required: true }, // [{ key, title, width, minWidth, maxWidth, align, fixed }]
    data: { type: Array, required: true },
    rowKey: { type: String, default: 'id' },
    bordered: { type: Boolean, default: false },
    columnBorder: { type: Boolean, default: false },
    rowBorder: { type: Boolean, default: false },
    striped: { type: Boolean, default: true },
    radius: { type: [Number, String], default: 16 },

    showIndex: { type: Boolean, default: true },
    page: { type: Number, default: 1 },
    perPage: { type: Number, default: 0 },
    selectable: { type: Boolean, default: false }, // swaps the row-number for a checkbox
    selectedKeys: { type: Array, default: () => [] },
    allSelected: { type: Boolean, default: false },

    actions: { type: Array, default: () => [] }, // "..." menu + right-click context menu options
    // Persists column visibility/order to localStorage under this key and renders the settings button.
    storageKey: { type: String, default: null }
  })

  const emit = defineEmits(['row-click', 'row-contextmenu', 'action', 'toggle-row', 'toggle-all'])

  const slots = useSlots()
  const fillHeight = inject(TABLE_FILL_HEIGHT_KEY, ref(false))

  const tableColumns = props.storageKey
    ? useTableColumns(
        props.storageKey,
        computed(() => props.columns)
      )
    : null

  const getCellValue = (row, key) =>
    key.includes?.('.') ? key.split('.').reduce((o, k) => o?.[k], row) : row[key]

  const visibleActions = computed(() => props.actions.filter((a) => a.visible !== false))
  const indexOffset = computed(() => (props.page - 1) * props.perPage)

  const allCols = computed(() => {
    const cols = [...(tableColumns ? tableColumns.columns.value : props.columns)]
    if (props.showIndex) {
      cols.unshift({
        key: '__index',
        width: 56,
        align: 'center',
        fixed: 'left'
      })
    }
    if (visibleActions.value.length || tableColumns) {
      cols.push({
        key: '__actions',
        width: 56,
        align: 'center',
        fixed: 'right'
      })
    }
    return cols
  })

  // n-data-table needs scroll-x set for `fixed` columns to work at all.
  const colWidth = (col) => col.width || col.minWidth || 100
  const scrollX = computed(() => allCols.value.reduce((sum, c) => sum + colWidth(c), 0))

  const rowKeyFn = (row) => row[props.rowKey]

  const renderIndexHeader = () => {
    if (props.selectable) {
      return h(UITableSelectAll, {
        checked: props.allSelected,
        label: t('exportPage.checkAll'),
        onToggle: () => emit('toggle-all')
      })
    }
    return '№'
  }

  const renderActionsHeader = () => {
    if (!tableColumns) return null
    return h(UITableColumns, {
      columns: tableColumns.allColumns.value,
      'onUpdate:columns': (v) => tableColumns.setAllColumns(v),
      onReset: () => tableColumns.reset()
    })
  }

  const renderHeader = (col) => {
    const slotName = `header-${col.key}`
    if (slots[slotName]) return slots[slotName]({ column: col })
    if (col.key === '__index') return renderIndexHeader()
    if (col.key === '__actions') return renderActionsHeader()
    return col.title
  }

  const renderCell = (col, row, index) => {
    const slotName = `cell-${col.key}`
    if (slots[slotName]) return slots[slotName]({ row, index, value: getCellValue(row, col.key) })

    if (col.key === '__index') {
      if (props.selectable) {
        return h(UITableSelectRow, {
          checked: props.selectedKeys.includes(row[props.rowKey]) || props.allSelected,
          disabled: props.allSelected,
          onToggle: () => emit('toggle-row', row)
        })
      }
      return `${indexOffset.value + index + 1}`
    }

    if (col.key === '__actions') {
      if (!visibleActions.value.length) return null
      return h(UITableActionsMenu, {
        options: visibleActions.value,
        onSelect: (key) => emit('action', key, row)
      })
    }

    return getCellValue(row, col.key)
  }

  const ndtColumns = computed(() =>
    allCols.value.map((col) => ({
      key: col.key,
      width: col.width,
      minWidth: col.minWidth,
      maxWidth: col.maxWidth,
      align: col.align,
      fixed: col.fixed,
      title: () => renderHeader(col),
      render: (row, index) => renderCell(col, row, index)
    }))
  )

  const rowProps = (row, index) => ({
    onClick: () => emit('row-click', row, index),
    onContextmenu: (e) => onRowContextmenu(e, row, index)
  })

  const contextMenu = reactive({ show: false, x: 0, y: 0, row: null })

  const onRowContextmenu = (e, row, index) => {
    emit('row-contextmenu', e, row, index)
    if (!visibleActions.value.length) return
    e.preventDefault()
    contextMenu.row = row
    contextMenu.show = false
    nextTick().then(() => {
      contextMenu.show = true
      contextMenu.x = e.clientX
      contextMenu.y = e.clientY
    })
  }

  const onSelectContextAction = (key) => {
    contextMenu.show = false
    emit('action', key, contextMenu.row)
  }
</script>

<template>
  <div class="ui-table" :class="{ 'ui-table--fill': fillHeight }">
    <n-data-table
      class="ui-table__table"
      :columns="ndtColumns"
      :data="data"
      :row-key="rowKeyFn"
      :bordered="bordered"
      :single-column="!rowBorder"
      :single-line="!columnBorder"
      :bottom-bordered="rowBorder"
      :striped="striped"
      :scroll-x="scrollX"
      :flex-height="fillHeight"
      :row-props="rowProps"
    >
      <template #empty>
        <div class="ui-table__empty">
          <slot name="empty">
            {{ $t('content.notFoundData') }}
          </slot>
        </div>
      </template>
    </n-data-table>
  </div>

  <n-dropdown
    v-if="visibleActions.length"
    size="small"
    placement="bottom-start"
    trigger="manual"
    :x="contextMenu.x"
    :y="contextMenu.y"
    :options="visibleActions"
    :show="contextMenu.show"
    :on-clickoutside="() => (contextMenu.show = false)"
    @select="onSelectContextAction"
  />
</template>

<style scoped>
  .ui-table {
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .ui-table--fill {
    flex: 1 1 0%;
    min-height: 0;
  }

  .ui-table__table {
    flex: 1 1 auto;
    min-height: 0;
  }

  .ui-table__table :deep(.n-data-table-th:first-child) {
    border-top-left-radius: 16px !important;
  }

  .ui-table__table :deep(.n-data-table-th:last-child) {
    border-top-right-radius: 16px !important;
  }

  .ui-table__empty {
    padding: 48px 16px;
    text-align: center;
    color: var(--textColor3);
  }
</style>
