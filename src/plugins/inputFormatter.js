const formatInput = (value) => {
  value = value.replace(/[а-яёқўғҳА-ЯЁҚЎҒҲ]/g, '')

  return value
    .split('')
    .map((char, index, array) => {
      if (
        char === "'" &&
        (array[index - 1].toString().toLowerCase() === 'o' ||
          array[index - 1].toString().toLowerCase() === 'g')
      ) {
        return '’'
      }
      return char
    })
    .join('')
}

export default {
  install() {
    document.addEventListener(
      'input',
      (event) => {
        const target = event.target
        if (!target?.classList?.contains('n-input__input-el')) return
        if (target.closest('.skip-format')) return

        const formattedValue = formatInput(target.value)
        if (formattedValue !== target.value) {
          const start = target.selectionStart
          const end = target.selectionEnd
          const diff = target.value.length - formattedValue.length
          target.value = formattedValue
          target.setSelectionRange(start - diff, end - diff)
          target.dispatchEvent(new Event('input', { bubbles: true }))
        }
      },
      true
    )
  }
}
