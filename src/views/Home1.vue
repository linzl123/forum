<template>
  <div>
    <div class="zone-post">
      <el-card class="card-zone">
        <template #header>
          <div class="zone-title">
            <span>闲聊 | 热帖</span>
          </div>
        </template>
        <div class="zone-content">
          <div v-for="post in posts[0]">
            <span class="title-text post-title" @click="router.push('/post/'+post.post_id)">{{ post.post_name }}</span>
            <div class="post-content">{{ post.post_txt }}</div>
            <hr class="divider"/>
          </div>
        </div>
      </el-card>
      <el-card class="card-zone">
        <template #header>
          <div class="zone-title">
            <span>学习 | 热帖</span>
          </div>
        </template>
        <div class="zone-content">
          <div v-for="post in posts[1]">
            <span class="title-text post-title" @click="router.push('/post/'+post.post_id)">{{ post.post_name }}</span>
            <div class="post-content">{{ post.post_txt }}</div>
            <hr class="divider"/>
          </div>
        </div>
      </el-card>
      <el-card class="card-zone">
        <template #header>
          <div class="zone-title">
            <span>交易 | 热帖</span>
          </div>
        </template>
        <div class="zone-content">
          <div v-for="post in posts[2]">
            <span class="title-text post-title" @click="router.push('/post/'+post.post_id)">{{ post.post_name }}</span>
            <div class="post-content">{{ post.post_txt }}</div>
            <hr class="divider"/>
          </div>
        </div>
      </el-card>
    </div>
    <el-card class="all-hot-post">
      <b>个人展示</b><br/>
      发言 Y数量 X时间（一周）<br/>
      <br/>
      <b>代办</b><br/>
      关注者通知<br/>
    </el-card>
  </div>
</template>

<script setup>
import store from "@/store"
import {ref} from "vue"
import {getAllPostsByZone, getPostsByPids} from "@/api/post.js"
import {useRouter} from "vue-router"

const router = useRouter()
const uid = store.state.ownId
const avatar = store.state.userMap.get(uid).avatar

const posts = ref(Array(3))
const getZonePost = async () => {
  for (let i = 1; i < 4; i++) {
    getAllPostsByZone(i).then(async (ret) => {
      if (ret.state !== 100) {
        store.commit("alert", {message: "服务器开小差啦", type: "error"})
      }
      if (ret.post_ids == null) {
        posts.value[i - 1] = [{
          post_txt: "什么都没有呢",
        }]
        return
      }
      ret.post_ids = ret.post_ids.slice(0, 3)
      let res = await getPostsByPids(ret.post_ids)
      res = res.posts
      res.forEach((value, index) => {
        value.post_id = ret.post_ids[index]
      })
      posts.value[i - 1] = res
    })
  }
}
getZonePost()
</script>

<style scoped>
.zone-post {
  display: flex;
}

.card-zone {
  width: 300px;
  margin-right: 10px;
}

.zone-title {
  text-align: center;
}

.zone-content {
  min-height: 130px;
}

.post-title {
  display: block;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.post-content {
  display: block;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.divider {
  border: none;
  height: 2px;
  background-color: #e3e3e3;
}

.all-hot-post {
  margin-top: 20px;
  width: 925px;
  min-height: 500px;
}
</style>