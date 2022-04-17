import request from "@/api/request"

export function createComment(data) {
  return request.post("/create-comment", data, {
    headers: {"content-type": "multipart/form-data"},
  })
}

export function deleteCommentByCid(comment_id) {
  return request.post("/delete-comment", {
    comment_id,
  })
}

export function getCommentByCid(comment_id) {
  return request.get("/comment/" + comment_id)
}


export function getCommentWithRepliesByCid(comment_id) {
  return request.get("/v2/comment/" + comment_id)
}

export function getAllCommentIdsByPid(post_id) {
  return request.get("/allcommentid/" + post_id)
}

export function getCommentByUid(u_id) {
  return request.get("/profile/allcommentid-by-uid/" + u_id)
}