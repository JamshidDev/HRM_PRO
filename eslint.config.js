import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'
import globals from 'globals'
import { readFileSync } from 'fs'

const autoImportGlobals = JSON.parse(
    readFileSync('./.eslintrc-auto-import.json', 'utf-8')
).globals

export default [
    { ignores: ['dist/', 'node_modules/'] },

    js.configs.recommended,

    ...pluginVue.configs['flat/recommended'],

    {
        files: ['**/*.{js,vue}'],
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.node,
                ...autoImportGlobals,
                $Toast: 'readonly',
                $ApiService: 'readonly'
            }
        },
        rules: {
            'vue/multi-word-component-names': 'off',
            'vue/no-v-html': 'off',
            'vue/require-default-prop': 'off',
            'vue/max-attributes-per-line': 'off',
            'vue/attributes-order': 'off',
            'vue/html-self-closing': 'off',
            'vue/singleline-html-element-content-newline': 'off',
            'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
            'vue/v-on-event-hyphenation': 'off',
            'no-console': 'off'
        }
    }
]