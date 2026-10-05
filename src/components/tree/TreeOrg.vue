<script setup>
  import { ChevronRight16Filled } from '@vicons/fluent'

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
    opened: { type: Boolean, default: false }
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

  const isCheck = (id) => {
    let idList = props.getChildIds(props.data, id).map((e) => e.id)
    const valList = props.modelV.map((a) => a.id)
    for (const id of idList) {
      if (!valList.includes(id)) {
        return false
      }
    }
    return true
  }

  const slot = useSlots()

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
    <template v-for="(item, idx) in data" :key="idx">
      <div
        data-tree-row
        :data-deep="deep"
        :data-selectable="String(!item.group)"
        role="treeitem"
        tabindex="-1"
        :aria-level="deep"
        :aria-selected="modelV.some((a) => a.id === item.id)"
        :aria-expanded="hasChildren(item) ? isExpanded(item) : undefined"
        :aria-disabled="item.group ? true : undefined"
        class="w-full flex cursor-pointer hover:bg-blue-50 ui__tree-hover outline-none focus-visible:bg-blue-50 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
        @keydown="onRowKeydown($event, item)"
      >
        <template v-if="deep > 1">
          <div
            v-for="(item, idx) in deep - 1"
            :key="idx"
            class="w-[20px] min-h-[20px] border__center-line"
          ></div>
        </template>

        <div
          v-if="Array.isArray(item?.children) && item?.children.length > 0"
          class="w-[20px] max-w-[20px] overflow-hidden flex justify-center items-center"
        >
          <n-icon @click="onOpen(item)" size="18" class="text-gray-400">
            <ChevronRight16Filled
              class="transition"
              :class="checkedVal.includes(item.id) && 'rotate-90'"
            />
          </n-icon>
        </div>
        <div
          v-else
          :class="'deep-' + deep"
          class="w-[20px] min-h-[20px] border__center-line border__center-content"
        ></div>

        <div
          @click="onSelect(item)"
          :style="{ width: `calc(100% - ${deep > 1 ? deep * 20 : 40}px)` }"
          class="leading-4 flex items-center"
        >
          <n-checkbox
            :disabled="Boolean(item.group)"
            :checked="modelV.map((a) => a.id).includes(item.id)"
            @click.stop="onSelect(item)"
          ></n-checkbox>
          <slot name="label" :data="item">
            <span class="text-xs ml-2"> {{ short ? item.code : item.name }}</span>
          </slot>
        </div>
        <div class="w-[20px] lex justify-center items-center">
          <n-radio
            v-if="Array.isArray(item?.children) && item?.children.length > 0 && multiple"
            @click.prevent="onSelectRadio(item)"
            :checked="isCheck(item.id)"
            :value="item.id"
            name="basic-demo"
          />
        </div>
      </div>
      <n-collapse-transition :show="checkedVal.includes(item.id) || opened">
        <TreeOrg
          :short="short"
          :deep="deep + 1"
          :opened="opened"
          :data="item?.children"
          :modelV="modelV"
          :checkedVal="checkedVal"
          :getChildIds="getChildIds"
          :changeCheckVal="changeCheckVal"
          :multiple="multiple"
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
