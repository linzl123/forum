import request from "@/api/request"

export function getCommentMessage() {
  return request.get("/message/comment")
}

export function getReplyMessage() {
  return request.get("/message/reply")
}

export function getAtMessage() {
  return request.get("/message/at")
}

export function getLetterMessage() {
  return request.get("/message/allchat")
}

export function createLetter(data) {
  return request.post("/create-chat", data, {
    headers: {"content-type": "multipart/form-data"},
  })
}

export function getLetterByUid(uid) {
  return request.get("/message/chat-user/" + uid)
}


/**
 * 清除未读消息
 * @param message_type
 * 1 评论
 * 2 回复
 * 3 私信
 * 4 @
 * @param message_id
 * @returns {Promise<AxiosResponse<any>>}
 */
export function readMessage(message_type, message_id) {
  return request.post("/message/read", {
      message_type,
      message_id,
    },
  )
}

export function deleteMessage(message_type, message_ids) {
  return request.post("/message/ignore", {
      message_type,
      message_ids,
    },
  )
}