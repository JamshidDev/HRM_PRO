import resolveConfig from 'tailwindcss/resolveConfig'
import tailwindConfig from '../../../tailwind.config.js';

const fullConfig = resolveConfig(tailwindConfig)
const tailwindColors = fullConfig.theme.colors

const parseColor = (colorValue) => {
    if (typeof colorValue === 'string' && colorValue.startsWith('var(')) {
        const varName = colorValue.slice(4, -1)
        return getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
    }
    return colorValue;
}
const hexToRgb = (hex) => {
    const bigint = parseInt(hex.replace('#', ''), 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return {r, g, b};
}
const toRgba = (hex, opacity = 1) => {
    const {r, g, b} = hexToRgb(hex);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

const superColor = (cr, opacity = 1) => {
    const color = parseColor(cr)
    return toRgba(color, opacity)
}
/**
 * @typedef {import('naive-ui').GlobalThemeOverrides} GlobalThemeOverrides
 */

/** @type {GlobalThemeOverrides} */
export const customTheme = {
    common: {
        primaryColor: superColor(tailwindColors.primary),
        primaryColorHover: superColor(tailwindColors.primary, 0.9),
        primaryColorPressed: superColor(tailwindColors.primary),

        errorColor: '#E53935',
        errorColorHover: '#E53935',
        errorColorPressed: '#D32F2F',

        textColorBase: superColor(tailwindColors.textColor0),  //Standart matn rangi
        textColor1: superColor(tailwindColors.textColor1),  // Birlamchi matn rangi (muhim matnlar)
        textColor2: superColor(tailwindColors.textColor2),  // Ikkinchi darajali matn rangi (tavsiflar)
        textColor3: superColor(tailwindColors.textColor3),  // Uchinchi darajali matn rangi (maslahatlar)
        textColorDisabled: superColor(tailwindColors.primary), // Nogiron holatdagi matn rangi

        cardColor: superColor(tailwindColors["surface-section"]), // Karta tipidagi komponentlar uchun fon rangi (masalan, <n-card>)
        modalColor: superColor(tailwindColors["surface-section"]), // Modal oynalar uchun fon rangi
        popoverColor: superColor(tailwindColors["surface-section"]), // Qalqib chiquvchi oynalar uchun fon rangi
        tableColor: superColor(tailwindColors["surface-section"]), // Jadvallar uchun fon rangi
        tableColorHover: '#f5f5f5',

        // Joylashtiruvchi va kiritish ranglari
        placeholderColor: superColor(tailwindColors["surface-text"]),// Kiritish maydonlaridagi joylashtiruvchi matn rangi
        inputColor: superColor(tailwindColors["surface-section"]), // Kiritish maydonlari uchun fon rangi
        inputColorDisabled: superColor(tailwindColors["surface-section"]), // Nogiron kiritish maydonlari uchun fon rangi

        borderRadius: '8px',

        borderColor: superColor(tailwindColors["surface-line"]), // Komponentlar uchun standart chegara rangi
        dividerColor: superColor(tailwindColors["surface-line"]),

        hoverColor: superColor(tailwindColors.primary, 0.2), // Hover holati uchun fon rangi
        activeColor: "rgba(0, 0, 0, 0.1)", // Aktiv holat uchun fon rangi
    },
    Table: {
        thColor: superColor(tailwindColors["surface-section"]),
        tdColor: superColor(tailwindColors["surface-section"]),
        borderColor: superColor(tailwindColors["surface-line"]),
        thTextColor: superColor(tailwindColors.textColor2),
        tdTextColor: superColor(tailwindColors.textColor2),
    },
    Checkbox: {
        colorHover: superColor(tailwindColors["surface-line"]),
        borderRadius: '5px',
        color: superColor(tailwindColors["surface-ground"]),
    },
    Radio: {
        color: superColor(tailwindColors["surface-ground"]),
        border: '1px solid' + superColor(tailwindColors["surface-line"]),
    },

}

