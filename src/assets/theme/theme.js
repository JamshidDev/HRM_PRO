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
    "2xl": 1568
 }


const getValueOfCssVariable = (variableName) => {
    const rootStyles = getComputedStyle(document.documentElement);
    return rootStyles.getPropertyValue(variableName).trim();
}

/** @returns {GlobalThemeOverrides} */
export const customTheme = ()=>({
    common: {

        primaryColor:getValueOfCssVariable('--primary-color'),
        primaryColorHover:getValueOfCssVariable('--primary-color'),
        primaryColorPressed:getValueOfCssVariable('--primary-color'),

        errorColor:getValueOfCssVariable('--danger-color'),
        errorColorHover:getValueOfCssVariable('--danger-color'),
        errorColorPressed:getValueOfCssVariable('--danger-color'),

        textColorBase:getValueOfCssVariable('--textColor0'),  //Standart matn rangi
        textColor1:getValueOfCssVariable('--textColor1'),  // Birlamchi matn rangi (muhim matnlar)
        textColor2:getValueOfCssVariable('--textColor2'),  // Ikkinchi darajali matn rangi (tavsiflar)
        textColor3:getValueOfCssVariable('--textColor3'),   // Uchinchi darajali matn rangi (maslahatlar)
        textColorDisabled:getValueOfCssVariable('--surface-text'),  // Nogiron holatdagi matn rangi

        cardColor:getValueOfCssVariable('--surface-section'), // Karta tipidagi komponentlar uchun fon rangi (masalan, <n-card>)
        modalColor:getValueOfCssVariable('--surface-section'), // Modal oynalar uchun fon rangi
        popoverColor:getValueOfCssVariable('--surface-section'), // Qalqib chiquvchi oynalar uchun fon rangi
        tableColor:getValueOfCssVariable('--surface-section'), // Jadvallar uchun fon rangi
        tableColorHover: '#f5f5f5',

        // Joylashtiruvchi va kiritish ranglari
        placeholderColor:getValueOfCssVariable('--textColor3'),// Kiritish maydonlaridagi joylashtiruvchi matn rangi
        inputColor:getValueOfCssVariable('--surface-section'), // Kiritish maydonlari uchun fon rangi
        inputColorDisabled:getValueOfCssVariable('--surface-section'), // Nogiron kiritish maydonlari uchun fon rangi

        borderRadius: '8px',

        borderColor: getValueOfCssVariable('--surface-line'), // Komponentlar uchun standart chegara rangi
        dividerColor: getValueOfCssVariable('--surface-line'),

        hoverColor: getValueOfCssVariable('--primary-color')+"1a", // Hover holati uchun fon rangi
        activeColor: "rgba(0, 0, 0, 0.1)", // Aktiv holat uchun fon rangi,
    },
    Table: {
        thColor:getValueOfCssVariable('--surface-section'),
        tdColor:getValueOfCssVariable('--surface-section'),
        borderColor:getValueOfCssVariable('--surface-line'),
        thTextColor:getValueOfCssVariable('--textColor2'),
        tdTextColor:getValueOfCssVariable('--textColor2'),
    },
    Checkbox: {
        colorHover:getValueOfCssVariable('--surface-line'),
        borderRadius: '5px',
        color:getValueOfCssVariable('--surface-ground'),
    },
    Radio: {
        color:getValueOfCssVariable('--surface-ground'),
        border: '1px solid' + getValueOfCssVariable('--surface-line'),
    },
    Tabs:{
        tabColorSegment:getValueOfCssVariable('--surface-section'),
        colorSegment:getValueOfCssVariable('--surface-ground'),
        tabColor: getValueOfCssVariable('--surface-section'),
    }

})
