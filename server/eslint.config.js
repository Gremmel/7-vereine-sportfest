import globals from 'globals';
import greRules from 'eslint-config-gre'; // Importiere dein Regelset
import pluginJs from '@eslint/js';

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
  {
    rules: {
      ...greRules.rules // Füge die Regeln aus deinem Regelset hinzu
    }
  }
];
