<template>
  <div>
    <el-card shadow="never">
      <template #header>
        <div class="forum-header">
          <img class="forum-banner" :src="zoneList[idx].banner"/>
          <div class="forum-theme">
            <div class="theme-logo">
              <img class="logo-img" :src="zoneList[idx].logo"/>
            </div>
            <div class="theme-intro">
              <div class="intro-title">{{ zoneList[idx].title }}</div>
              <div class="intro-slogan">{{ zoneList[idx].slogan }}</div>
            </div>
            <div class="handle">
              <el-button @click="refresh" :loading="refreshLoading">刷新</el-button>
              <el-button type="primary" @click="toSendPost=true">发帖</el-button>
            </div>
          </div>
        </div>
      </template>
      <post-list :post-ids="postIds" origin="ZonePost" description="暂无更多帖子">
        <template #default="{post}">
          <span class="sender-text" @click="router.push('/profile/'+post.u_id)">{{ post.sender }}</span>
          <div class="time-text">{{ post.post_time }}</div>
        </template>
      </post-list>
    </el-card>
    <div v-if="toSendPost">
      <send-post :zone="idx?idx:1" @close="toSendPost = false"></send-post>
    </div>
  </div>
</template>

<script>export default {name: "ZonePost"}</script>
<script setup>
import PostList from "@/components/PostList.vue"
import {useRoute, useRouter} from "vue-router"
import SendPost from "@/components/SendPost.vue"
import {provide, ref} from "vue"
import {getAllPostsByZone, getHotPosts} from "@/api/post.js"
import {POST_PER_PAGE} from "@/config/constVal.js"
import {chunk} from "@/utils/array.js"

const zoneList = [
  {
    banner: "/image/banner-0.jpg",
    logo: "/image/logo-0.jpg",
    title: "首页",
    slogan: "来看看大家都在聊什么吧",
  },
  {
    banner: "/image/banner-1.jpg",
    logo: "/image/logo-1.jpg",
    title: "闲聊",
    slogan: "偷得浮生半日闲",
  },
  {
    banner: "/image/banner-2.jpg",
    logo: "/image/logo-2.jpg",
    title: "学习",
    slogan: "博学笃行，与时俱进",
  },
  {
    banner: "/image/banner-3.jpg",
    logo: "/image/logo-3.jpg",
    title: "交易",
    slogan: "客官，来点什么吧",
  },
]
const route = useRoute()
const router = useRouter()
const idx = ref(Number(route.params.idx ?? 0))
const postIds = ref([])
const getPostIds = async () => {
  let res, tmpPostIds = []
  switch (idx.value) {
    case 0:
      res = await getHotPosts()
      for (let i of res.hot_desc) {
        tmpPostIds.push(i.post_id)
      }
      break
    default:
      res = await getAllPostsByZone(idx.value)
      if (res.post_ids) (tmpPostIds = res.post_ids)
  }
  if (tmpPostIds.length !== 0) {
    postIds.value = chunk(tmpPostIds, POST_PER_PAGE)
  } else {
    postIds.value = []
  }
}
getPostIds()
// 发帖和刷新
const toSendPost = ref(false)
const refreshLoading = ref(false)
const refresh = () => {
  refreshLoading.value = true
  getPostIds().then(() => {
    refreshLoading.value = false
  })
}
</script>

<style scoped>
.forum-header {
  background-color: #f2f4f7;
}

.forum-banner {
  height: 180px;
  width: 100%;
  object-fit: cover;
}

.forum-theme {
  display: flex;
  height: 90px;
}

.theme-logo {
  background-color: #ffffff;
  display: inline-block;
  width: 150px;
  height: 150px;
  padding: 4px;
  margin: 20px;
  position: relative;
  top: -110px
}

.logo-img {
  box-sizing: border-box;
  width: 150px;
  height: 150px;
  object-fit: cover;
}

.theme-intro {
  width: 60%;
}

.intro-title {
  font-size: 22px;
  margin-top: 10px;
}

.intro-slogan {
  margin-top: 5px;
  font-size: 14px;
}

.handle {
  width: 20%;
  display: flex;
  align-items: center;
  justify-content: space-around;
}
</style>