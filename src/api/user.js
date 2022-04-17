import request from "@/api/request"
import store from "@/store"
import {getImg} from "@/api/image.js"

export function login(u_name, u_password) {
  return request.post("/login", {
    u_name,
    u_password,
  })
}

export function register(u_name, u_password, u_nickname) {
  return request.post("/register", {
    u_name,
    u_password,
    u_nickname,
  })
}

export function getUserState() {
  return request.get("/user_state")
}

export async function getUserByUid(u_id) {
  if (!store.state.userMap.has(u_id)) {
    let res = await request.get("/user/" + u_id)
    if (res.state === 100) {
      store.commit("setUserMap", [u_id, {
        nickname: res.u_nickname,
        avatar: getImg(res.img_id),
      }])
    } else {
      return false
    }
  }
  return store.state.userMap.get(u_id)
}

export function clearUserState() {
  return request.post("/sign-out")
}

export function getUserIdByNickname(nickname) {
  return request.get("/id-by-name/" + nickname)
}

export function getPrivacySetting() {
  return request.get("/privacy-setting")
}

export function setPrivacySetting(type, bool) {
  let data = {key: "", value: bool}
  switch (type) {
    case 0:
      data.key = "post_is_private"
      break
    case 1:
      data.key = "comment_and_reply_is_private"
      break
    case 2:
      data.key = "saved_post_is_private"
      break
    case 3:
      data.key = "subscribed_is_private"
      break
  }
  return request.post("/privacy-setting", {
    [data.key]: data.value,
  })
}