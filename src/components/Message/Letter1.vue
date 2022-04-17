<template>
  <el-card shadow="never">
    <template #header>
      <div class="msg-head">
        <el-button @click="readAll" :loading="readAllLoading">一键已读</el-button>
        <el-button @click="delAll" :loading="delAllLoading" type="danger" plain>一键移除</el-button>
      </div>
    </template>
    <div>{{ isLoading }}</div>
    <div v-loading="isLoading" style="min-height: 40px"></div>
    <div v-if="!isLoading" style="margin-top: -35px">
      <template v-if="msgKeys.length">
        <el-row>
          <el-col :span="6" class="user-list">
            <el-badge v-for="uid in msgKeys" :key="uid"
                      :value="unreadLettersList[uid].length?unreadLettersList[uid].length:''">
              <el-row class="user-item" :class="{'active-item':activeUid===uid}" @click="selUser(uid)">
                <el-avatar :src="store.state.userMap.get(Number(uid)).avatar" class="user-avatar"></el-avatar>
                <div>
                  <div>{{ store.state.userMap.get(Number(uid)).nickname }}</div>
                  <div class="last-txt">{{ msgList[uid].slice(-1)[0].chat_txt }}</div>
                </div>
                <div class="close" @click.stop="delMessage(uid)">✖</div>
              </el-row>
            </el-badge>
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
import {computed, nextTick, ref, watch} from "vue"
import {useRouter} from "vue-router"
import store from "@/store"
import {getUserByUid} from "@/api/user.js"
import LetterList from "@/components/Message/LetterList.vue"

const router = useRouter()
const isLoading = ref(true)
const msgList = ref({})
const msgKeys = ref([])
const activeUid = ref("")
const getMessage = async () => {
  let res = await getLetterMessage()
  if (res.chat_infos) {
    msgList.value = res.chat_infos
    // msgKeys.value = Object.keys(msgList.value)
    let reqUser = Array(msgKeys.value.length)
    msgKeys.value.forEach((v, i) => {
      reqUser[i] = getUserByUid(Number(v))
      unreadLettersList.value[v] = []
      msgList.value[v].forEach((v2) => {
        v2.chat_time = v2.chat_time.slice(0, 10) + " " + v2.chat_time.slice(11, 16)
        if (v2.is_unread) {
          unreadLettersList.value[v].push(v2.chat_id)
        }
      })
    })
    await Promise.all(reqUser)
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
      unreadLettersList.value[store.state.gotoLetter] = []
      msgKeys.value.unshift(store.state.gotoLetter)
    } else {
      return store.state.gotoLetter
    }
  }
  return msgKeys.value[0]
}
window.ws.addEventListener("message", (e) => {
  if (JSON.parse(e.data).message_type === 3) {
    if (msgKeys.value.length === 0) isLoading.value = true
    getMessage().then(() => {
      isLoading.value = false
    })
  }
})
//清除未读
const unreadLettersList = ref({})
const removeOneUnread = (lid) => {
  readMessage(3, lid).then(() => {
    store.commit("setMessage", [3, -1])
  })
}
const removeUnread = (uid) => {
  unreadLettersList.value[uid].forEach((v) => {
    readMessage(3, v)
    store.commit("setMessage", [3, -1])
  })
  unreadLettersList.value[uid] = []
}
const readAllLoading = ref(false)
const readAll = async () => {
  readAllLoading.value = true
  msgKeys.value.forEach((v) => {
    unreadLettersList.value[v].forEach((v) => {
      readMessage(3, v)
    })
    unreadLettersList.value[v] = []
  })
  store.commit("delMessage", 3)
  store.commit("alert", {message: "全部已读", type: "success"})
  readAllLoading.value = false
}
//移除消息
const delMessage = async (uid) => {
  let res = await deleteMessage(3, msgList.value[uid].map(v => v.chat_id))
  if (res.state === 100) {
    msgKeys.value.splice(msgKeys.value.indexOf(uid), 1)
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
    msgKeys.value = []
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
    let tmp = []
    res.chat_info.forEach((v) => {
      v.chat_time = v.chat_time.slice(0, 10) + " " + v.chat_time.slice(11, 16)
      if (v.is_unread === true) tmp.push(v.chat_id)
    })
    msgList.value[uid] = res.chat_info
    unreadLettersList.value[uid] = tmp
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
.user-item {
  height: 60px;
  align-items: center;
  justify-content: center;
}

.user-item:hover {
  width: 100%;
  background-color: #e4e5e6;
  cursor: pointer;
}

.user-avatar {
  margin-left: 14px;
  margin-right: 8px;
}

.last-txt {
  width: 130px;
  color: #999999;
  font-size: 12px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.close {
  display: none;
  position: absolute;
  color: #F56C6C;
}

.user-item:hover .close {
  display: block;
  top: 1px;
  left: 173px;
}

.active-item {
  background-color: #e4e5e6;
}
</style>