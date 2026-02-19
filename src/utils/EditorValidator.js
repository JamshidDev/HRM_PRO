export const isEditorContentEmpty = (html) => {
  if (!html) return true
  const div = document.createElement('div')
  div.innerHTML = html

  if (div.querySelector('img, video, iframe, table, hr')) return false

  const text = div.textContent.replace(/\u00a0/g, '').trim()

  return text.length === 0
}
