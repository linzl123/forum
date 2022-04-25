<template>
  <el-card shadow="never" body-style="padding:0">
    <template #header>
      <div class="msg-head">
        <el-button @click="readAll" :loading="readAllLoading">一键已读</el-button>
        <el-button @click="delAll" :loading="delAllLoading" type="danger" plain>一键移除</el-button>
      </div>
    </template>
    <div v-loading="isLoading" style="min-height: 40px"></div>
    <div v-if="!isLoading" style="margin-top: -35px">
      <template v-if="msgKeys.length">
        <el-row>
          <el-col :span="6" class="user-list">
            <div v-for="uid in msgKeys" :key="uid" class="user-hover" :class="{'active-item':activeUid===uid}">
              <el-row class="user-item" @click="selUser(uid)">
                <div class="close" @click.stop="delMessage(uid)">✖</div>
                <el-badge class="unread-count" :value="unreadLettersList[uid].length?unreadLettersList[uid].length:''"/>
                <el-avatar :src="store.state.userMap.get(Number(uid)).avatar" class="user-avatar"></el-avatar>
                <div>
                  <div>{{ store.state.userMap.get(Number(uid)).nickname }}</div>
                  <div class="latest-txt">{{ msgList[uid].slice(-1)[0].chat_txt }}</div>
                </div>
              </el-row>
            </div>
          </el-col>
          <el-col :span="18">
            <letter-list :tarUid="Number(activeUid)" :dialog="msgList[activeUid]"
                         :unread-letters="unreadLettersList[activeUid]"
                         @getLetter="getLetter" @rmUnread="removeOneUnread"
                         @rmAllUnread="removeUnread">
            </letter-list>
          </el-col>
        </el-row>
      </template>
      <template v-else>
        <el-empty description="啊 哦，什么都没有呢"></el-empty>
      </template>
    </div>
  </el-card>
</template>

<script setup>
import {deleteMessage, getLetterByUid, getLetterMessage, readMessage} from "@/api/message.js"
import {computed, onUnmounted, ref} from "vue"
import {useRouter} from "vue-router"
import store from "@/store"
import {getUserByUid} from "@/api/user.js"
import LetterList from "@/components/Message/LetterList.vue"

const router = useRouter()
const isLoading = ref(true)
const msgList = ref({})
const msgKeys = computed(() => Object.keys(msgList.value))
const unreadLettersList = computed(() => {
  const obj = {}
  msgKeys.value.forEach((v) => {
    obj[v] = msgList.value[v].filter(v2 => v2.is_unread).map(v3 => v3.chat_id) ?? []
  })
  return obj
})
const activeUid = ref("")
const getMessage = async () => {
  let res = await getLetterMessage()
  if (res.chat_infos) {
    let keys = Object.keys(res.chat_infos)
    let reqUser = Array(keys.length)
    keys.forEach((v, i) => {
      reqUser[i] = getUserByUid(Number(v))
      res["chat_infos"][v].forEach((v2) => {
        v2.chat_time = v2.chat_time.slice(0, 10) + " " + v2.chat_time.slice(11, 19)
      })
    })
    await Promise.all(reqUser)
    msgList.value = res.chat_infos
  }
  if (store.state.gotoLetter) {
    if (msgKeys.value.indexOf(store.state.gotoLetter) === -1) {
      msgList.value[store.state.gotoLetter] = [{
        am_i_sender: true,
        chat_id: 0,
        chat_txt: "",
        img_id: "",
        is_unread: false,
      }]
    }
    return store.state.gotoLetter
  }
  return msgKeys.value[0]
}

//未读监听
const wsMessageListener = (e) => {
  if (JSON.parse(e.data).message_type === 3) {
    if (msgKeys.value.length === 0) isLoading.value = true
    getMessage().then((ret) => {
      activeUid.value = activeUid.value ?? ret
      isLoading.value = false
    })
  }
}
window.ws.addEventListener("message", wsMessageListener)
onUnmounted(() => {
  window.ws.removeEventListener("message", wsMessageListener)
})
//清除未读
const removeOneUnread = (lid) => {
  msgList.value[activeUid.value].find(v => v.chat_id === lid).is_unread = false
  readMessage(3, lid).then(() => {
    store.commit("addMessage", [3, -1])
  })
}
const removeUnread = (uid) => {
  unreadLettersList.value[uid].forEach((v) => {
    readMessage(3, v)
    store.commit("addMessage", [3, -1])
  })
  msgList.value[uid].forEach(v => v.is_unread = false)
}
const readAllLoading = ref(false)
const readAll = async () => {
  readAllLoading.value = true
  msgKeys.value.forEach((v) => {
    unreadLettersList.value[v].forEach((v) => {
      readMessage(3, v)
    })
    msgList.value[v].forEach(v2 => v2.is_unread = false)
  })
  store.commit("delMessage", 3)
  store.commit("alert", {message: "全部已读", type: "success"})
  readAllLoading.value = false
}
//移除消息
const delMessage = async (uid) => {
  let res = await deleteMessage(3, msgList.value[uid].map(v => v.chat_id))
  if (res.state === 100) {
    delete msgList.value[String(uid)]
    activeUid.value = msgKeys.value[0]
    store.commit("alert", {message: "移除成功", type: "success"})
  } else {
    store.commit("alert", {message: res.state_message, type: "error"})
  }
}
const delAllLoading = ref(false)
const delAll = async () => {
  delAllLoading.value = true
  let res = await deleteMessage(3, Object.values(msgList.value).map(v => v.map(v2 => v2.chat_id)).flat(1))
  if (res.state === 100) {
    msgList.value = {}
    store.commit("alert", {message: "全部移除成功", type: "success"})
    store.commit("delMessage", 3)
  } else {
    store.commit("alert", {message: res.state_message, type: "error"})
  }
  delAllLoading.value = false
}
// 切换现在激活的用户私信
const selUser = (uid) => {
  activeUid.value = uid
}
// 子组件发送私信或子组件间隔器获取最新私信
const getLetter = async (uid) => {
  let res = await getLetterByUid(uid)
  if (res.state === 100) {
    res.chat_info.forEach((v) => {
      v.chat_time = v.chat_time.slice(0, 10) + " " + v.chat_time.slice(11, 16)
    })
    msgList.value[uid] = res.chat_info
  } else {
    store.commit("alert", {message: res.state_message, type: "error"})
  }
}
//
getMessage().then((ret) => {
  activeUid.value = ret
  isLoading.value = false
  store.commit("setGotoLetter", "")
})
</script>

<style scoped>
.user-hover:hover {
  width: 100%;
  background-color: #e4e5e6;
  cursor: pointer;
}

.user-item {
  height: 60px;
  align-items: center;
  justify-content: center;
}

.user-avatar {
  margin-left: 14px;
  margin-right: 8px;
}

.latest-txt {
  width: 140px;
  color: #999999;
  font-size: 12px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.close {
  display: block;
  position: absolute;
  top: 18px;
  left: -18px;
  color: #F56C6C;
  transition: left 300ms;
}

.user-item:hover .close {
  display: block;
  left: 2px;
}

.active-item {
  background-color: #e4e5e6;
}

.unread-count {
  position: absolute;
  top: 0;
  left: 188px;
}
</style>