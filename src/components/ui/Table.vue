<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'

const props = defineProps({
  columns: {
    type: Array,
    required: true
    // { key, title, width, minWidth, maxWidth, align, fixed: 'left' | 'right', stickyOffset: number }
  },
  data: {
    type: Array,
    required: true
  },
  rowKey: {
    type: String,
    required: true
  },
  rowHeight: {
    type: Number,
    default: 48
  },
  maxHeight: {
    type: [Number, String],
    default: null
  },
  stickyOffsetLeft: {
    type: Number,
    default: 0
  },
  stickyOffsetRight: {
    type: Number,
    default: 0
  },
  bordered: {
    type: Boolean,
    default: true
  },
  rowBorder: {
    type: Boolean,
    default: true
  },
  columnBorder: {
    type: Boolean,
    default: false
  },
  striped: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['row-click'])

// Refs
const containerRef = ref(null)
const scrollTop = ref(0)
const containerHeight = ref(500)

// Buffer
const BUFFER_SIZE = 15

// Total height
const totalHeight = computed(() => props.data.length * props.rowHeight)

// Scroller style
const scrollerStyle = computed(() => {
  if (!props.maxHeight) return {}

  let maxHeight = props.maxHeight

  // Number bo'lsa px qo'shish
  if (typeof maxHeight === 'number') {
    maxHeight = `${maxHeight}px`
  }

  // calc() ichida probel yo'qligini to'g'irlash: calc(100vh-400px) -> calc(100vh - 400px)
  if (typeof maxHeight === 'string' && maxHeight.includes('calc')) {
    maxHeight = maxHeight.replace(/([+\-*/])/g, ' $1 ').replace(/\s+/g, ' ')
  }

  return { maxHeight }
})

// Visible range
const visibleRange = computed(() => {
  if (props.data.length === 0) {
    return { start: 0, end: 0 }
  }

  const height = containerHeight.value || 500
  const start = Math.max(0, Math.floor(scrollTop.value / props.rowHeight) - BUFFER_SIZE)
  const visibleCount = Math.ceil(height / props.rowHeight) + BUFFER_SIZE * 2
  const end = Math.min(props.data.length, start + visibleCount)

  return { start, end }
})

// Visible data
const visibleData = computed(() => {
  const { start, end } = visibleRange.value
  return props.data.slice(start, end).map((row, i) => ({
    row,
    index: start + i
  }))
})

// Offset Y
const offsetY = computed(() => visibleRange.value.start * props.rowHeight)

// Scroll handler
const onScroll = (e) => {
  scrollTop.value = e.target.scrollTop
}

// Flexible column
const flexibleColumnKey = computed(() => {
  const col = props.columns.find(c => !c.width)
  return col?.key || null
})

// Fixed columns - left va right
const fixedLeftColumns = computed(() => {
  return props.columns.filter(col => col.fixed === 'left')
})

const fixedRightColumns = computed(() => {
  return props.columns.filter(col => col.fixed === 'right')
})

// Fixed column left position hisoblash
const getFixedLeftOffset = (colIndex) => {
  const col = props.columns[colIndex]
  // Column o'zida stickyOffset bo'lsa, uni ishlatamiz
  if (col.stickyOffset !== undefined) {
    return col.stickyOffset
  }

  // Aks holda oldingi fixed columnlar width yig'indisi + global offset
  let offset = props.stickyOffsetLeft
  for (let i = 0; i < colIndex; i++) {
    const prevCol = props.columns[i]
    if (prevCol.fixed === 'left') {
      offset += prevCol.width || prevCol.minWidth || 100
    }
  }
  return offset
}

// Fixed column right position hisoblash
const getFixedRightOffset = (colIndex) => {
  const col = props.columns[colIndex]
  // Column o'zida stickyOffset bo'lsa, uni ishlatamiz
  if (col.stickyOffset !== undefined) {
    return col.stickyOffset
  }

  // Aks holda keyingi fixed columnlar width yig'indisi + global offset
  let offset = props.stickyOffsetRight
  for (let i = props.columns.length - 1; i > colIndex; i--) {
    const nextCol = props.columns[i]
    if (nextCol.fixed === 'right') {
      offset += nextCol.width || nextCol.minWidth || 100
    }
  }
  return offset
}

// Column style with fixed support
const getColumnStyle = (col, colIndex, isFlexible = false) => {
  const style = {}

  if (col.width) {
    style.width = typeof col.width === 'number' ? `${col.width}px` : col.width
    style.flexGrow = 0
    style.flexShrink = 0
  }

  if (col.minWidth) {
    style.minWidth = typeof col.minWidth === 'number' ? `${col.minWidth}px` : col.minWidth
  }

  if (col.maxWidth) {
    style.maxWidth = typeof col.maxWidth === 'number' ? `${col.maxWidth}px` : col.maxWidth
  }

  if (!col.width && isFlexible) {
    style.flex = 1
    if (!col.minWidth) {
      style.minWidth = '100px'
    }
  }

  if (!col.width && !isFlexible) {
    style.width = col.minWidth ? (typeof col.minWidth === 'number' ? `${col.minWidth}px` : col.minWidth) : '100px'
    style.flexShrink = 0
  }

  if (col.align) {
    style.textAlign = col.align
  }

  // Fixed positioning
  if (col.fixed === 'left') {
    style.position = 'sticky'
    style.left = `${getFixedLeftOffset(colIndex)}px`
    style.zIndex = 2
  }

  if (col.fixed === 'right') {
    style.position = 'sticky'
    style.right = `${getFixedRightOffset(colIndex)}px`
    style.zIndex = 2
  }

  return style
}

// Total min width
const totalMinWidth = computed(() => {
  return props.columns.reduce((sum, col) => {
    if (col.width) {
      return sum + (typeof col.width === 'number' ? col.width : parseInt(col.width) || 0)
    }
    return sum + (col.minWidth || 100)
  }, 0)
})

// Cell value
const getCellValue = (row, key) => {
  if (typeof key === 'string' && key.includes('.')) {
    return key.split('.').reduce((obj, k) => obj?.[k], row)
  }
  return row[key]
}

// Measure container
const measureContainer = () => {
  if (containerRef.value) {
    const height = containerRef.value.clientHeight
    if (height > 0) {
      containerHeight.value = height
    }
  }
}

// Resize observer
let resizeObserver = null

onMounted(() => {
  nextTick(() => {
    measureContainer()
  })

  // Kechikish bilan qayta o'lchash (CSS calc uchun)
  setTimeout(measureContainer, 100)

  if (containerRef.value) {
    resizeObserver = new ResizeObserver(() => {
      measureContainer()
    })
    resizeObserver.observe(containerRef.value)
  }

  window.addEventListener('resize', measureContainer)
})

onUnmounted(() => {
  resizeObserver?.disconnect()
  window.removeEventListener('resize', measureContainer)
})
</script>

<template>
  <div
      class="vtable"
      :class="{
      'vtable--bordered': bordered,
      'vtable--row-border': rowBorder,
      'vtable--col-border': columnBorder
    }"
  >
    <!-- Scroll container -->
    <div
        ref="containerRef"
        class="vtable__scroller"
        :style="scrollerStyle"
        @scroll.passive="onScroll"
    >
      <!-- Inner with min-width -->
      <div
          class="vtable__inner"
          :style="{ minWidth: `${totalMinWidth}px` }"
      >
        <!-- Header -->
        <div class="vtable__header">
          <div class="vtable__row vtable__row--header">
            <div
                v-for="(col, colIndex) in columns"
                :key="col.key"
                class="vtable__cell vtable__cell--header"
                :class="{
                'vtable__cell--fixed-left': col.fixed === 'left',
                'vtable__cell--fixed-right': col.fixed === 'right'
              }"
                :style="getColumnStyle(col, colIndex, col.key === flexibleColumnKey)"
            >
              <slot :name="`header-${col.key}`" :column="col">
                {{ col.title }}
              </slot>
            </div>
          </div>
        </div>

        <!-- Body -->
        <div class="vtable__body">
          <div class="vtable__spacer" :style="{ height: `${totalHeight}px` }">
            <div
                class="vtable__visible"
                :style="{ transform: `translateY(${offsetY}px)` }"
            >
              <div
                  v-for="{ row, index } in visibleData"
                  :key="row[rowKey]"
                  class="vtable__row"
                  :class="{ 'vtable__row--striped': striped && index % 2 === 1 }"
                  :style="{ height: `${rowHeight}px` }"
                  @click="emit('row-click', row, index)"
              >
                <div
                    v-for="(col, colIndex) in columns"
                    :key="col.key"
                    class="vtable__cell"
                    :class="{
                    'vtable__cell--fixed-left': col.fixed === 'left',
                    'vtable__cell--fixed-right': col.fixed === 'right'
                  }"
                    :style="getColumnStyle(col, colIndex, col.key === flexibleColumnKey)"
                >
                  <slot :name="`cell-${col.key}`" :row="row" :value="getCellValue(row, col.key)" :index="index">
                    {{ getCellValue(row, col.key) }}
                  </slot>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty -->
    <div v-if="data.length === 0" class="vtable__empty">
      <slot name="empty">Ma'lumot yo'q</slot>
    </div>
  </div>
