export function chunk(array, size = 1) {
  const ret = Array(Math.ceil(array.length / size))
  for (let i = 0, j = 0; i < array.length; i += size, j++) {
    ret[j] = array.slice(i, i + size)
  }
  return ret
}