const base = require('@warp-drive/internal-config/eslint/base.cjs');
const ignore = require('@warp-drive/internal-config/eslint/ignore.cjs');
const imports = require('@warp-drive/internal-config/eslint/imports.cjs');
const isolation = require('@warp-drive/internal-config/eslint/isolation.cjs');
const node = require('@warp-drive/internal-config/eslint/node.cjs');
const parser = require('@warp-drive/internal-config/eslint/parser.cjs');
const diagnostic = require('@warp-drive/internal-config/eslint/diagnostic.cjs');
const typescript = require('@warp-drive/internal-config/eslint/typescript.cjs');

module.exports = {
  ...parser.defaults(),
  ...base.settings(),

  plugins: [...base.plugins(), ...imports.plugins()],
  extends: [...base.extend()],
  rules: Object.assign(
    base.rules(),
    imports.rules(),
    isolation.rules({
      allowedImports: ['@ember/application'],
    }),
    {}
  ),

  ignorePatterns: ignore.ignoreRules(),

  overrides: [
    node.config(),
    node.defaults(),
    typescript.defaults(),
    diagnostic.config(),
    diagnostic.defaults({
      files: ['tests/**/*.{js,ts}'],
      allowedImports: ['@ember/application', '@ember/owner', '@ember/service'],
    }),
  ],
};