</template>

<style>
.vtable {
  width: 100%;
  font-size: 14px;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
}

.vtable--bordered {
  border: 1px solid #e5e7eb;
}

.vtable__scroller {
  width: 100%;
  overflow: auto;
}

.vtable__inner {
  display: flex;
  flex-direction: column;
  min-width: 100%;
}

.vtable__header {
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
  position: sticky;
  top: 0;
  z-index: 10;
}

.vtable__body {
  position: relative;
}

.vtable__spacer {
  position: relative;
  width: 100%;
}

.vtable__visible {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  will-change: transform;
}

.vtable__row {
  display: flex;
  align-items: stretch;
  transition: background-color 0.15s;
}

.vtable--row-border .vtable__row {
  border-bottom: 1px solid #e5e7eb;
}

.vtable__row:not(.vtable__row--header):hover {
  background-color: #f9fafb;
  cursor: pointer;
}

.vtable__row--header {
  font-weight: 600;
  color: #374151;
}

.vtable__row--striped {
  background-color: #fafafa;
}

.vtable__cell {
  display: flex;
  align-items: center;
  padding: 0 16px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  box-sizing: border-box;
}

.vtable--col-border .vtable__cell {
  border-right: 1px solid #e5e7eb;
}

.vtable--col-border .vtable__cell:last-child {
  border-right: none;
}

