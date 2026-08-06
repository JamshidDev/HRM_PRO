/**
 * @typedef {import('naive-ui').GlobalThemeOverrides} GlobalThemeOverrides
 */

/**
 * Customizing naive ui screen breakpoints to match with tailwind css breakpoints
 */
export const naiveBreakpoints = {
  xs: 0,
  s: 640,
  m: 768,
  l: 1024,
  xl: 1280,
  '2xl': 1568
}
import { NIcon } from 'naive-ui'
import { CheckmarkCircle24Regular } from '@vicons/fluent'

const getValueOfCssVariable = (variableName) => {
  const rootStyles = getComputedStyle(document.documentElement)
  return rootStyles.getPropertyValue(variableName).trim()
}

/** @returns {GlobalThemeOverrides} */
export const customTheme = () => {
  return {
    common: {
      baseColor: '#ffffff',
      opacityDisabled: '0.5',
      primaryColor: getValueOfCssVariable('--primary-color'),
      primaryColorHover: getValueOfCssVariable('--primary-color'),
      primaryColorPressed: getValueOfCssVariable('--primary-color'),

      errorColor: getValueOfCssVariable('--danger-color'),
      errorColorHover: getValueOfCssVariable('--danger-color'),
      errorColorPressed: getValueOfCssVariable('--danger-color'),

      infoColor: getValueOfCssVariable('--info-color'),
      infoColorHover: getValueOfCssVariable('--info-color'),
      infoColorPressed: getValueOfCssVariable('--info-color'),

      successColor: getValueOfCssVariable('--success-color'),
      successColorHover: getValueOfCssVariable('--success-color'),
      successColorPressed: getValueOfCssVariable('--success-color'),

      warningColor: getValueOfCssVariable('--warning-color'),
      warningColorHover: getValueOfCssVariable('--warning-color'),
      warningColorPressed: getValueOfCssVariable('--warning-color'),

      textColorBase: getValueOfCssVariable('--textColor0'), //Standart matn rangi
      textColor1: getValueOfCssVariable('--textColor1'), // Birlamchi matn rangi (muhim matnlar)
      textColor2: getValueOfCssVariable('--textColor2'), // Ikkinchi darajali matn rangi (tavsiflar)
      textColor3: getValueOfCssVariable('--textColor3'), // Uchinchi darajali matn rangi (maslahatlar)
      textColorDisabled: getValueOfCssVariable('--surface-text'), // Nogiron holatdagi matn rangi

      cardColor: getValueOfCssVariable('--surface-section'), // Karta tipidagi komponentlar uchun fon rangi (masalan, <n-card>)
      modalColor: getValueOfCssVariable('--surface-section'), // Modal oynalar uchun fon rangi
      popoverColor: getValueOfCssVariable('--surface-section'), // Qalqib chiquvchi oynalar uchun fon rangi
      tableColor: getValueOfCssVariable('--surface-section'), // Jadvallar uchun fon rangi
      tableColorHover: getValueOfCssVariable('--surface-ground'), // Jadval qatori hover fon rangi
      tableColorStriped: getValueOfCssVariable('--surface-ground-soft'), // Juft qatorlar fon rangi

      // Joylashtiruvchi va kiritish ranglari
      placeholderColor: getValueOfCssVariable('--textColor3'), // Kiritish maydonlaridagi joylashtiruvchi matn rangi
      inputColor: getValueOfCssVariable('--surface-section'), // Kiritish maydonlari uchun fon rangi
      inputColorDisabled: getValueOfCssVariable('--surface-section'), // Nogiron kiritish maydonlari uchun fon rangi

      borderRadius: '10px',

      borderColor: getValueOfCssVariable('--surface-line'), // Komponentlar uchun standart chegara rangi
      dividerColor: getValueOfCssVariable('--surface-line'),

      hoverColor: getValueOfCssVariable('--primary-color') + '1a', // Hover holati uchun fon rangi
      activeColor: 'rgba(0, 0, 0, 0.1)' // Aktiv holat uchun fon rangi
    },
    Table: {
      thColor: getValueOfCssVariable('--table-header'),
      tdColor: getValueOfCssVariable('--surface-section'),
      borderColor: getValueOfCssVariable('--surface-line'),
      thTextColor: getValueOfCssVariable('--textColor2'),
      tdTextColor: getValueOfCssVariable('--textColor2')
    },
    DataTable: {
      thColor: getValueOfCssVariable('--table-header'),
      tdColor: getValueOfCssVariable('--surface-section'),
      borderColor: getValueOfCssVariable('--surface-line'),
      thTextColor: getValueOfCssVariable('--textColor2'),
      tdTextColor: getValueOfCssVariable('--textColor2')
    },
    Pagination: {
      itemColor: getValueOfCssVariable('--table-header'),
      itemColorHover: getValueOfCssVariable('--table-header'),
      itemColorActive: getValueOfCssVariable('--primary-color'),
      itemColorActiveHover: getValueOfCssVariable('--primary-color'),
      itemColorDisabled: getValueOfCssVariable('--table-header'),
      itemTextColorActive: '#ffffff',
      itemTextColorActiveHover: '#ffffff',
      itemBorder: `1px solid ${getValueOfCssVariable('--surface-line')}`,
      itemBorderHover: `1px solid ${getValueOfCssVariable('--surface-line')}`,
      itemBorderDisabled: `1px solid ${getValueOfCssVariable('--surface-line')}`,
      buttonColor: getValueOfCssVariable('--table-header'),
      buttonColorHover: getValueOfCssVariable('--table-header'),
      buttonBorder: `1px solid ${getValueOfCssVariable('--surface-line')}`,
      buttonBorderHover: `1px solid ${getValueOfCssVariable('--surface-line')}`,
      peers: {
        Select: {
          peers: {
            InternalSelection: {
              color: getValueOfCssVariable('--table-header'),
              colorActive: getValueOfCssVariable('--table-header')
            }
          }
        }
      }
    },
    Checkbox: {
      colorHover: getValueOfCssVariable('--surface-line'),
      borderRadius: '5px',
      color: getValueOfCssVariable('--surface-ground')
    },
    Radio: {
      color: getValueOfCssVariable('--surface-ground'),
      border: '1px solid' + getValueOfCssVariable('--surface-line')
    },
    // Dark temada naive-ui switch uchun `primaryColorSuppl`dan foydalanadi (light'da —
    // `primaryColor`). Biz `primaryColorSuppl`ni override qilmaganimiz uchun dark'da
    // naive-ui'ning default yashil rangi chiqib qolardi — shuning uchun aniq belgilaymiz.
    Switch: {
      railColorActive: getValueOfCssVariable('--primary-color'),
      loadingColor: getValueOfCssVariable('--primary-color')
    },
    Tabs: {
      tabColorSegment: getValueOfCssVariable('--surface-section'),
      colorSegment: getValueOfCssVariable('--surface-ground'),
      tabColor: getValueOfCssVariable('--surface-section'),
      tabBorderColor: getValueOfCssVariable('--surface-line')
    },
    Select: {
      icons: {
        check: () => h(NIcon, null, { default: () => h(CheckmarkCircle24Regular) })
      }
    },
    InternalSelection: {
      border: `1px solid ${getValueOfCssVariable('--surface-line')}`
    },
    Input: {
      border: `1px solid ${getValueOfCssVariable('--surface-line')}`
    },
    Dropdown: {
      optionTextColorHover: '#2E90FA'
    },
    Button: {
      textColorPrimary: '#ffffff',
      textColorHoverPrimary: '#ffffff',
      textColorPressedPrimary: '#ffffff',
      textColorFocusPrimary: '#ffffff',
      textColorDisabledPrimary: '#ffffff',
      textColorInfo: '#ffffff',
      textColorHoverInfo: '#ffffff',
      textColorPressedInfo: '#ffffff',
      textColorFocusInfo: '#ffffff',
      textColorDisabledInfo: '#ffffff',
      textColorSuccess: '#ffffff',
      textColorHoverSuccess: '#ffffff',
      textColorPressedSuccess: '#ffffff',
      textColorFocusSuccess: '#ffffff',
      textColorDisabledSuccess: '#ffffff',
      textColorWarning: '#ffffff',
      textColorHoverWarning: '#ffffff',
      textColorPressedWarning: '#ffffff',
      textColorFocusWarning: '#ffffff',
      textColorDisabledWarning: '#ffffff',
      textColorError: '#ffffff',
      textColorHoverError: '#ffffff',
      textColorPressedError: '#ffffff',
      textColorFocusError: '#ffffff',
      textColorDisabledError: '#ffffff'
    }
  }
}
