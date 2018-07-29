// prefer default export if available
const preferDefault = m => m && m.default || m


exports.layouts = {
  "layout---index": preferDefault(require("/Users/nikhildsouza/Documents/Development/Personal-Website-React/.cache/layouts/index.js"))
}

exports.components = {
  "component---cache-dev-404-page-js": preferDefault(require("/Users/nikhildsouza/Documents/Development/Personal-Website-React/.cache/dev-404-page.js")),
  "component---src-pages-404-js": preferDefault(require("/Users/nikhildsouza/Documents/Development/Personal-Website-React/src/pages/404.js")),
  "component---src-pages-index-js": preferDefault(require("/Users/nikhildsouza/Documents/Development/Personal-Website-React/src/pages/index.js")),
  "component---src-pages-brainwaves-js": preferDefault(require("/Users/nikhildsouza/Documents/Development/Personal-Website-React/src/pages/Brainwaves.js"))
}

exports.json = {
  "layout-index.json": require("/Users/nikhildsouza/Documents/Development/Personal-Website-React/.cache/json/layout-index.json"),
  "dev-404-page.json": require("/Users/nikhildsouza/Documents/Development/Personal-Website-React/.cache/json/dev-404-page.json"),
  "404.json": require("/Users/nikhildsouza/Documents/Development/Personal-Website-React/.cache/json/404.json"),
  "index.json": require("/Users/nikhildsouza/Documents/Development/Personal-Website-React/.cache/json/index.json"),
  "404-html.json": require("/Users/nikhildsouza/Documents/Development/Personal-Website-React/.cache/json/404-html.json"),
  "brainwaves.json": require("/Users/nikhildsouza/Documents/Development/Personal-Website-React/.cache/json/brainwaves.json")
}