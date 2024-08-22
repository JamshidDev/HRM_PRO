/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
  ],
  theme: {
    screens: {
      sm: '480px',
      md: '768px',
      lg: '976px',
      xl: '1440px',
    },
    colors: {
      'primary': 'var(--primary-color)',
      'info': 'var(--info-color)',
      'success': 'var(--success-color)',
      'warning': 'var(--warning-color)',
      'danger': 'var(--danger-color)',
      'secondary': 'var(--secondary-color)',
      'white': 'var(--white-color)',
      'dark': 'var(--dark-color)',

      'surface-ground': 'var(--surface-ground)',
      'surface-section': 'var(--surface-section)',
      'surface-line': 'var(--surface-line)',

    },
    extend: {},
  },
  plugins: [],
}
