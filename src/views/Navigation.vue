<template>
  <el-container class="container">
    <el-header class="nav">
      <el-row>
        <el-col class="nav-item" :span="12">
          <el-menu class="nav-zone" :default-active="route.path" router mode="horizontal"
                   :ellipsis="false" background-color="#FFFFFF00">
            <el-menu-item v-for="(item,idx) in zoneList" :key="idx" :index="item[0]">{{ item[1] }}</el-menu-item>
          </el-menu>
        </el-col>
        <el-col class="nav-item" :span="12">
          <el-menu class="nav-user" :default-active="route.path" router mode="horizontal"
                   :ellipsis="false" background-color="#FFFFFF00">
            <el-sub-menu index="/message">
              <template #title>
                消息
                <el-badge :value="store.getters.allMessage?store.getters.allMessage:''" class="badge-msg"></el-badge>
              </template>
              <el-menu-item v-for="msg in msgList" :key="msg.path" :index="msg.path">
                {{ msg.text }}
                <el-badge :value="store.state.message[msg.type]?store.state.message[msg.type]:''"
                          class="badge-msg-item"></el-badge>
              </el-menu-item>
            </el-sub-menu>
            <el-sub-menu index="/profile">
              <template #title>
                <el-avatar :src="avatar"></el-avatar>
              </template>
              <el-menu-item v-for="profile in profileList" :key="profile.path" :index="profile.path">
                {{ profile.text }}
              </el-menu-item>
            </el-sub-menu>
            <el-menu-item index="" @click="signout">退出</el-menu-item>
          </el-menu>
        </el-col>
      </el-row>
    </el-header>
    <el-main class="container-main">
      <router-view v-slot="{Component,route}">
        <keep-alive include="Home,ZonePost">
          <component :is="Component" :key="route.matched[1].path + route.params?.id"></component>
        </keep-alive>
      </router-view>
    </el-main>
  </el-container>
</template>

<script setup>
import {useRoute, useRouter} from "vue-router"
import store from "@/store"
import {clearUserState} from "@/api/user.js"
import {watchEffect, ref} from "vue"

const uid = store.state.ownId
const avatar = ref()
watchEffect(() => {
  avatar.value = store.state.userMap.get(uid).avatar
})
const router = useRouter()
const route = useRoute()
const zoneList = [
  ["/", "首页"],
  ["/zone/1", "闲聊"],
  ["/zone/2", "学习"],
  ["/zone/3", "交易"],
]
const signout = async () => {
  await clearUserState()
  store.commit("clearOwnInfo")
  router.push("/login")
  store.commit("clearMessage")
}
//Message
const msgList = [
  {
    text: "评论",
    path: "/message/comment",
    type: 1,
  },
  {
    text: "回复",
    path: "/message/reply",
    type: 2,
  },
  {
    text: "@我",
    path: "/message/at",
    type: 4,
  },
  {
    text: "私信",
    path: "/message/letter",
    type: 3,
  },
]
//profile
const profileList = [
  {
    text: "帖子",
    path: "/profile/" + uid + "/post",
  },
  {
    text: "评论",
    path: "/profile/" + uid + "/comment",
  },
  {
    text: "回复",
    path: "/profile/" + uid + "/reply",
  },
  {
    text: "收藏",
    path: "/profile/" + uid + "/favorite",
  },
  {
    text: "关注",
    path: "/profile/" + uid + "/subscribe",
  },
  {
    text: "设置",
    path: "/profile/" + uid + "/setting",
  },
]
//WebSocket
const wsUrl = import.meta.env.VITE_WS_URL
const createWebSocket = () => {
  try {
    window.ws = new WebSocket(wsUrl)
    init()
  } catch (e) {
    reconnect(wsUrl)
  }
}
createWebSocket()

function init() {
  window.ws.onclose = () => {
    reconnect(wsUrl)
  }
  window.ws.onerror = () => {
    reconnect(wsUrl)
  }
  window.ws.onmessage = (e) => {
    store.commit("addMessage", [JSON.parse(e.data).message_type, 1])
  }
}

let lockReconnect = false

function reconnect(url) {
  if (lockReconnect) return
  lockReconnect = true
  setTimeout(() => {
    createWebSocket(url)
    lockReconnect = false
  }, 3000)
}
</script>

<style scoped>
.container {

}

.nav {
  display: flex;
  justify-content: center;
  background-color: #ffffff;
}

.nav-item {
  width: 500px;
  background-color: #ffffff;
}

.nav-zone {
  border: none;
}

.nav-user {
  display: flex;
  justify-content: end;
  border: none;
}

.container-main {
  width: 1000px;
  margin: auto;
}

.badge-msg {
  position: relative;
  top: -30px;
}

.badge-msg-item {
  position: relative;
  top: -20px;
  left: 60px;
}
</style>
