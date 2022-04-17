import request from "@/api/request.js"

export function getPostAgree(pid) {
  return request.get("/vote/post/" + pid)
}

export function getCommentAgree(cid) {
  return request.get("/vote/comment/" + cid)
}

// -1=>踩，0=>取消，1=>赞
export function setPostAgree(post_id, vote) {
  return request.post("/vote/post", {
    post_id,
    vote,
  })
}

export function setCommentAgree(comment_id, vote) {
  return request.post("/vote/comment", {
    comment_id,
    vote,
  })
}