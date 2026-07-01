import { NAvatar, NIcon } from 'naive-ui'
import { DismissCircle20Filled } from '@vicons/fluent'
import Utils from '@utils/Utils.js'

const scheduleLabel = (option) => {
  return [
    h(
      'div',
      {
        class: 'w-full mb-2'
      },
      [
        h('div', { class: 'flex flex-col w-full' }, [
          h('div', { class: 'text-xs font-medium text-gray-500' }, `${option.name}`),
          ...option.work_days.map((day) =>
            h(
              'div',
              { class: 'text-xs text-gray-400 w-full' },
              `(${day.day_of_week}) ${day.start_time} - ${day.end_time}`
            )
          )
        ])
      ]
    )
  ]
}

const scheduleValue = ({ option }) => {
  return h(
    'div',
    {
      class: 'flex'
    },
    [h('div', { class: 'text-sm font-medium' }, option.name)]
  )
}

export const renderIcon = (icon) => {
  return () => {
    return h(NIcon, null, {
      default: () => h(icon)
    })
  }
}

const selectLabel = (option) => {
  return [
    h(
      'div',
      {
        class: 'flex gap-2 my-1 items-center'
      },
      [
        h('div', { class: 'flex flex-col' }, [
          h('div', { class: 'text-xs font-medium text-textColor2 !text-wrap' }, `${option.name}`),
          h('div', { class: 'text-xs text-textColor3 !text-wrap' }, option.position),
          option.subPosition
            ? h('div', { class: 'text-xs text-textColor3 !text-wrap' }, option.subPosition)
            : null
        ])
      ]
    )
  ]
}

const selectColorLabel = (option) => {
  return [
    h(
      'div',
      {
        class: 'flex gap-2 my-1 items-center'
      },
      [
        h('div', { class: 'flex flex-col' }, [
          h('div', { class: `text-xs font-medium !text-wrap ${option.color}` }, `${option.name}`),
          h('div', { class: 'text-xs text-textColor3 !text-wrap' }, option.position),
          option.subPosition
            ? h('div', { class: 'text-xs text-textColor3' }, option.subPosition)
            : null
        ])
      ]
    )
  ]
}

const selectValue = ({ option }) => {
  return [
    h(
      'span',
      {
        class: '!truncate cursor-pointer'
      },
      `${option?.name}`
    )
  ]

  // return [
  //     h(
  //         'span',
  //         {
  //             onClick: (e) => {
  //                 e.stopPropagation()
  //                 handleClose(option)
  //             },
  //             class:'w-full !truncate line-clamp-1 cursor-pointer border-1 border-transparent hover:border-surface-line hover:text-danger rounded-lg px-1 py-[1px]',
  //         },`${option?.name}`)
  // ];
}

const selectValueV2 =
  (callbacks, allow) =>
  ({ option }) => {
    return [
      h(
        'span',
        {
          class: `w-full flex gap-2 items-center border border-transparent hover:border-surface-line rounded-lg group cursor-pointer px-1 py-[1px]`
        },
        [
          h('span', { class: 'line-clamp-1 flex-1' }, `${option?.name}`),

          allow &&
            h(
              NIcon,
              {
                size: 18,
                class: 'text-danger/80 opacity-0 group-hover:opacity-100 flex-shrink-0',
                onClick: (e) => {
                  e.stopPropagation()
                  callbacks(option)
                }
              },
              { default: () => h(DismissCircle20Filled) }
            )
        ]
      )
    ]
  }

const renderAvatarLabel = (option) => {
  return [
    h(
      'div',
      {
        class: 'flex gap-2 my-1 items-center px-2'
      },
      [
        h(NAvatar, {
          class: 'flex-shrink-0',
          src: option.photo || Utils.noAvailableImage,
          'fallback-src': Utils.noAvailableImage
        }),
        h('div', { class: 'flex flex-col' }, [
          h('div', { class: 'text-xs font-medium text-gray-500 leading-[1.2]' }, option?.fullName),
          h('div', { class: 'text-xs text-primary leading-[1.2]' }, option.position)
        ])
      ]
    )
  ]
}

const renderAvatarValue = ({ option }) => {
  return [
    h(
      'div',
      {
        class: 'flex gap-2 my-1 items-center'
      },
      option?.fullName
    )
  ]
}

export const scheduleRender = {
  label: scheduleLabel,
  value: scheduleValue
}

export const selectRender = {
  label: selectLabel,
  value: selectValue
}

export default {
  avatarRender: {
    label: renderAvatarLabel,
    value: renderAvatarValue
  },
  scheduleRender: {
    label: scheduleLabel,
    value: scheduleValue
  },
  selectRender: {
    labelColor: selectColorLabel,
    label: selectLabel,
    value: selectValue,
    value2: selectValueV2
  },
  renderIcon
}
