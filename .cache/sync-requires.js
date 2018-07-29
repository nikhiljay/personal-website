// prefer default export if available
const preferDefault = m => m && m.default || m


exports.layouts = {
  "layout---index": preferDefault(require("/Users/nikhildsouza/Documents/Development/Personal-Website-React/.cache/layouts/index.js"))
}

exports.components = {
  "component---cache-dev-404-page-js": preferDefault(require("/Users/nikhildsouza/Documents/Development/Personal-Website-React/.cache/dev-404-page.js")),
  "component---src-pages-404-js": preferDefault(require("/Users/nikhildsouza/Documents/Development/Personal-Website-React/src/pages/404.js")),
  "component---src-pages-index-js": preferDefault(require("/Users/nikhildsouza/Documents/Development/Personal-Website-React/src/pages/index.js")),
  "component---src-pages-brainwaves-js": preferDefault(require("/Users/nikhildsouza/Documents/Development/Personal-Website-React/src/pages/Brainwaves.js")),
  "component---src-pages-wolly-js": preferDefault(require("/Users/nikhildsouza/Documents/Development/Personal-Website-React/src/pages/Wolly.js")),
  "component---src-pages-prioritize-js": preferDefault(require("/Users/nikhildsouza/Documents/Development/Personal-Website-React/src/pages/Prioritize.js")),
  "component---src-pages-help-nepal-js": preferDefault(require("/Users/nikhildsouza/Documents/Development/Personal-Website-React/src/pages/HelpNepal.js")),
  "component---src-pages-wwdc-scholars-js": preferDefault(require("/Users/nikhildsouza/Documents/Development/Personal-Website-React/src/pages/WWDCScholars.js")),
  "component---src-pages-hack-chair-js": preferDefault(require("/Users/nikhildsouza/Documents/Development/Personal-Website-React/src/pages/HackChair.js")),
  "component---src-pages-gunn-hacks-js": preferDefault(require("/Users/nikhildsouza/Documents/Development/Personal-Website-React/src/pages/GunnHacks.js")),
  "component---src-pages-ml-projects-js": preferDefault(require("/Users/nikhildsouza/Documents/Development/Personal-Website-React/src/pages/MLProjects.js"))
}

exports.json = {
  "layout-index.json": require("/Users/nikhildsouza/Documents/Development/Personal-Website-React/.cache/json/layout-index.json"),
  "dev-404-page.json": require("/Users/nikhildsouza/Documents/Development/Personal-Website-React/.cache/json/dev-404-page.json"),
  "404.json": require("/Users/nikhildsouza/Documents/Development/Personal-Website-React/.cache/json/404.json"),
  "index.json": require("/Users/nikhildsouza/Documents/Development/Personal-Website-React/.cache/json/index.json"),
  "404-html.json": require("/Users/nikhildsouza/Documents/Development/Personal-Website-React/.cache/json/404-html.json"),
  "brainwaves.json": require("/Users/nikhildsouza/Documents/Development/Personal-Website-React/.cache/json/brainwaves.json"),
  "wolly.json": require("/Users/nikhildsouza/Documents/Development/Personal-Website-React/.cache/json/wolly.json"),
  "prioritize.json": require("/Users/nikhildsouza/Documents/Development/Personal-Website-React/.cache/json/prioritize.json"),
  "help-nepal.json": require("/Users/nikhildsouza/Documents/Development/Personal-Website-React/.cache/json/help-nepal.json"),
  "wwdc-scholars.json": require("/Users/nikhildsouza/Documents/Development/Personal-Website-React/.cache/json/wwdc-scholars.json"),
  "hack-chair.json": require("/Users/nikhildsouza/Documents/Development/Personal-Website-React/.cache/json/hack-chair.json"),
  "gunn-hacks.json": require("/Users/nikhildsouza/Documents/Development/Personal-Website-React/.cache/json/gunn-hacks.json"),
  "ml-projects.json": require("/Users/nikhildsouza/Documents/Development/Personal-Website-React/.cache/json/ml-projects.json")
}