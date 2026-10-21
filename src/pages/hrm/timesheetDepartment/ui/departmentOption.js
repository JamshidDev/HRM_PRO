import { h } from 'vue'

// Bo'lim option'i: nomi, korxonasi va band bo'lsa — kimga biriktirilgani (ogohlantirish rangida).
export const renderDepartmentLabel = (option) =>
  h('div', { class: 'my-1 flex flex-col' }, [
    h('div', { class: 'text-xs font-medium text-textColor2 !text-wrap' }, option.name),
    option.position ? h('div', { class: 'text-xs text-textColor3 !text-wrap' }, option.position) : null,
    option.subPosition
      ? h(
          'div',
          { class: `text-xs !text-wrap ${option.takenByOther ? 'text-warning' : 'text-textColor3'}` },
          option.subPosition
        )
      : null
  ])
