<script setup>
  import {
    NoDataPicture,
    UIDeleteConfirm,
    UIPagination,
    UISortButton,
    UITableActionsMenu,
    UITableColumns,
    UITableSelectAll,
    UITableSelectRow
  } from '@/components/index.js'
  import { useTableColumnFit, useTableColumns } from '@/composables/index.js'
  import Utils from '@/utils/Utils.js'
  import i18n from '@/i18n/index.js'
  import { NEllipsis } from 'naive-ui'
  import { useAccountStore } from '@/store/modules/app/accountStore.js'

  const { t } = i18n.global
  const accStore = useAccountStore()

  defineOptions({ inheritAttrs: false })

  const props = defineProps({
    columns: { type: Array, required: true }, // [{ key, title, fullTitle, width, minWidth, maxWidth, className, resizable, ellipsis, align, fixed, sortable }]
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
    actions: { type: Array, default: () => [] }, // "..." menu + right-click options; visible/label/icon/disabled can be static or (row) => value
    // Amallar ustuniga sarlavha matni (masalan "Amallar"). Berilsa ustun kengayadi va
    // sarlavha o'rnida ustun sozlash tugmasi emas, shu matn ko'rinadi.
    actionsTitle: { type: String, default: null },
    // Ruxsat prefiksi (masalan "hr-workers"): standart edit/delete amallari mos
    // `-write`/`-delete` ruxsati bo'lmasa avtomatik disabled bo'ladi.
    permissionPrefix: { type: String, default: null },
    storageKey: { type: String, default: null }, // persists column visibility/order/width
    onLoad: { type: Function, default: null }, // async tree children loader: (row) => Promise<void>
    rowClassName: { type: Function, default: null }, // (row, index) => string
    sortBy: { type: String, default: null }, // current sort field, paired with a column's { sortable: true }
    sortOrder: { type: Number, default: 1 }, // 1 | -1
    deleteWarning: { type: [String, Function], default: null } // custom confirm message for the delete action; static or (row) => string
  })

  const emit = defineEmits([
    'row-click',
    'row-contextmenu',
    'action',
    'toggle-row',
    'toggle-all',
    'change-page',
    'sort' // (key) — fired when a { sortable: true } column's header is clicked
  ])

  const slots = useSlots()
  const instance = getCurrentInstance()
  const empty = computed(() => props.data.length === 0)

  // avoids naive-ui misreading a row's own domain `children` field as tree-row nesting when we never asked for tree mode
  const isTreeTable = computed(() => Boolean(props.onLoad) || props.columns.some((c) => c.tree))
  const childrenKey = computed(() => (isTreeTable.value ? 'children' : '__uiTableNoChildren'))

  const tableColumns = props.storageKey
    ? useTableColumns(
        props.storageKey,
        computed(() => props.columns)
      )
    : null

  const getCellValue = (row, key) =>
    key.includes?.('.') ? key.split('.').reduce((o, k) => o?.[k], row) : row[key]

  const visibleActions = computed(() => props.actions.filter((a) => a.visible !== false))
  // row can be undefined before any delete is triggered, since this is evaluated eagerly in the template
  const resolveDeleteWarning = (row) =>
    typeof props.deleteWarning === 'function'
      ? row
        ? props.deleteWarning(row)
        : null
      : props.deleteWarning

  /**
   * `permissionPrefix` berilsa, standart amallar (`Utils.ActionTypes.edit` va
   * `.delete`) mos ruxsat bo'lmasa avtomatik KULRANG bo'ladi (yashirilmaydi —
   * foydalanuvchi imkoniyat borligini ko'rib, admindan so'ray olsin).
   *
   * Amal obyektida `disabled` aniq berilgan bo'lsa, u avtomatikadan ustun turadi —
   * nostandart amallarni (`confirm`, `finish`, ...) o'z slug'iga bog'lash uchun.
   */
  const autoDisabled = (a) => {
    if (!props.permissionPrefix) return false
    if (a.key === Utils.ActionTypes.delete)
      return !accStore.checkPermission(`${props.permissionPrefix}-delete`)
    if (a.key === Utils.ActionTypes.edit)
      return !accStore.checkPermission(`${props.permissionPrefix}-write`)
    return false
  }

  const rowActionsFor = (row) =>
    visibleActions.value
      .filter((a) => (typeof a.visible === 'function' ? a.visible(row) : true))
      .map((a) => ({
        ...a,
        label: typeof a.label === 'function' ? a.label(row) : a.label,
        // icon is normally a 0-arg naive-ui render-prop (UIHelper.renderIcon result); only a (row) => ... accessor takes an arg
        icon: typeof a.icon === 'function' && a.icon.length > 0 ? a.icon(row) : a.icon,
        disabled:
          a.disabled !== undefined
            ? typeof a.disabled === 'function'
              ? a.disabled(row)
              : a.disabled
            : autoDisabled(a)
      }))
  const indexOffset = computed(() => (props.page - 1) * props.perPage)

  const allCols = computed(() => {
    const cols = [...(tableColumns ? tableColumns.columns.value : props.columns)]
    if (props.showIndex) {
      cols.unshift({ key: '__index', width: 56, align: 'center', fixed: 'left' })
    }
    if (visibleActions.value.length || tableColumns) {
      cols.push({
        key: '__actions',
        width: props.actionsTitle ? 100 : 56,
        align: 'center',
        fixed: 'right'
      })
    }
    return cols
  })

  const {
    wrapperRef: tableWrapperRef,
    scrollX,
    getKey,
    getWidth,
    onUnstableColumnResize,
    reset: resetColumnFit
  } = useTableColumnFit(allCols, {
    onResize: (key, width) => tableColumns?.setColumnWidth(key, width)
  })

  const ndtColumns = computed(() => {
    return allCols.value.map((col) => {
      return {
        key: getKey(col),
        width: getWidth(col),
        minWidth: col.minWidth ?? col.width,
        maxWidth: col.maxWidth,
        className: col.className,
        resizable: col.resizable ?? true,
        ellipsis:
          col.ellipsis ??
          (slots[`cell-${col.key}`] || col.render
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
      }
    })
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
    if (props.actionsTitle) return renderHeaderLabel({ title: props.actionsTitle })
    if (!tableColumns) return null
    return h(UITableColumns, {
      columns: tableColumns.allColumns.value,
      'onUpdate:columns': (v) => tableColumns.setAllColumns(v),
      onReset: () => {
        resetColumnFit()
        tableColumns.reset()
      }
    })
  }

  const renderHeaderLabel = (col) =>
    h(
      NEllipsis,
      {
        class: 'text-sm text-textColor2 w-full leading-[1.2]',
        tooltip: { style: { maxWidth: '300px' } }
      },
      { default: () => col.title }
    )

  const renderSortableHeader = (col) =>
    h(
      UISortButton,
      {
        by: col.key,
        value: props.sortBy,
        order: props.sortOrder,
        onClick: () => emit('sort', col.key)
      },
      { default: () => renderHeaderLabel(col) }
    )

  const renderHeader = (col) => {
    const slotName = `header-${col.key}`
    if (slots[slotName]) return slots[slotName]({ column: col })
    if (col.key === '__index') return renderIndexHeader()
    if (col.key === '__actions') return renderActionsHeader()
    if (col.sortable) return renderSortableHeader(col)
    if (typeof col.title !== 'string') return col.title
    return renderHeaderLabel(col)
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
      const rowActions = rowActionsFor(row)
      if (!rowActions.length) return null
      return h(UITableActionsMenu, {
        options: rowActions,
        deleteWarning: resolveDeleteWarning(row),
        onSelect: (key, option) => onActionSelect(key, option, row)
      })
    }

    if (col.render) return col.render(row, index)

    return getCellValue(row, col.key)
  }

  const rowProps = (row, index) => ({
    onClick: () => emit('row-click', row, index),
    onContextmenu: (e) => onRowContextmenu(e, row, index),
    style: instance.vnode.props?.onRowClick ? 'cursor: pointer' : undefined
  })

  const contextMenu = reactive({ show: false, x: 0, y: 0, row: null })

  const contextMenuActions = computed(() => (contextMenu.row ? rowActionsFor(contextMenu.row) : []))

  const onRowContextmenu = (e, row, index) => {
    emit('row-contextmenu', e, row, index)
    if (!rowActionsFor(row).length) return
    e.preventDefault()
    contextMenu.row = row
    contextMenu.show = false
    nextTick().then(() => {
      contextMenu.show = true
      contextMenu.x = e.clientX
      contextMenu.y = e.clientY
    })
  }

  const pendingDelete = ref(null)
  const deleteConfirmVisible = ref(false)

  const onSelectContextAction = (key, option) => {
    contextMenu.show = false
    if (key === Utils.ActionTypes.delete) {
      pendingDelete.value = { key, option, row: contextMenu.row }
      deleteConfirmVisible.value = true
      return
    }
    onActionSelect(key, option, contextMenu.row)
  }

  const onConfirmDelete = () => {
    deleteConfirmVisible.value = false
    const pending = pendingDelete.value
    pendingDelete.value = null
    if (pending) onActionSelect(pending.key, pending.option, pending.row)
  }
</script>

<template>
  <n-spin :show="loading" class="h-full overflow-auto">
    <div v-if="empty" class="h-full grid place-items-center">
      <NoDataPicture />
    </div>

    <div
      v-else
      ref="tableWrapperRef"
      class="ui-table__wrapper h-full min-h-[clamp(200px,calc(100vh-100%),600px)] flex flex-col p-1 bg-surface-section rounded-[20px]"
    >
      <n-data-table
        class="ui-table__table flex-1"
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
        :row-class-name="rowClassName"
        :on-load="onLoad"
        :children-key="childrenKey"
        flex-height
        @unstable-column-resize="onUnstableColumnResize"
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
    v-if="contextMenuActions.length"
    size="small"
    placement="bottom-start"
    trigger="manual"
    :x="contextMenu.x"
    :y="contextMenu.y"
    :options="contextMenuActions"
    :show="contextMenu.show"
    :on-clickoutside="() => (contextMenu.show = false)"
    @select="onSelectContextAction"
  />

  <UIDeleteConfirm
    v-model:visible="deleteConfirmVisible"
    :warning="resolveDeleteWarning(pendingDelete?.row)"
    @confirm="onConfirmDelete"
  />
</template>

<style scoped>
  .ui-table__table :deep(.n-data-table-table),
  .ui-table__table :deep(.n-data-table-th:first-child) {
    border-top-left-radius: 16px !important;
  }

  .ui-table__table :deep(.n-data-table-table),
  .ui-table__table :deep(.n-data-table-th:last-child) {
    border-top-right-radius: 16px !important;
  }
</style>
