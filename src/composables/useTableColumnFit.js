import { useElementSize } from '@vueuse/core'

/**
 * Keeps a table's columns fixed-width once they overflow the container (so they scroll),
 * and fluid once they fit (so they stretch to fill the space). `columnsRef` must include
 * every rendered column (index/actions columns included) with their `width`/`minWidth`.
 * `onResize(key, width)` is called (debounced) once a drag settles, e.g. to persist it.
 */
export function useTableColumnFit(columnsRef, { onResize } = {}) {
  const wrapperRef = ref(null)
  const { width: wrapperWidth } = useElementSize(wrapperRef)

  // Live drag width, so scrollX/isOverflowing track the cursor instead of snapping after release.
  const liveWidths = reactive({})
  const resizeTimers = {}
  // naive-ui caches drag-resized widths in a plain object keyed by column key, with no public way
  // to clear it — salting just that column's key on reset orphans the stale entry instead. Only
  // ever touches keys that were actually resized, so untouched columns never re-key/re-render.
  const resetVersions = reactive({})
  const SALT_SEP = '::reset::'

  const naturalWidth = (col) => liveWidths[col.key] ?? col.width ?? col.minWidth ?? 100
  const scrollX = computed(() => columnsRef.value.reduce((sum, c) => sum + naturalWidth(c), 0))
  const isOverflowing = computed(() => scrollX.value > wrapperWidth.value)

  const getKey = (col) => {
    const version = resetVersions[col.key]
    return version ? `${col.key}${SALT_SEP}${version}` : col.key
  }

  const getWidth = (col) => {
    const width = liveWidths[col.key] ?? col.width
    return isOverflowing.value ? (width ?? col.minWidth) : width
  }

  // Debounced so persisting doesn't hammer localStorage on every drag tick.
  const onUnstableColumnResize = (resizedWidth, limitedWidth, column) => {
    const key = String(column.key).split(SALT_SEP)[0]
    liveWidths[key] = limitedWidth
    clearTimeout(resizeTimers[key])
    resizeTimers[key] = setTimeout(() => {
      onResize?.(key, limitedWidth)
    }, 300)
  }

  const reset = () => {
    Object.values(resizeTimers).forEach(clearTimeout)
    Object.keys(liveWidths).forEach((key) => {
      resetVersions[key] = (resetVersions[key] ?? 0) + 1
      delete liveWidths[key]
    })
  }

  return { wrapperRef, scrollX, isOverflowing, getKey, getWidth, onUnstableColumnResize, reset }
}
