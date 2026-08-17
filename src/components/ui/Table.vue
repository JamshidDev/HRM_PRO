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
  import { useAppBreakpoints, useTableColumnFit, useTableColumns } from '@/composables/index.js'
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
    deleteWarning: { type: [String, Function], default: null }, // custom confirm message for the delete action; static or (row) => string
    // Bir sahifada bir nechta jadval ustma-ust turganda (masalan xodim profili):
    // jadval qolgan bo'sh joyni egallamaydi, balki qatorlari bo'yicha o'sadi.
    autoHeight: { type: Boolean, default: false },

    // ===== Mobil karta rejimi (opt-in) =====
    // `mobileBreakpoint` dan pastda `n-data-table` o'rniga stacked karta ro'yxati
    // chiziladi. Default O'CHIQ — bu propni bermaydigan sahifalar hech qanday
    // o'zgarish sezmaydi (yangi shox umuman ishga tushmaydi).
    mobileCards: { type: Boolean, default: false },
    // Karta sarlavhasi bo'ladigan ustun (default: birinchi ko'rinadigan ustun).
    mobilePrimaryKey: { type: String, default: null },
    // Shundan keyingi qatorlar «Batafsil» ostiga yashiriladi (0 = hammasi ochiq).
    mobileCollapseAfter: { type: Number, default: 4 },
    mobileBreakpoint: { type: String, default: 'md' }
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
  // Birinchi yuklanishda (ma'lumot hali yo'q) "Ma'lumot topilmadi" o'rniga skeleton
  // ko'rsatiladi — aks holda so'rov ketayotganda bo'sh holat chaqnab o'tadi.
  const showSkeleton = computed(() => props.loading && empty.value)
  const skeletonRows = computed(() => Math.min(props.perPage, 8))

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

  // Skeleton ustunlari haqiqiy ustun kengliklarini takrorlaydi, shunda yuklanish
  // tugagach jadval "sakramaydi". Kengligi yo'q ustunlar qolgan joyni teng bo'lishadi.
  const skeletonColStyle = (col) =>
    col.width ? { flex: `0 0 ${col.width}px` } : { flex: '1 1 0', minWidth: 0 }

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

  // ===== Mobil karta rejimi =====
  const { breakpoints } = useAppBreakpoints()
  const belowMobile = breakpoints.smaller(props.mobileBreakpoint)
  const useCards = computed(() => props.mobileCards && belowMobile.value)

  // Kartadagi ustunlar — desktop jadvali iste'mol qiladigan AYNAN o'sha to'plam
  // (`useTableColumns` natijasi). Ustun boshqaruvchisida ustun yoqilsa/o'chirilsa
  // karta ham darrov moslashadi; ikkita alohida ro'yxatni sinxron ushlash shart emas.
  const dataCols = computed(() => (tableColumns ? tableColumns.columns.value : props.columns))
  const primaryCol = computed(
    () => dataCols.value.find((c) => c.key === props.mobilePrimaryKey) ?? dataCols.value[0]
  )
  const cardCols = computed(() => dataCols.value.filter((c) => c.key !== primaryCol.value?.key))

  // `renderCell` ni (va u orqali `#cell-<key>` slotlarini) kartada QAYTA ISHLATISH
  // uchun barqaror funksional komponent. Identifikatori bir marta yaratiladi —
  // aks holda har render'da qayta mount bo'lib, ichidagi tooltip/dropdown holati
  // yo'qolardi.
  const MobileCell = (p) => renderCell(p.col, p.row, p.index)
  MobileCell.props = ['col', 'row', 'index']

  const expandedCards = reactive(new Set())
  const toggleCard = (key) =>
    expandedCards.has(key) ? expandedCards.delete(key) : expandedCards.add(key)

  const visibleCardCols = (rowKeyVal) =>
    props.mobileCollapseAfter > 0 && !expandedCards.has(rowKeyVal)
      ? cardCols.value.slice(0, props.mobileCollapseAfter)
      : cardCols.value

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
  <!-- Skeleton chizilayotganda spinner qo'shilmaydi (ikki xil yuklanish belgisi
       bo'lib ketmasligi uchun); mavjud ma'lumot ustidan qayta so'rov ketsa esa
       avvalgidek spinner ko'rinadi. -->
  <n-spin
    :show="loading && !empty"
    class="ui-table__spin"
    :class="!autoHeight && !useCards && 'h-full overflow-auto'"
  >
    <!-- Karta rejimidagi skeleton: ustun shaklidagi flex qatorlar bu yerda ma'nosiz
         (jadval yo'q), shu bois karta shaklidagi bloklar chiziladi. -->
    <div v-if="showSkeleton && useCards" class="flex flex-col gap-3">
      <n-skeleton v-for="i in 3" :key="`skc-${i}`" height="120px" class="rounded-2xl!" />
    </div>

    <div
      v-else-if="showSkeleton"
      class="ui-table__wrapper flex flex-col p-1 bg-surface-section rounded-[20px]"
      :class="!autoHeight && 'h-full min-h-[clamp(200px,calc(100vh-100%),600px)]'"
    >
      <div class="flex-1 overflow-hidden rounded-t-2xl">
        <div
          class="flex items-center gap-4 px-4 h-[42px] rounded-t-2xl"
          style="background: var(--table-header)"
        >
          <div v-for="col in allCols" :key="`sh-${col.key}`" :style="skeletonColStyle(col)">
            <n-skeleton height="12px" width="60%" round />
          </div>
        </div>

        <div
          v-for="row in skeletonRows"
          :key="`sr-${row}`"
          class="flex items-center gap-4 px-4 h-[48px] border-b border-surface-line"
        >
          <div v-for="col in allCols" :key="`sc-${row}-${col.key}`" :style="skeletonColStyle(col)">
            <n-skeleton height="14px" round />
          </div>
        </div>
      </div>

      <div
        v-if="total !== null || slots.footer"
        class="rounded-b-2xl px-5 h-[52px] flex items-center justify-end"
        style="background: var(--table-header)"
      >
        <n-skeleton height="16px" width="200px" round />
      </div>
    </div>

    <div v-else-if="empty" class="grid place-items-center" :class="!autoHeight && 'h-full'">
      <slot name="empty">
        <NoDataPicture />
      </slot>
    </div>

    <!-- ===== Mobil karta ro'yxati =====
         Jadval ~1280px talab qiladi, telefonda esa bu 3.4x gorizontal skroll.
         Kataklar `renderCell` orqali chiziladi, ya'ni `#cell-<key>` slotlari,
         `UIUser`/`UIGender` kabi komponentlar va amallar menyusi desktop bilan
         AYNAN bir xil ishlaydi — takror kod yo'q. -->
    <div v-else-if="useCards" class="ui-table__cards flex flex-col gap-3">
      <!-- Desktopda «barchasini tanlash» va ustun boshqaruvchisi `__index` /
           `__actions` sarlavhalarida turadi; mobilda bu ustunlar yo'q, shu bois
           ular alohida panelga chiqariladi. -->
      <div v-if="selectable || tableColumns" class="flex items-center gap-2 px-1">
        <template v-if="selectable">
          <UITableSelectRow :checked="allSelected" @toggle="emit('toggle-all')" />
          <span class="text-sm text-textColor2">{{ t('exportPage.checkAll') }}</span>
        </template>
        <UITableColumns
          v-if="tableColumns"
          class="ml-auto"
          :columns="tableColumns.allColumns.value"
          @update:columns="(v) => tableColumns.setAllColumns(v)"
          @reset="
            () => {
              resetColumnFit()
              tableColumns.reset()
            }
          "
        />
      </div>

      <div
        v-for="(row, index) in data"
        :key="row[rowKey]"
        class="flex flex-col gap-3 rounded-2xl border border-surface-line bg-surface-section p-3"
        :class="rowClassName?.(row, index)"
        @click="emit('row-click', row, index)"
      >
        <slot name="mobile-card" :row="row" :index="index">
          <div class="flex items-start gap-2">
            <UITableSelectRow
              v-if="selectable"
              class="mt-1 shrink-0"
              :checked="selectedKeys.includes(row[rowKey]) || allSelected"
              :disabled="allSelected"
              @toggle="emit('toggle-row', row)"
            />
            <span v-else class="mt-1 shrink-0 text-xs text-textColor3 tabular-nums">
              {{ indexOffset + index + 1 }}
            </span>

            <div class="min-w-0 flex-1">
              <MobileCell v-if="primaryCol" :col="primaryCol" :row="row" :index="index" />
            </div>

            <UITableActionsMenu
              v-if="rowActionsFor(row).length"
              class="shrink-0"
              :options="rowActionsFor(row)"
              :delete-warning="resolveDeleteWarning(row)"
              @select="(key, option) => onActionSelect(key, option, row)"
            />
          </div>

          <dl
            v-if="cardCols.length"
            class="grid grid-cols-[minmax(0,7.5rem)_minmax(0,1fr)] gap-x-3 gap-y-1.5"
          >
            <template v-for="col in visibleCardCols(row[rowKey])" :key="col.key">
              <dt class="truncate text-xs text-textColor3">{{ col.fullTitle || col.title }}</dt>
              <dd class="min-w-0 text-sm text-textColor1">
                <MobileCell :col="col" :row="row" :index="index" />
              </dd>
            </template>
          </dl>

          <n-button
            v-if="mobileCollapseAfter > 0 && cardCols.length > mobileCollapseAfter"
            text
            size="tiny"
            class="self-start"
            @click.stop="toggleCard(row[rowKey])"
          >
            {{
              expandedCards.has(row[rowKey])
                ? t('content.hideAdditionalFilters')
                : t('content.showAdditionalFilters')
            }}
          </n-button>

          <slot name="mobile-card-extra" :row="row" :index="index" />
        </slot>
      </div>

      <div
        v-if="total !== null || slots.footer"
        class="rounded-2xl px-3"
        style="background: var(--table-header)"
      >
        <slot name="footer">
          <UIPagination
            short
            :page="page"
            :per_page="perPage"
            :total="total"
            @change-page="(v) => emit('change-page', v)"
          />
        </slot>
      </div>
    </div>

    <div
      v-else
      ref="tableWrapperRef"
      class="ui-table__wrapper flex flex-col p-1 bg-surface-section rounded-[20px]"
      :class="!autoHeight && 'h-full min-h-[clamp(200px,calc(100vh-100%),600px)]'"
    >
      <n-data-table
        class="ui-table__table flex-1"
        :flex-height="!autoHeight"
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
  /* n-spin o'z kontentini balandligi bo'lmagan div ichiga o'raydi — shu sababli jadval
     o'ramidagi `h-full` hech qachon hal bo'lmay, `min-height` ustun kelardi va pagination
     konteyner tubiga emas, qatorlardan keyin osilib qolardi. Ota-element balandligi aniq
     bo'lmagan sahifalarda `height: 100%` `auto` ga aylanadi, ya'ni ular o'zgarishsiz qoladi. */
  .ui-table__spin :deep(.n-spin-content) {
    height: 100%;
  }

  .ui-table__table :deep(.n-data-table-table),
  .ui-table__table :deep(.n-data-table-th:first-child) {
    border-top-left-radius: 16px !important;
  }

  .ui-table__table :deep(.n-data-table-table),
  .ui-table__table :deep(.n-data-table-th:last-child) {
    border-top-right-radius: 16px !important;
  }
</style>
