const reUsername = /^[A-Za-z0-9]{3,12}$/
const reNickname = /^.{3,12}$/
const rePassword = /^.{3,24}$/

export function validateUsername(rule, value, callback) {
  reUsername.test(value) ? callback() : new Error(callback("字母，数字（3到12字符）"))
}

export function validatePassword(rule, value, callback) {
  rePassword.test(value) ? callback() : new Error(callback("3到24字符"))
}

export function validateNickname(rule, value, callback) {
  reNickname.test(value) ? callback() : new Error(callback("3到12字符"))
}

export function validateAtInput(str) {
  return reNickname.test(str)
}