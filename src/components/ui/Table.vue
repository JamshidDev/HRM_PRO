<script setup>
  import {
    NoDataPicture,
    UIPagination,
    UITableActionsMenu,
    UITableColumns,
    UITableSelectAll,
    UITableSelectRow
  } from '@/components/index.js'
  import { useTableColumns } from '@/composables/index.js'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global

  const props = defineProps({
    columns: { type: Array, required: true }, // [{ key, title, fullTitle, width, minWidth, maxWidth, className, resizable, ellipsis, align, fixed }]
    data: { type: Array, default: () => [] },
    rowKey: { type: String, default: 'id' },
    size: { type: String, default: 'small' }, // small | medium | large
    bordered: { type: Boolean, default: false },
    columnBorder: { type: Boolean, default: false },
    rowBorder: { type: Boolean, default: false },
    striped: { type: Boolean, default: true },
    loading: { type: Boolean, default: false },
    bottomGap: { type: Number, default: 28 }, // gap below the card
    showIndex: { type: Boolean, default: true },
    page: { type: Number, default: 1 },
    perPage: { type: Number, default: 15 },
    total: { type: Number, default: null }, // renders the pagination footer when set
    selectable: { type: Boolean, default: false }, // swaps the row-number for a checkbox
    selectedKeys: { type: Array, default: () => [] },
    allSelected: { type: Boolean, default: false },
    actions: { type: Array, default: () => [] }, // "..." menu + right-click options
    storageKey: { type: String, default: null }, // persists column visibility/order
    onLoad: { type: Function, default: null } // async tree children loader: (row) => Promise<void>
  })

  const emit = defineEmits([
    'row-click',
    'row-contextmenu',
    'action',
    'toggle-row',
    'toggle-all',
    'change-page'
  ])

  const slots = useSlots()
  const empty = computed(() => props.data.length === 0)

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
      cols.unshift({ key: '__index', width: 56, align: 'center', fixed: 'left' })
    }
    if (visibleActions.value.length || tableColumns) {
      cols.push({ key: '__actions', width: 56, align: 'center', fixed: 'right' })
    }
    return cols
  })

  const naturalWidth = (col) => col.width || col.minWidth || 100
  const scrollX = computed(() => allCols.value.reduce((sum, c) => sum + naturalWidth(c), 0))

  const ndtColumns = computed(() => {
    return allCols.value.map((col) => ({
      key: col.key,
      width: col.width,
      minWidth: col.minWidth,
      maxWidth: col.maxWidth,
      className: col.className,
      resizable: col.resizable ?? col.minWidth !== undefined,
      ellipsis:
        col.ellipsis ??
        (slots[`cell-${col.key}`]
          ? false
          : {
              tooltip: {
                style: {
                  maxWidth: '300px'
                }
              }
            }),
      align: col.align,
      fixed: col.fixed,
      tree: col.tree,
      title: () => renderHeader(col),
      render: (row, index) => renderCell(col, row, index)
    }))
  })

  const rowKeyFn = (row) => row[props.rowKey]

  const onActionSelect = (key, option, row) => {
    if (option.action) {
      option.action(row)
      return
    }
    emit('action', key, row)
  }

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
        onSelect: (key, option) => onActionSelect(key, option, row)
      })
    }

    return getCellValue(row, col.key)
  }

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

  const onSelectContextAction = (key, option) => {
    contextMenu.show = false
    onActionSelect(key, option, contextMenu.row)
  }
</script>

<template>
  <n-spin :show="loading" class="h-full">
    <NoDataPicture v-if="empty" />

    <div v-else class="h-full flex flex-col p-1 bg-surface-section rounded-[20px]">
      <n-data-table
        class="ui-table__table flex-1 min-h-[clamp(200px,calc(100vh-140px),600px)]"
        :columns="ndtColumns"
        :data="data"
        :size="size"
        :row-key="rowKeyFn"
        :bordered="bordered"
        :single-column="!rowBorder"
        :single-line="!columnBorder"
        :striped="striped"
        :scroll-x="scrollX"
        :row-props="rowProps"
        :on-load="onLoad"
        flex-height
      />

      <div
        v-if="total !== null || slots.footer"
        class="rounded-b-2xl px-5"
        style="background: var(--table-header)"
      >
        <slot name="footer">
          <UIPagination
            :page="page"
            :per_page="perPage"
            :total="total"
            @change-page="(v) => emit('change-page', v)"
          />
        </slot>
      </div>
    </div>
  </n-spin>

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
  .ui-table__table :deep(.n-data-table-th:first-child) {
    border-top-left-radius: 16px !important;
  }

  .ui-table__table :deep(.n-data-table-th:last-child) {
    border-top-right-radius: 16px !important;
  }
</style>
