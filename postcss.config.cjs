// CommonJS PostCSS config — name ends with .cjs so Node treats it as CommonJS even when package.json uses "type": "module"
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
