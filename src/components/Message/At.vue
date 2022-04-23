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
        <el-row v-for="at in msgList" :key="at.at_id">
          <el-col :span="17">
            <div class="unread-icon" v-if="at.is_unread" @click="removeUnread(at)"></div>
            <span class="message-text" @click="goto(at)">{{ at.message_txt }}</span>
          </el-col>
          <el-col :span="5">
            <span class="sender-text" @click="router.push('/profile/'+at.caller_u_id)">{{ at.nickname }}</span>
          </el-col>
          <el-col :span="2">
            <el-button :disabled="!at.handle" @click="delMessage(at)" type="danger" size="small" plain>
              {{ at.handleText }}
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
import {deleteMessage, getAtMessage, readMessage} from "@/api/message.js"
import {ref} from "vue"
import {useRouter} from "vue-router"
import store from "@/store"
import {getUserByUid} from "@/api/user.js"
import {getReplyByRid} from "@/api/reply.js"

const router = useRouter()
const isLoading = ref(true)
const msgList = ref([])
const getMessage = async () => {
  let res = await getAtMessage()
  if (res.at_messages) {
    let reqUser = Array(res.at_messages.length)
    res.at_messages.forEach((v, i) => {
      reqUser[i] = getUserByUid(v.caller_u_id)
      v.handle = true
      v.handleText = "移除"
      let src = v.place.split("_")
      v.src = src[0]
      v.id = src[1]
    })
    let resUser = await Promise.all(reqUser)
    res.at_messages.forEach((v, i) => {
      v.nickname = resUser[i].nickname
    })
    msgList.value = res.at_messages
  }
  isLoading.value = false
}
window.ws.addEventListener("message", (e) => {
  if (JSON.parse(e.data).message_type === 4) {
    getMessage()
  }
})
//跳转
const goto = async (at) => {
  if (at.is_unread)
    readMessage(4, at.at_id).then(() => {
      store.commit("setMessage", [4, -1])
    })
  switch (at.src) {
    case "post":
      router.push("/post/" + at.post_id)
      break
    case "comment":
      router.push("/post/" + at.post_id).then(() => {
        store.commit("setGotoElement", "#c" + at.id)
      })
      break
    case "reply":
      let res = await getReplyByRid(at.id)
      router.push("/post/" + at.post_id).then(() => {
        store.commit("setGotoElement", "#c" + res.comment_id + "r" + at.id)
      })
      break
  }
}
//清除未读
const removeUnread = async (at) => {
  let res = await readMessage(4, at.at_id)
  if (res.state === 100) {
    at.is_unread = false
    store.commit("alert", {message: "已读", type: "success"})
    store.commit("setMessage", [4, -1])
  } else {
    store.commit("alert", {message: res.state_message, type: "error"})
  }
}
const readAllLoading = ref(false)
const readAll = async () => {
  readAllLoading.value = true
  msgList.value.forEach((v) => {
    if (v.is_unread) {
      readMessage(4, v.at_id)
      v.is_unread = false
    }
  })
  store.commit("delMessage", 4)
  store.commit("alert", {message: "全部已读", type: "success"})
  readAllLoading.value = false
}
//移除消息
const delMessage = async (at) => {
  let res = await deleteMessage(4, [at.at_id])
  if (res.state === 100) {
    at.handle = false
    at.handleText = "已移除"
    store.commit("alert", {message: "移除成功", type: "success"})
    if (at.is_unread) {
      at.is_unread = false
      store.commit("setMessage", [4, -1])
    }
  } else {
    store.commit("alert", {message: res.state_message, type: "error"})
  }
}
const delAllLoading = ref(false)
const delAll = async () => {
  delAllLoading.value = true
  let res = await deleteMessage(4, msgList.value.map(v => v.at_id))
  if (res.state === 100) {
    msgList.value.forEach((v) => {
      v.handle = false
      v.handleText = "已移除"
      v.is_unread = false
    })
    store.commit("alert", {message: "全部移除成功", type: "success"})
    store.commit("delMessage", 4)
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