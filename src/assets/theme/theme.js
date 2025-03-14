import resolveConfig from 'tailwindcss/resolveConfig'
import tailwindConfig from '../../../tailwind.config.js';

const fullConfig = resolveConfig(tailwindConfig)
const tailwindColors = fullConfig.theme.colors

const parseColor =(colorValue)=> {
    if (typeof colorValue === 'string' && colorValue.startsWith('var(')) {
        const varName = colorValue.slice(4, -1)
        return getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
    }
    return colorValue;
}
const hexToRgb =(hex) =>{
    const bigint = parseInt(hex.replace('#', ''), 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return { r, g, b };
}
const toRgba = (hex, opacity = 1) =>{
    const { r, g, b } = hexToRgb(hex);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

const superColor = (cr, opacity=1)=>{
    const color = parseColor(cr)
    return toRgba(color, opacity)
}

console.log(parseColor(tailwindColors.primary))
 export default  {
     common: {
         primaryColor: superColor(tailwindColors.primary),
         primaryColorHover: superColor(tailwindColors.primary,0.9),
         primaryColorPressed: superColor(tailwindColors.primary),

         errorColor: '#E53935',
         errorColorHover: '#E53935',
         errorColorPressed: '#D32F2F',

         borderRadius: '8px',
     },
     Button: {
         fontSize: '10px',
     },
     Form: {
         labelFontSize: '10px',
         labelTextColor: 'rgb(121,121,121)'
     },
     Table: {
         thColor: superColor(tailwindColors["surface-section"]),
         tdColor: superColor(tailwindColors["surface-section"]),
         borderColor: superColor(tailwindColors["surface-line"]),
         thTextColor:superColor(tailwindColors["surface-text"]),
         tdTextColor:superColor(tailwindColors["surface-text"]),
     },

 }