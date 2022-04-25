<template>
  <div>
    <el-row :gutter="10">
      <el-col :span="17">
        <el-card>
          <template #header>
            <b>置顶帖子</b>
          </template>
          <div class="top-body">
            <el-row v-for="post in topPostList" :key="'t'+post.post_id" :title="'置顶原因：'+post.describe">
              <el-col :span="19">
                <div class="post-title" @click="gotoPost(post)">
                  {{ post.post_name }}
                </div>
                <div v-text="post.post_txt" class="post-content"></div>
                <div v-show="post.img_id">
                  <img :src="post.img_id" alt="帖子图片" class="post-img"/>
                </div>
              </el-col>
              <el-col :span="5">
                <span class="sender-text" @click="router.push('/profile/'+post.u_id)">{{ post.sender }}</span>
                <div class="time-text">{{ post.post_time }}</div>
              </el-col>
              <el-divider></el-divider>
            </el-row>
          </div>
        </el-card>
        <el-card class="zone-card">
          <template #header>
            <b>版块分区</b>
          </template>
          <div v-for="(zone,idx) in zoneList">
            <div class="zone-intro">
              <el-avatar class="zone-logo" :size="70" :src="zone.logo" @click="gotoZone(idx)"></el-avatar>
              <div class="zone-text">
                <div class="zone-title" @click="gotoZone(idx)">{{ zone.title }}</div>
                <div>{{ zone.slogan }}</div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="7">
        <el-card class="hot-card">
          <template #header>
            <b>热门帖子</b>
          </template>
          <div class="topic-item" v-for="(post,idx) in hotPostList" :key="'h'+post.post_id">
            <div class="topic-flag-box">
              <span class="topic-flag" :class="{'topic-flag-hot':idx<3}">{{ idx + 1 }}</span>
            </div>
            <span class="topic-title" @click="gotoPost(post)">{{ post.post_name }}</span>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>export default {name: "Home"}</script>
<script setup>
import store from "@/store"
import {onActivated, ref} from "vue"
import {getHotPosts, getPostByPid, getTopPost} from "@/api/post.js"
import {useRouter} from "vue-router"
import {getUserByUid} from "@/api/user.js"

const router = useRouter()
const uid = store.state.ownId
const avatar = store.state.userMap.get(uid).avatar
// 分区跳转
const zoneList = [
  {
    banner: "/image/banner-1.webp",
    logo: "/image/logo-1.webp",
    title: "闲聊",
    slogan: "偷得浮生半日闲",
  },
  {
    banner: "/image/banner-2.webp",
    logo: "/image/logo-2.webp",
    title: "学习",
    slogan: "博学笃行，与时俱进",
  },
  {
    banner: "/image/banner-3.webp",
    logo: "/image/logo-3.webp",
    title: "交易",
    slogan: "客官，来点什么吧",
  },
]
const gotoZone = (idx) => {
  switch (idx) {
    case 0:
      router.push("/zone/1")
      break
    case 1:
      router.push("/zone/2")
      break
    case 2:
      router.push("/zone/3")
      break
  }
}
// 置顶帖子
const topPostList = ref()
const _getTopPost = async () => {
  let res = await getTopPost()
  let reqTopPost = Array(res.top_posts.length)
  res.top_posts.forEach((v, i) => {
    reqTopPost[i] = getPostByPid(v.post_id)
  })
  let resTopPost = await Promise.all(reqTopPost)
  resTopPost.forEach((v, i) => {
    v.post_id = res.top_posts[i].post_id
    v.describe = res.top_posts[i].describe
    v.post_time = v.post_time.slice(0, 10) + " " + v.post_time.slice(11, 16)
    getUserByUid(v.u_id).then((res) => {
      v.sender = res.nickname
    })
  })
  topPostList.value = resTopPost
}
_getTopPost()
const gotoPost = (post) => {
  router.push("/post/" + post.post_id)
}
// 热门帖子
const hotPostList = ref()
const _getHotPosts = async () => {
  let resHotPost = await getHotPosts()
  resHotPost.hot_desc = resHotPost.hot_desc.slice(0, 25)
  let reqPost = Array(resHotPost.hot_desc.length)
  resHotPost.hot_desc.forEach((v, i) => {
    reqPost[i] = getPostByPid(v.post_id)
  })
  let resPost = await Promise.all(reqPost)
  resPost.forEach((v, i) => {
    v.post_id = resHotPost.hot_desc[i].post_id
  })
  hotPostList.value = resPost
}
_getHotPosts()

onActivated(() => {
  _getTopPost()
  _getHotPosts()
})
</script>

<style scoped>
.top-body {
  height: 300px;
  overflow-y: auto;
}

.post-title {
  width: 96%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  color: #222222;
  font-size: 20px;
  cursor: pointer;
}

.post-title:hover {
  color: #ff0000;
}

.post-content {
  width: 96%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.post-img {
  max-height: 80px;
  object-fit: contain;
}

.zone-card {
  margin: 10px 0;
}

.zone-intro {
  display: flex;
  min-height: 100px;
}

.zone-logo {
  cursor: pointer;
}

.zone-text {
  margin: 0.8em 0 0 1em;
  flex-grow: 1;
  cursor: pointer;
}

.zone-title {
  font-size: 1.2em;
  font-weight: bold;
}

.zone-text:hover .zone-title {
  color: #ff6262;
}

.hot-card {
  height: 808px;
}

.topic-item {
  display: flex;
  align-items: center;
  margin: 8px 0;
}

.topic-flag-box {
  box-sizing: border-box;
  display: inline-block;
  width: 18px;
  text-align: center;
  margin-right: 7px;
}

.topic-flag {
  background: #e3e3e3;
  font-size: 12px;
  padding: 0 4px;
}

.topic-flag-hot {
  background: #ff7f42;
  color: #ffffff;
  padding: 1px 5px;
}

.topic-title {
  width: 200px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  cursor: pointer;
}

.topic-title:hover {
  color: #ff0000;
}
</style>