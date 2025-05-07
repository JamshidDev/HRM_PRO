
/**
 * @typedef {import('naive-ui').GlobalThemeOverrides} GlobalThemeOverrides
 */

/** @type {GlobalThemeOverrides} */
export const customTheme = {
    common: {
        primaryColor:'#1A84FF',
        primaryColorHover:'#5392fe',
        primaryColorPressed:'#1A84FF',

        errorColor: '#E53935',
        errorColorHover: '#E53935',
        errorColorPressed: '#D32F2F',

        textColorBase:'#434349',  //Standart matn rangi
        textColor1:'#74788d',  // Birlamchi matn rangi (muhim matnlar)
        textColor2:'#434349',  // Ikkinchi darajali matn rangi (tavsiflar)
        textColor3:'#9a9cae',  // Uchinchi darajali matn rangi (maslahatlar)
        textColorDisabled:'#1A84FF', // Nogiron holatdagi matn rangi
        //
        // cardColor:getValueOfCssVariable('--surface-section'), // Karta tipidagi komponentlar uchun fon rangi (masalan, <n-card>)
        // modalColor:getValueOfCssVariable('--surface-section'), // Modal oynalar uchun fon rangi
        // popoverColor:getValueOfCssVariable('--surface-section'), // Qalqib chiquvchi oynalar uchun fon rangi
        // tableColor:getValueOfCssVariable('--surface-section'), // Jadvallar uchun fon rangi
        // tableColorHover: '#f5f5f5',
        //
        // // Joylashtiruvchi va kiritish ranglari
        // placeholderColor:getValueOfCssVariable('--surface-text'),// Kiritish maydonlaridagi joylashtiruvchi matn rangi
        // inputColor:getValueOfCssVariable('--surface-section'), // Kiritish maydonlari uchun fon rangi
        // inputColorDisabled:getValueOfCssVariable('--surface-section'), // Nogiron kiritish maydonlari uchun fon rangi
        //
        borderRadius: '8px',
        //
        // borderColor: getValueOfCssVariable('--surface-line'), // Komponentlar uchun standart chegara rangi
        // dividerColor: getValueOfCssVariable('--surface-line'),
        //
        // // hoverColor: superColor(tailwindColors.primary, 0.2), // Hover holati uchun fon rangi
        // activeColor: "rgba(0, 0, 0, 0.1)", // Aktiv holat uchun fon rangi
    },
    // Table: {
    //     thColor:getValueOfCssVariable('--surface-section'),
    //     tdColor:getValueOfCssVariable('--surface-section'),
    //     borderColor:getValueOfCssVariable('--surface-line'),
    //     thTextColor:getValueOfCssVariable('--textColor2'),
    //     tdTextColor:getValueOfCssVariable('--textColor2'),
    // },
    // Checkbox: {
    //     colorHover:getValueOfCssVariable('--surface-line'),
    //     borderRadius: '5px',
    //     color:getValueOfCssVariable('--surface-ground'),
    // },
    // Radio: {
    //     color:getValueOfCssVariable('--surface-ground'),
    //     border: '1px solid' + getValueOfCssVariable('--surface-line'),
    // },

}

