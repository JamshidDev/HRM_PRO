<script setup>
  import { ChevronRight16Regular, SelectAllOn24Regular } from '@vicons/fluent'

  const props = defineProps({
    data: {
      type: Array,
      default: []
    },
    deep: {
      type: Number,
      default: 1
    },
    short: {
      type: Boolean,
      default: false
    },
    modelV: { type: Array, default: [] },
    checkedVal: { type: Array, default: [] },
    getChildIds: {
      type: Function,
      required: true
    },
    changeCheckVal: {
      type: Function,
      required: true
    },
    multiple: { type: Boolean, default: false },
    opened: { type: Boolean, default: false },
    // Qidiruv matni — nomdagi mos qism belgilanadi (default label'da).
    highlight: { type: String, default: '' }
  })

  const emits = defineEmits(['onSelect', 'onSelectAll'])

  const onSelect = (v) => {
    if (!v.group) {
      emits('onSelect', v)
    }
  }

  const onOpen = (v) => {
    props.changeCheckVal(v)
  }

  const onSelectRadio = (v) => {
    emits('onSelectAll', v)
  }

  const selectedIds = computed(() => new Set(props.modelV.map((a) => a.id)))
  const isSelected = (item) => selectedIds.value.has(item.id)

  // Shoxcha holati (tugun + barcha avlodlari): 'all' | 'some' | 'none'.
  // "Shoxchani tanlash" tugmasining faol holati shundan. Ota checkbox'iga
  // "qisman" belgisi qo'yilmaydi — bola tanlansa ota tanlangandek ko'rinmasin.
  const branchState = (item) => {
    let total = 0
    let hit = 0
    const walk = (node) => {
      total++
      if (selectedIds.value.has(node.id)) hit++
      for (const child of node.children || []) walk(child)
    }
    walk(item)
    if (hit === 0) return 'none'
    return hit === total ? 'all' : 'some'
  }

  const slot = useSlots()

  // Matnni [{ text, hit }] bo'laklariga ajratadi (katta-kichik harf farqsiz).
  const parts = (text) => {
    const q = props.highlight?.trim()
    if (!q || !text) return [{ text, hit: false }]
    const lower = String(text).toLocaleLowerCase()
    const needle = q.toLocaleLowerCase()
    const out = []
    let from = 0
    let at = lower.indexOf(needle)
    while (at !== -1) {
      if (at > from) out.push({ text: text.slice(from, at), hit: false })
      out.push({ text: text.slice(at, at + needle.length), hit: true })
      from = at + needle.length
      at = lower.indexOf(needle, from)
    }
    if (from < text.length) out.push({ text: text.slice(from), hit: false })
    return out
  }

  // ♿ Klaviatura (qatorlar `tabindex="-1"` — ular orasida ↑/↓ bilan
  // composables/useTreePopoverKeyboard.js yuradi, bu yerda qator amallari):
  //   Enter / Space — tanlash, Shift+Enter — barcha ichki bo'linmalarni tanlash
  //   → — ochish, ochiq bo'lsa birinchi ichki qatorga o'tish
  //   ← — yopish, yopiq bo'lsa ota qatorga o'tish
  const hasChildren = (item) => Array.isArray(item?.children) && item.children.length > 0
  const isExpanded = (item) => props.opened || props.checkedVal.includes(item.id)

  const ROW = '[data-tree-row]'
  const visibleRows = (el) =>
    [...(el.closest('[data-tree-root]')?.querySelectorAll(ROW) ?? [])].filter(
      (r) => r.getClientRects().length > 0
    )

  const onRowKeydown = (e, item) => {
    const row = e.currentTarget
    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault()
        if (e.shiftKey && props.multiple && hasChildren(item)) onSelectRadio(item)
        else onSelect(item)
        break
      case 'ArrowRight':
        if (!hasChildren(item)) return
        e.preventDefault()
        if (!isExpanded(item)) onOpen(item)
        else {
          const rows = visibleRows(row)
          rows[rows.indexOf(row) + 1]?.focus()
        }
        break
      case 'ArrowLeft': {
        e.preventDefault()
        if (hasChildren(item) && isExpanded(item) && !props.opened) {
          onOpen(item)
          break
        }
        const rows = visibleRows(row)
        const parent = rows
          .slice(0, rows.indexOf(row))
          .reverse()
          .find((r) => Number(r.dataset.deep) === props.deep - 1)
        parent?.focus()
        break
      }
    }
  }
</script>

