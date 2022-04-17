import request from "@/api/request"
import store from "@/store"

export async function getSubscribeByUid(u_id) {
  let res = await request.get("/profile/subscriptions/" + u_id)
  if (res.state === 100 && res.user_ids) {
    store.commit("setOwnSubscribe", res.user_ids)
  }
  return res
}

export async function isOwnSubscribe(uid) {
  if (store.state.ownSubscribe.includes(uid)) {
    return true
  } else {
    await getSubscribeByUid(store.state.ownId)
    return store.state.ownSubscribe.includes(uid)
  }
}

export function addSubscribeByUid(user_id) {
  store.commit("addOwnSubscribe", user_id)
  return request.post("/subscribe", {user_id})
}

export function removeSubscribeByUid(user_id) {
  store.commit("rmOwnSubscribe", user_id)
  return request.post("/cancel-subscribe", {user_id})
}