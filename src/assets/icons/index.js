const modules = import.meta.glob('./*.{svg,png}', { eager: true, import: 'default' })

const icons = {}
for (const path in modules) {
  const name = path.match(/\.\/(.+)\.(svg|png)$/)[1]
  icons[name] = modules[path]
}

export default icons
