import request from "@/api/request.js"
import store from "@/store"

export async function getFavoriteByUid(u_id) {
  let res = await request.get("/profile/user-saved/" + u_id)
  if (res.state === 100 && res.post_ids) {
    store.commit("setOwnFavorite", res.post_ids)
  }
  return res
}

export async function isOwnFavorite(pid) {
  if (store.state.ownFavorite.includes(pid)) {
    return true
  } else {
    await getFavoriteByUid(store.state.ownId)
    return store.state.ownFavorite.includes(pid)
  }
}

export function addFavoriteByPid(post_id) {
  store.commit("addOwnFavorite", post_id)
  return request.post("/save-post", {post_id})
}

export function removeFavoriteByPid(post_id) {
  store.commit("rmOwnFavorite", post_id)
  return request.post("/cancel-save", {post_id})
}