<template>
  <div
    :role="deep === 1 ? 'tree' : 'group'"
    :data-tree-root="deep === 1 ? '' : undefined"
    :aria-multiselectable="deep === 1 ? multiple : undefined"
  >
    <template v-for="(item, idx) in data" :key="item.id ?? idx">
      <div
        data-tree-row
        :data-deep="deep"
        :data-selectable="String(!item.group)"
        role="treeitem"
        tabindex="-1"
        :aria-level="deep"
        :aria-selected="isSelected(item)"
        :aria-expanded="hasChildren(item) ? isExpanded(item) : undefined"
        :aria-disabled="item.group ? true : undefined"
        class="tso-row"
        :class="[isSelected(item) && 'tso-row--selected', item.group && 'tso-row--group']"
        @click="onSelect(item)"
        @keydown="onRowKeydown($event, item)"
      >
        <!-- Ajdod darajalari: har biri 18px ustun, o'rtasida ingichka chiziq -->
        <span v-for="i in deep - 1" :key="i" class="tso-guide" aria-hidden="true"></span>

        <button
          v-if="hasChildren(item)"
          type="button"
          tabindex="-1"
          class="tso-chevron"
          :aria-label="isExpanded(item) ? 'collapse' : 'expand'"
          @click.stop="onOpen(item)"
        >
          <n-icon size="14">
            <ChevronRight16Regular
              class="tso-chevron__icon"
              :class="isExpanded(item) && 'tso-chevron__icon--open'"
            />
          </n-icon>
        </button>
        <span v-else class="tso-chevron tso-chevron--leaf" aria-hidden="true">
          <span class="tso-dot"></span>
        </span>

        <n-checkbox
          class="shrink-0"
          :disabled="Boolean(item.group)"
          :checked="isSelected(item)"
          @click.stop="onSelect(item)"
        />

        <div class="tso-label">
          <slot name="label" :data="item">
            <span class="truncate" :title="short ? item.code : item.name">
              <template v-for="(p, pi) in parts(short ? item.code : item.name)" :key="pi">
                <mark v-if="p.hit" class="tso-hit">{{ p.text }}</mark>
                <template v-else>{{ p.text }}</template>
              </template>
            </span>
          </slot>
        </div>

        <!-- Shoxchani to'liq tanlash/olib tashlash (Shift+Enter bilan ham) -->
        <button
          v-if="multiple && hasChildren(item)"
          type="button"
          tabindex="-1"
          class="tso-branch"
          :class="branchState(item) === 'all' && 'tso-branch--active'"
          :title="$t('content.selectAll')"
          :aria-label="$t('content.selectAll')"
          @click.stop="onSelectRadio(item)"
        >
          <n-icon size="16"><SelectAllOn24Regular /></n-icon>
        </button>
      </div>

      <n-collapse-transition :show="isExpanded(item)">
        <TreeOrg
          v-if="hasChildren(item)"
          :short="short"
          :deep="deep + 1"
          :opened="opened"
          :data="item.children"
          :modelV="modelV"
          :checkedVal="checkedVal"
          :getChildIds="getChildIds"
          :changeCheckVal="changeCheckVal"
          :multiple="multiple"
          :highlight="highlight"
          @onSelect="onSelect"
          @onSelectAll="onSelectRadio"
        >
          <template #label="{ data }" v-if="slot.label">
            <slot name="label" :data="data"></slot>
          </template>
        </TreeOrg>
      </n-collapse-transition>
    </template>
  </div>
</template>

<style scoped>
  .tso-row {
    --tso-line: var(--surface-line);
    position: relative;
    display: flex;
    align-items: center;
    gap: 6px;
    min-height: 28px;
    margin: 0;
    padding: 0 6px 0 4px;
    border-radius: 8px;
    cursor: pointer;
    outline: none;
    color: var(--textColor1);
    transition: background-color 0.12s ease;
  }

  .tso-row:hover {
    background: var(--surface-ground);
  }

  .tso-row:focus-visible {
    background: var(--surface-ground);
    box-shadow: inset 0 0 0 2px var(--primary-color);
  }

  .tso-row--selected,
  .tso-row--selected:hover {
    background: color-mix(in srgb, var(--primary-color) 9%, transparent);
  }

  .tso-row--selected .tso-label {
    color: var(--primary-color);
    font-weight: 500;
  }

  .tso-row--group {
    cursor: default;
  }

  .tso-row--group .tso-label {
    color: var(--textColor2);
    font-weight: 600;
  }

  .tso-guide {
    position: relative;
    align-self: stretch;
    width: 18px;
    flex-shrink: 0;
  }

  .tso-guide::before {
    content: '';
    position: absolute;
    left: 50%;
    top: 0;
    bottom: 0;
    width: 1px;
    background: var(--tso-line);
  }

  .tso-chevron {
    width: 20px;
    height: 20px;
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 6px;
    color: var(--textColor3);
    transition:
      color 0.12s ease,
      background-color 0.12s ease;
  }

  button.tso-chevron:hover {
    color: var(--primary-color);
    background: color-mix(in srgb, var(--primary-color) 12%, transparent);
  }

  .tso-chevron__icon {
    transition: transform 0.18s cubic-bezier(0.22, 1, 0.36, 1);
  }

  .tso-chevron__icon--open {
    transform: rotate(90deg);
  }

  .tso-dot {
    width: 4px;
    height: 4px;
    border-radius: 9999px;
    background: var(--tso-line);
  }

  .tso-label {
    flex: 1;
    min-width: 0;
    display: flex;
    align-items: center;
    font-size: 13px;
    line-height: 1.3;
  }

  .tso-hit {
    padding: 0 1px;
    border-radius: 3px;
    color: inherit;
    background: color-mix(in srgb, var(--warning-color, #f0a020) 35%, transparent);
  }

  /* Faqat hover/fokusda ko'rinadi; shoxcha to'liq tanlangan bo'lsa — doim */
  .tso-branch {
    width: 22px;
    height: 22px;
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 6px;
    color: var(--textColor3);
    opacity: 0;
    transition:
      opacity 0.12s ease,
      color 0.12s ease,
      background-color 0.12s ease;
  }

  .tso-row:hover .tso-branch,
  .tso-row:focus-visible .tso-branch,
  .tso-branch--active {
    opacity: 1;
  }

  .tso-branch:hover {
    color: var(--primary-color);
    background: color-mix(in srgb, var(--primary-color) 12%, transparent);
  }

  .tso-branch--active {
    color: var(--primary-color);
  }

  @media (hover: none) {
    .tso-branch {
      opacity: 1;
    }
  }
</style>
