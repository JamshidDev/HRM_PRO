import { Comment, Fragment, defineComponent, h, ref, resolveComponent } from 'vue'
import RubberSegment from './RubberSegment.vue'
import { RUBBER_SIZE, RUBBER_THEME } from './rubberSegmentTheme.js'

/**
 * `n-tabs` o'rnini bosuvchi o'ram: sarlavha RubberSegment bo'lib chiziladi,
 * panellar esa odatdagi `n-tabs` (navi yashirilgan) ichida qoladi.
 *
 * Ichida `n-tab-pane` ham, panelsiz `n-tab` ham ishlaydi — xuddi n-tabs'dagidek:
 *   <UITabs v-model:value="tab" size="small">
 *     <n-tab-pane name="a" :tab="$t('...')">...</n-tab-pane>
 *     <n-tab name="b">...</n-tab>
 *     <template #suffix>...</template>
 *   </UITabs>
 *
 * `class`/`style` — tashqi o'ramga, qolgan atributlar (`animated`, `pane-class`,
 * `pane-wrapper-class` ...) — ichki n-tabs'ga uzatiladi.
 */

const PANE_NAMES = ['TabPane', 'Tab']

const flatten = (nodes, out = []) => {
  for (const node of nodes || []) {
    if (!node || typeof node !== 'object') continue
    if (node.type === Fragment) flatten(node.children, out)
    else if (node.type !== Comment) out.push(node)
  }
  return out
}

const isTabNode = (node) => PANE_NAMES.includes(node.type?.name)

const readTab = (node) => {
  const p = node.props || {}
  const slots = node.children && typeof node.children === 'object' ? node.children : {}
  const isPane = node.type.name === 'TabPane'
  // n-tab-pane: `#tab` sloti; n-tab: default slot — ikkalasi ham label
  const labelSlot = slots.tab || (!isPane ? slots.default : null)
  const tab = p.tab
  return {
    name: p.name,
    // Bo'sh `<n-tab-pane />` — faqat almashtirgich, panel maydoni chizilmaydi
    isPane: isPane && !!slots.default,
    label: typeof tab === 'string' || typeof tab === 'number' ? String(tab) : '',
    render: labelSlot ? () => labelSlot() : typeof tab === 'function' ? tab : undefined,
    disabled: p.disabled === '' || !!p.disabled
  }
}

export default defineComponent({
  name: 'UITabs',
  inheritAttrs: false,
  props: {
    value: { type: [String, Number], default: undefined },
    defaultValue: { type: [String, Number], default: undefined },
    size: { type: String, default: 'medium' },
    equalSlots: { type: Boolean, default: true },
    draggable: { type: Boolean, default: true },
    disabled: { type: Boolean, default: false },
    ariaLabel: { type: String, default: undefined }
  },
  emits: ['update:value'],
  setup(props, { slots, attrs, emit }) {
    const inner = ref(props.defaultValue)

    return () => {
      const NTabs = resolveComponent('n-tabs')
      const tabs = flatten(slots.default?.()).filter(isTabNode).map(readTab)
      const fallback = tabs.find((t) => !t.disabled)?.name
      const current =
        props.value !== undefined ? props.value : inner.value !== undefined ? inner.value : fallback

      const items = tabs.map((t) => ({
        value: String(t.name),
        label: t.label,
        render: t.render,
        disabled: t.disabled
      }))

      const onChange = (_, index) => {
        const name = tabs[index]?.name
        inner.value = name
        emit('update:value', name)
      }

      const { class: cls, style, type: _type, ...rest } = attrs

      const header = h('div', { class: 'ui-tabs__header' }, [
        slots.prefix?.(),
        h('div', { class: 'ui-tabs__scroller' }, [
          h(RubberSegment, {
            ...RUBBER_THEME,
            items,
            value: current === undefined ? undefined : String(current),
            size: RUBBER_SIZE[props.size] || 'md',
            equalSlots: props.equalSlots,
            draggable: props.draggable,
            disabled: props.disabled,
            ariaLabel: props.ariaLabel,
            onChange
          })
        ]),
        slots.suffix ? h('div', { class: 'ui-tabs__suffix' }, slots.suffix()) : null
      ])

      const hasPanes = tabs.some((t) => t.isPane)
      const panes = hasPanes
        ? h(
            NTabs,
            { ...rest, type: 'line', value: current, class: 'ui-tabs__panes' },
            { default: () => slots.default?.() }
          )
        : null

      return h('div', { class: ['ui-tabs', cls], style }, [header, panes])
    }
  }
})
