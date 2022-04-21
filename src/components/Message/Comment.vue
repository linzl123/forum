<template>
  <el-card shadow="never">
    <template #header>
      <div class="msg-head">
        <el-button @click="readAll" :loading="readAllLoading">一键已读</el-button>
        <el-button @click="delAll" :loading="delAllLoading" type="danger" plain>一键移除</el-button>
      </div>
    </template>
    <div v-loading="isLoading" style="min-height: 40px"></div>
    <div v-if="!isLoading" style="margin-top: -35px">
      <template v-if="msgList.length">
        <el-row v-for="comment in msgList" :key="comment.comment_id">
          <el-col :span="17">
            <div class="unread-icon" v-if="comment.is_unread" @click="removeUnread(comment)"></div>
            <span class="message-text" @click="goto(comment)">{{ comment.comment_txt }}</span>
          </el-col>
          <el-col :span="5">
            <span class="sender-text" @click="router.push('/profile/'+comment.comment_u_id)">
              {{ comment.nickname }}
            </span>
            <div class="time-text">{{ comment.comment_time }}</div>
          </el-col>
          <el-col :span="2">
            <el-button :disabled="!comment.handle" @click="delMessage(comment)" type="danger" size="small" plain>
              {{ comment.handleText }}
            </el-button>
          </el-col>
          <el-divider></el-divider>
        </el-row>
      </template>
      <template v-else>
        <el-empty description="啊 哦，什么都没有呢"></el-empty>
      </template>
    </div>
  </el-card>
</template>

<script setup>
import {deleteMessage, getCommentMessage, readMessage} from "@/api/message.js"
import {ref} from "vue"
import {useRouter} from "vue-router"
import store from "@/store"
import {getUserByUid} from "@/api/user.js"

const router = useRouter()
const isLoading = ref(true)
const msgList = ref([])
const getMessage = async () => {
  let res = await getCommentMessage()
  if (res.comment_messages) {
    let reqUser = Array(res.comment_messages.length)
    res.comment_messages.forEach((v, i) => {
      v.handle = true
      v.handleText = "移除"
      v.comment_time = v.comment_time.slice(0, 10) + " " + v.comment_time.slice(11, 16)
      reqUser[i] = getUserByUid(v.comment_u_id)
    })
    let resUser = await Promise.all(reqUser)
    res.comment_messages.forEach((v, i) => {
      v.nickname = resUser[i].nickname
    })
    msgList.value = res.comment_messages
  }
  isLoading.value = false
}
window.ws.addEventListener("message", (e) => {
  if (JSON.parse(e.data).message_type === 1) {
    getMessage()
  }
})
//跳转
const goto = (comment) => {
  if (comment.is_unread)
    readMessage(1, comment.comment_id).then(() => {
      store.commit("setMessage", [1, -1])
    })
  router.push("/post/" + comment.post_id).then(() => {
    store.commit("setGotoElement", "#c" + comment.comment_id)
  })
}
//清除未读
const removeUnread = async (comment) => {
  let res = await readMessage(1, comment.comment_id)
  if (res.state === 100) {
    comment.is_unread = false
    store.commit("alert", {message: "已读", type: "success"})
    store.commit("setMessage", [1, -1])
  } else {
    store.commit("alert", {message: res.state_message, type: "error"})
  }
}
const readAllLoading = ref(false)
const readAll = async () => {
  readAllLoading.value = true
  msgList.value.forEach((v) => {
    if (v.is_unread) {
      readMessage(1, v.comment_id)
      v.is_unread = false
    }
  })
  store.commit("delMessage", 1)
  store.commit("alert", {message: "全部已读", type: "success"})
  readAllLoading.value = false
}
//移除消息
const delMessage = async (comment) => {
  let res = await deleteMessage(1, [comment.comment_id])
  if (res.state === 100) {
    comment.handle = false
    comment.handleText = "已移除"
    store.commit("alert", {message: "移除成功", type: "success"})
    if (comment.is_unread) {
      comment.is_unread = false
      store.commit("setMessage", [1, -1])
    }
  } else {
    store.commit("alert", {message: res.state_message, type: "error"})
  }
}
const delAllLoading = ref(false)
const delAll = async () => {
  delAllLoading.value = true
  let res = await deleteMessage(1, msgList.value.map(v => v.comment_id))
  if (res.state === 100) {
    msgList.value.forEach((v) => {
      v.handle = false
      v.handleText = "已移除"
      v.is_unread = false
    })
    store.commit("alert", {message: "全部移除成功", type: "success"})
    store.commit("delMessage", 1)
  } else {
    store.commit("alert", {message: res.state_message, type: "error"})
  }
  delAllLoading.value = false
}
//
getMessage()
</script>

<style scoped>
</style>