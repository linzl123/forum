import request from "@/api/request"

export function createReply(comment_id, reply_txt, target = 0, someone_be_at) {
  return request.post("/create-reply", {
    comment_id,
    reply_txt,
    target,
    someone_be_at,
  })
}

export function deleteReplyByRid(reply_id) {
  return request.post("/delete-reply", {
    reply_id,
  })
}

export function getReplyByRid(reply_id) {
  return request.get("/reply/" + reply_id)
}

export function getReplyByUid(u_id) {
  return request.get("/profile/allreplyid-by-uid/" + u_id)
}