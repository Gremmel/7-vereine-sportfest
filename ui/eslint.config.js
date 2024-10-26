import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'

export default [
  {
    name: 'app/files-to-lint',
    files: ['**/*.{js,mjs,jsx,vue}'],
  },

  {
    name: 'app/files-to-ignore',
    ignores: ['**/dist/**', '**/dist-ssr/**', '**/coverage/**'],
  },

  js.configs.recommended,
  ...pluginVue.configs['flat/essential'],

  // Spezifische Regel für Node.js-Konfigurationsdateien
  {
    name: 'node-files',
    files: ['vue.config.js'],  // Node-spezifische Dateien wie vue.config.js
    languageOptions: {
      globals: {
        module: 'readonly',  // Globale Variablen wie 'module' sind erlaubt
        require: 'readonly',
        process: 'readonly',
      },
      ecmaVersion: 2021,
      sourceType: 'module'
    },
    env: {
      node: true,  // Aktiviere Node.js Umgebung für diese Dateien
    },
  }
]
