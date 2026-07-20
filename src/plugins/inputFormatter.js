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

const CYRILLIC_PATTERN = /[а-яёқўғҳА-ЯЁҚЎҒҲ]/

export default {
  install() {
    document.addEventListener(
      'input',
      (event) => {
        const target = event.target
        const isFormattableField =
          target?.classList?.contains('n-input__input-el') ||
          target?.classList?.contains('n-input__textarea-el') ||
          target?.classList?.contains('n-base-selection-input') ||
          target?.classList?.contains('n-base-selection-input-tag__input')
        if (!isFormattableField) return
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

    document.addEventListener(
      'beforeinput',
      (event) => {
        const target = event.target
        if (!target?.closest?.('.w-e-text-container')) return
        if (target.closest('.skip-format')) return

        const insertedText = event.data ?? event.dataTransfer?.getData('text/plain')
        if (insertedText && CYRILLIC_PATTERN.test(insertedText)) {
          event.preventDefault()
          event.stopImmediatePropagation()
        }
      },
      true
    )

    document.addEventListener(
      'paste',
      (event) => {
        const target = event.target
        if (!target?.closest?.('.w-e-text-container')) return
        if (target.closest('.skip-format')) return

        const text = event.clipboardData?.getData('text/plain')
        if (text && CYRILLIC_PATTERN.test(text)) {
          event.preventDefault()
          event.stopImmediatePropagation()

          const cleaned = text.replace(/[а-яёқўғҳА-ЯЁҚЎҒҲ]/g, '')
          const dataTransfer = new DataTransfer()
          dataTransfer.setData('text/plain', cleaned)
          target.dispatchEvent(
            new ClipboardEvent('paste', { bubbles: true, cancelable: true, clipboardData: dataTransfer })
          )
        }
      },
      true
    )
  }
}