.vtable__cell--header {
  padding: 12px 16px;
}

/* Fixed columns */
.vtable__cell--fixed-left,
.vtable__cell--fixed-right {
  background-color: #fff;
}

.vtable__row--header .vtable__cell--fixed-left,
.vtable__row--header .vtable__cell--fixed-right {
  background-color: #f9fafb;
}

.vtable__row--striped .vtable__cell--fixed-left,
.vtable__row--striped .vtable__cell--fixed-right {
  background-color: #fafafa;
}

.vtable__row:not(.vtable__row--header):hover .vtable__cell--fixed-left,
.vtable__row:not(.vtable__row--header):hover .vtable__cell--fixed-right {
  background-color: #f9fafb;
}

/* Fixed column borders */
.vtable--col-border .vtable__cell--fixed-left,
.vtable--col-border .vtable__cell--fixed-right {
  border-right: 1px solid #e5e7eb;
}

.vtable--col-border .vtable__cell--fixed-right:last-child {
  border-right: none;
}

/* Fixed column shadow */
.vtable__cell--fixed-left:last-of-type {
  box-shadow: 2px 0 4px rgba(0, 0, 0, 0.1);
}

.vtable__cell--fixed-right:first-of-type {
  box-shadow: -2px 0 4px rgba(0, 0, 0, 0.1);
}

.vtable__empty {
  padding: 48px 16px;
  text-align: center;
  color: #9ca3af;
}

.vtable__scroller::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.vtable__scroller::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.vtable__scroller::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

.vtable__scroller::-webkit-scrollbar-thumb:hover {
  background: #a1a1a1;
}

.vtable__scroller::-webkit-scrollbar-corner {
  background: #f1f1f1;
}
</style>