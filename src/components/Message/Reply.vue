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
        <el-row v-for="reply in msgList" :key="reply.reply_id">
          <el-col :span="17">
            <div class="unread-icon" v-if="reply.is_unread" @click="removeUnread(reply)"></div>
            <span class="content-text message-content" @click="goto(reply)">{{ reply.reply_txt }}</span>
          </el-col>
          <el-col :span="5">
            <span class="sender-text" @click="router.push('/profile/'+reply.reply_u_id)">{{ reply.nickname }}</span>
            <div class="time-text">{{ reply.reply_time }}</div>
          </el-col>
          <el-col :span="2">
            <el-button :disabled="!reply.handle" @click="delMessage(reply)" type="danger" size="small" plain>
              {{ reply.handleText }}
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
import {deleteMessage, getReplyMessage, readMessage} from "@/api/message.js"
import {ref, watch} from "vue"
import {useRouter} from "vue-router"
import store from "@/store"
import {getUserByUid} from "@/api/user.js"

const router = useRouter()
const isLoading = ref(true)
const msgList = ref([])
const getMessage = async () => {
  let res = await getReplyMessage()
  if (res.reply_messages) {
    msgList.value = res.reply_messages
    let reqUser = Array(msgList.value.length)
    msgList.value.forEach((v, i) => {
      v.handle = true
      v.handleText = "移除"
      v.reply_time = v.reply_time.slice(0, 10) + " " + v.reply_time.slice(11, 16)
      reqUser[i] = getUserByUid(v.reply_u_id)
    })
    let resUser = await Promise.all(reqUser)
    msgList.value.forEach((v, i) => {
      v.nickname = resUser[i].nickname
    })
  }
  isLoading.value = false
}
window.ws.addEventListener("message", (e) => {
  if (JSON.parse(e.data).message_type === 2) {
    getMessage()
  }
})
//跳转
const goto = (reply) => {
  if (reply.is_unread)
    readMessage(2, reply.reply_id).then(() => {
      store.commit("setMessage", [2, -1])
    })
  router.push("/post/" + reply.post_id).then(() => {
    store.commit("setGotoElement", "#c" + reply.comment_id + "r" + reply.reply_id)
  })
}
//清除未读
const removeUnread = async (reply) => {
  let res = await readMessage(2, reply.reply_id)
  if (res.state === 100) {
    reply.is_unread = false
    store.commit("alert", {message: "已读", type: "success"})
    store.commit("setMessage", [2, -1])
  } else {
    store.commit("alert", {message: res.state_message, type: "error"})
  }
}
const readAllLoading = ref(false)
const readAll = async () => {
  readAllLoading.value = true
  msgList.value.forEach((v) => {
    if (v.is_unread) {
      readMessage(2, v.reply_id)
      v.is_unread = false
    }
  })
  store.commit("delMessage", 2)
  store.commit("alert", {message: "全部已读", type: "success"})
  readAllLoading.value = false
}
//移除消息
const delMessage = async (reply) => {
  let res = await deleteMessage(2, [reply.reply_id])
  if (res.state === 100) {
    reply.handle = false
    reply.handleText = "已移除"
    store.commit("alert", {message: "移除成功", type: "success"})
    if (reply.is_unread) {
      reply.is_unread = false
      store.commit("setMessage", [2, -1])
    }
  } else {
    store.commit("alert", {message: res.state_message, type: "error"})
  }
}
const delAllLoading = ref(false)
const delAll = async () => {
  delAllLoading.value = true
  let res = await deleteMessage(2, msgList.value.map(v => v.reply_id))
  if (res.state === 100) {
    msgList.value.forEach((v) => {
      v.handle = false
      v.handleText = "已移除"
      v.is_unread = false
    })
    store.commit("alert", {message: "全部移除成功", type: "success"})
    store.commit("delMessage", 2)
  } else {
    store.commit("alert", {message: res.state_message, type: "error"})
  }
  delAllLoading.value = false
}
//create
getMessage()
</script>

<style scoped>
.reply-text {
  cursor: pointer;
}

.reply-text:hover {
  color: #ff0000;
}
</style>