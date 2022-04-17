export function throttle(func, wait = 1000, immediate = true) {
  let timer = null
  return function (...args) {
    if (!timer) {
      if (immediate) {
        func.apply(this,args)
        timer = setTimeout(() => {
          timer = null
        }, wait)
      } else {
        timer = setTimeout(() => {
          func.apply(this,args)
          timer = null
        }, wait)
      }
    }
  }
}