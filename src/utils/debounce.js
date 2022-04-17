export function debounce(func, wait = 300, immediate = true) {
  let timer = null
  return function (...args) {
    if (timer) clearTimeout(timer)
    if (immediate) {
      if (!timer) func.apply(this, args)
      timer = setTimeout(() => {
        timer = null
      }, wait)
    } else {
      timer = setTimeout(() => {
        func.apply(this, args)
      }, wait)
    }
  }
}