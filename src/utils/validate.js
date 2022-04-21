const reUsername = /^[a-zA-Z0-9_-]{2,16}$/
const reNickname = /^([([a-zA-Z0-9_\u4e00-\u9fff]{2,16})$/
const rePassword = /^.{3,24}$/

export function validateUsername(rule, value, callback) {
  if (reUsername.test(value)) {
    callback()
  } else {
    callback(new Error("长度2-16，字母、数字、下划线和减号"))
  }
}

export function validatePassword(rule, value, callback) {
  if (rePassword.test(value)) {
    callback()
  } else {
    callback(new Error("长度3-24"))
  }
}

export function validateNickname(rule, value, callback) {
  if (reNickname.test(value)) {
    callback()
  } else {
    callback(new Error("长度2-16，字母、数字、汉字和下划线"))
  }
}

export function checkNickname(str) {
  return reNickname.test(str)
}