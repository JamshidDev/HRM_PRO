const STORAGE_PREFIX = 'table-columns:'

/**
 * Manages a table's visible columns and their order, persisted to localStorage.
 * `defaultColumnsSource` is the full set of customizable columns (each needs a unique `key`);
 * pass `{ key, visible: false }` for a column that should start hidden. It may be a plain
 * array, a ref, or a computed — pass a computed when column titles depend on the active
 * locale so they stay in sync with language switches.
 */
export function useTableColumns(storageKey, defaultColumnsSource) {
  const fullKey = `${STORAGE_PREFIX}${storageKey}`
  const getDefaultColumns = () => toValue(defaultColumnsSource)

  const readStoredOrder = () => {
    try {
      const parsed = JSON.parse(localStorage.getItem(fullKey))
      return Array.isArray(parsed) ? parsed : null
    } catch {
      return null
    }
  }

  const defaultOrder = () =>
    getDefaultColumns().map((c) => ({ key: c.key, visible: c.visible !== false }))

  const buildOrder = () => {
    const stored = readStoredOrder()
    if (!stored) return defaultOrder()

    const defaultKeys = new Set(getDefaultColumns().map((c) => c.key))
    const storedKeys = new Set(stored.map((s) => s.key))

    const merged = stored
      .filter((s) => defaultKeys.has(s.key))
      .map((s) => ({ key: s.key, visible: !!s.visible }))

    defaultOrder().forEach((c) => {
      if (!storedKeys.has(c.key)) merged.push(c)
    })

    return merged
  }

  const order = ref(buildOrder())

  watch(
    order,
    (v) => localStorage.setItem(fullKey, JSON.stringify(v)),
    { deep: true }
  )

  const metaByKey = computed(() => new Map(getDefaultColumns().map((c) => [c.key, c])))

  // Every customizable column, hidden ones included, in the user's chosen order.
  const allColumns = computed(() =>
    order.value
      .map((o) => {
        const meta = metaByKey.value.get(o.key)
        return meta ? { ...meta, visible: o.visible } : null
      })
      .filter(Boolean)
  )

  const setAllColumns = (next) => {
    order.value = next.map((c) => ({ key: c.key, visible: c.visible }))
  }

  // Visible-only columns, ready to hand to UITable.
  const columns = computed(() => allColumns.value.filter((c) => c.visible))

  const reset = () => {
    order.value = defaultOrder()
  }

  return { columns, allColumns, setAllColumns, reset }
}
