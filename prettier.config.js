/** @type {import('prettier').Config} */
module.exports = {
  semi: false,
  singleQuote: true,
  trailingComma: 'es5',
  printWidth: 90,
  tabWidth: 2,
  plugins: ['prettier-plugin-tailwindcss'],
  tailwindFunctions: ['cn', 'cva'],
}