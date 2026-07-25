<script setup>
  import { useElementBounding, useMediaQuery, useWindowSize } from '@vueuse/core'
  import {
    NoDataPicture,
    UIPagination,
    UITableColumns,
    UITableSelectAll,
    UITableSelectRow,
    UITableActionsMenu
  } from '@/components/index.js'
  import { useTableColumns } from '@/composables/index.js'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global

  const props = defineProps({
    // [{ key, title, fullTitle, width, minWidth, maxWidth, align, fixed, resizable }].
    // Table uses a fixed layout: give a column `width` to pin its exact size, or only
    // `minWidth` to let it grow into any leftover space (never below that floor, since
    // the table's min-width already spans every column and scrolls instead of shrinking it).
    columns: { type: Array, required: true },
    data: { type: Array, required: true },
    rowKey: { type: String, default: 'id' },
    bordered: { type: Boolean, default: false },
    columnBorder: { type: Boolean, default: false },
    rowBorder: { type: Boolean, default: false },
    striped: { type: Boolean, default: true },

    loading: { type: Boolean, default: false },
    // Space to leave below the card, clearing the page wrapper's own padding.
    bottomGap: { type: Number, default: 28 },

    showIndex: { type: Boolean, default: true },
    page: { type: Number, default: 1 },
    perPage: { type: Number, default: 0 },
    total: { type: Number, default: null }, // renders the pagination footer when set
    selectable: { type: Boolean, default: false }, // swaps the row-number for a checkbox
    selectedKeys: { type: Array, default: () => [] },
    allSelected: { type: Boolean, default: false },

    actions: { type: Array, default: () => [] }, // "..." menu + right-click context menu options
    // Persists column visibility/order to localStorage under this key and renders the settings button.
    storageKey: { type: String, default: null }
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

  const cardRef = ref(null)
  const isTabletUp = useMediaQuery('(min-width: 768px)')
  const { top, update } = useElementBounding(cardRef, { windowScroll: false })
  const { height: windowHeight } = useWindowSize()

  // Fixed height (not a cap) so the footer stays pinned to the bottom
  // regardless of row count. Tablet+ only; mobile keeps normal page scroll.
  const cardHeight = computed(() => {
    if (!isTabletUp.value) return null
    return `${Math.max(windowHeight.value - top.value - props.bottomGap, 200)}px`
  })

  // Re-measure once layout above the card (e.g. filters) settles after mount.
  onMounted(() => setTimeout(update, 100))

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

  const ndtColumns = computed(() =>
    allCols.value.map((col) => ({
      key: col.key,
      width: col.width,
      minWidth: col.minWidth,
      maxWidth: col.maxWidth,
      resizable: col.resizable,
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

  const onSelectContextAction = (key, option) => {
    contextMenu.show = false

    onActionSelect(key, option, contextMenu.row)
  }
</script>

<template>
  <n-spin :show="loading">
    <div
      v-if="!empty"
      ref="cardRef"
      class="flex flex-col p-1 bg-surface-section rounded-[20px]"
      :style="cardHeight ? { height: cardHeight, overflow: 'hidden' } : {}"
    >
      <n-data-table
        class="ui-table__table flex-1"
        :columns="ndtColumns"
        :data="data"
        :row-key="rowKeyFn"
        :bordered="bordered"
        :single-column="!rowBorder"
        :single-line="!columnBorder"
        :striped="striped"
        :scroll-x="scrollX"
        table-layout="fixed"
        :flex-height="!!cardHeight"
        :row-props="rowProps"
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

    <NoDataPicture v-if="empty" />
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
