<script setup>
  import { ChevronRight16Regular, SelectAllOn24Regular } from '@vicons/fluent'

  const props = defineProps({
    data: {
      type: Array,
      default: () => []
    },
    deep: {
      type: Number,
      default: 1
    },
    short: {
      type: Boolean,
      default: false
    },
    modelV: { type: Array, default: () => [] },
    checkedVal: { type: Array, default: () => [] },
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
    highlight: { type: String, default: '' },
    // Ajdodlarning «oxirgi bola»ligi (ildizdan pastga) — chiziq qayerda tugashini belgilaydi.
    trail: { type: Array, default: () => [] }
  })

  // Chiziq ustuni: ajdod oxirgi bo'lmasa — davom etadi; o'z ustuni — «├» yoki «└».
  const guideClass = (i, idx) => {
    const own = i === props.deep - 1
    const last = own ? idx === props.data.length - 1 : props.trail[i]
    if (own) return last ? 'tso-guide--end' : 'tso-guide--tee'
    return last ? '' : 'tso-guide--pass'
  }

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
  // Yopiq shoxcha qatorlari DOM'da qoladi (animatsiya uchun) — klaviatura ularni o'tkazib yuboradi.
  const visibleRows = (el) =>
    [...(el.closest('[data-tree-root]')?.querySelectorAll(ROW) ?? [])].filter(
      (r) => r.getClientRects().length > 0 && !r.closest('.tso-children:not(.tso-children--open)')
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
        <!-- Ajdod darajalari: ota strelkasi ostidan chiqadigan «│ ├ └» chiziqlari -->
        <span
          v-for="i in deep - 1"
          :key="i"
          class="tso-guide"
          :class="[guideClass(i, idx), i === deep - 1 && !hasChildren(item) && 'tso-guide--leaf']"
          aria-hidden="true"
        ></span>

        <button
          v-if="hasChildren(item)"
          type="button"
          tabindex="-1"
          class="tso-chevron"
          :aria-label="isExpanded(item) ? 'collapse' : 'expand'"
          @click.stop="onOpen(item)"
        >
          <n-icon size="16">
            <ChevronRight16Regular
              class="tso-chevron__icon"
              :class="isExpanded(item) && 'tso-chevron__icon--open'"
            />
          </n-icon>
        </button>
        <span v-else class="tso-chevron tso-chevron--leaf" aria-hidden="true">
          <span v-if="deep === 1" class="tso-dot"></span>
        </span>

        <n-checkbox
          class="tso-check"
          :disabled="Boolean(item.group)"
          :checked="isSelected(item)"
          @click.stop="onSelect(item)"
        />

        <div class="tso-label">
          <slot name="label" :data="item">
            <span class="tso-text">
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

      <div
        v-if="hasChildren(item)"
        class="tso-children"
        :class="isExpanded(item) && 'tso-children--open'"
        :inert="!isExpanded(item) || undefined"
      >
        <div class="tso-children__inner">
        <TreeOrg
          :trail="[...trail, idx === data.length - 1]"
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
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
  .tso-row {
    --tso-line: var(--surface-line);
    position: relative;
    display: flex;
    /* Uzun nom bir necha qatorga bo'linadi — strelka, checkbox va tugma
       birinchi qator bilan bir chiziqda qoladi (har biri 20px balandlikda). */
    align-items: flex-start;
    gap: 6px;
    min-height: 28px;
    margin: 0;
    padding: 4px 6px 4px 4px;
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

  /* Ustun = strelka kengligi (20px): chiziq ota strelkasining aynan markazidan tushadi. */
  .tso-guide {
    position: relative;
    align-self: stretch;
    margin: -4px 0;
    width: 20px;
    flex-shrink: 0;
  }

  .tso-guide--pass::before,
  .tso-guide--tee::before,
  .tso-guide--end::before {
    content: '';
    position: absolute;
    left: 9.5px;
    top: 0;
    bottom: 0;
    width: 1px;
    background: var(--tso-line);
  }

  /* «└» — oxirgi bolada chiziq qator markazida tugaydi. */
  .tso-guide--end::before {
    bottom: auto;
    height: 14px;
  }

  /* Gorizontal tarmoq — strelkagacha (barg bo'lsa, uning o'rniga qadar). */
  .tso-guide--tee::after,
  .tso-guide--end::after {
    content: '';
    position: absolute;
    left: 9.5px;
    top: 14px;
    width: 14px;
    height: 1px;
    background: var(--tso-line);
  }

  .tso-guide--leaf::after {
    width: 22px;
  }

  /* Ochish/yopish: balandlik (grid 0fr→1fr) va shaffoflik birga — silliq. */
  .tso-children {
    display: grid;
    grid-template-rows: 0fr;
    opacity: 0;
    transition:
      grid-template-rows 0.24s cubic-bezier(0.22, 1, 0.36, 1),
      opacity 0.18s ease;
  }

  .tso-children--open {
    grid-template-rows: 1fr;
    opacity: 1;
  }

  .tso-children__inner {
    min-height: 0;
    overflow: hidden;
  }

  @media (prefers-reduced-motion: reduce) {
    .tso-children,
    .tso-chevron__icon {
      transition: none;
    }
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
    min-height: 20px;
    padding: 1px 0;
    font-size: 13px;
    line-height: 18px;
  }

  .tso-text {
    min-width: 0;
    overflow-wrap: anywhere;
  }

  .tso-check {
    flex-shrink: 0;
    height: 20px;
    display: inline-flex;
    align-items: center;
  }

  .tso-hit {
    padding: 0 1px;
    border-radius: 3px;
    color: inherit;
    background: color-mix(in srgb, var(--warning-color, #f0a020) 35%, transparent);
  }

  /* Faqat hover/fokusda ko'rinadi; shoxcha to'liq tanlangan bo'lsa — doim */
  .tso-branch {
    width: 20px;
    height: 20px;
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
