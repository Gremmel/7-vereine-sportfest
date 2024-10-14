import globals from 'globals';
import greRules from 'eslint-config-gre'; // Importiere dein Regelset
import pluginJs from '@eslint/js';
import pluginVue from 'eslint-plugin-vue';

export default [
  { files: [ '**/*.{js,mjs,cjs,vue}' ]},
  {
    languageOptions: {
      globals: {
        ...globals.browser, // Browser-Globale
        ...globals.node // Node.js-Globale hinzufügen
      }
    }
  },
  pluginJs.configs.recommended,
  ...pluginVue.configs['flat/essential'],
  {
    rules: {
      ...greRules.rules // Füge die Regeln aus deinem Regelset hinzu
    }
  }
];
