<template>
  <div>
    <el-row :gutter="8">
      <el-col :span="3">
        <el-card shadow="never">
          <ul class="msg-list">
            <li class="msg-list-item" v-for="msg in msgList" :key="msg.path"
                :class="{active:msg.path===route.path}"
                @click="router.push(msg.path)">
              {{ msg.text }}
              <el-badge :value="store.state.message[msg.type]?store.state.message[msg.type]:''"
                        class="badge-msg-item">
              </el-badge>
            </li>
          </ul>
        </el-card>
      </el-col>
      <el-col :span="21">
        <router-view></router-view>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import {useRoute, useRouter} from "vue-router"
import store from "@/store"

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
const route = useRoute()
const router = useRouter()
</script>

<style scoped>
.msg-list {
  list-style: none;
  margin: 0;
  padding: 0;
  text-align: center;
}

.msg-list-item {
  height: 3rem;
  line-height: 3rem;
  cursor: pointer;
}

.msg-list-item:hover {
  color: #2faee3;
}

.active {
  color: #2faee3;
}

.badge-msg-item {
  position: absolute;
}
</style>