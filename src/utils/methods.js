export const useDebounce = (callback, delay = 900) => {
  let timeout = null

  function debounced(...args) {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => {
      callback(...args)
    }, delay)
  }

  function clearDebounce() {
    if (timeout) {
      clearTimeout(timeout)
      timeout = null
    }
  }
  debounced.cancel = clearDebounce
  return debounced
}
