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
    <ul class="tool-sidebar">
      <li @click="toSendPost=true" title="发帖">
        <svg class="tool-sidebar-icon" viewBox="0 0 1024 1024"
             xmlns="http://www.w3.org/2000/svg"
             width="32" height="32">
          <path
            d="M802.714 906.739H212.368c-54.338 0-98.39-44.082-98.39-98.452V217.55c0-54.378 44.698-103.115 99.039-103.115h396.155v49.52H213.017c-27.169 0-49.843 26.41-49.843 53.597v590.736c0 27.185 22.026 49.228 49.194 49.228h590.346c27.168 0 54.05-22.623 54.05-49.81V411.553h49.52v396.15c-0.002 54.372-49.23 99.036-103.57 99.036zM508.68 668.173c-7.192 7.199-16.2 10.798-25.486 12.607L267.797 787.325c-24.242 11.257-43.659-10.484-34.725-34.748l106.475-215.542c1.805-9.292 5.404-18.303 12.597-25.501L734.796 128.63c19.211-19.227 50.36-19.227 69.57 0l86.965 87.023c19.214 19.222 19.214 50.395 0 69.618l-382.65 382.902z m-228.498 54.634c-5.628 11.35 5.242 23.006 17.363 17.374l133.01-80.566-69.861-69.907-80.512 133.1z m124.138-159.06l52.182 52.216c9.603 9.612-15.222-15.233 17.39 17.402L752.186 354.89l-87.586-86.403-277.67 277.855c9.24 9.244 7.785 7.794 17.392 17.404z m434.83-330.688l-52.179-52.217c-9.604-9.612-25.18-9.612-34.785 0l-50.935 50.965 85.717 88.27 52.182-52.216c9.607-9.61 9.607-25.19 0-34.802z"
            fill="#8a8a8a"></path>
        </svg>
      </li>
      <li @click="refresh" title="刷新">
        <svg class="tool-sidebar-icon" viewBox="0 0 1024 1024"
             xmlns="http://www.w3.org/2000/svg"
             width="32" height="32">
          <path
            d="M938.336973 255.26894c-16.685369-6.020494-35.090879 2.752226-40.939358 19.437594l-24.770032 69.493701c-29.070385-65.537376-74.998152-123.162103-133.48295-166.337645-185.947253-137.611288-450.848984-100.112212-590.180413 83.942886C81.534688 350.908785 52.980346 460.653788 68.805644 570.742819c15.825298 110.605073 74.48211 208.481102 164.789518 275.394591 75.686209 55.904586 164.273476 83.082815 252.172686 83.082815 128.494541 0 255.26894-57.624727 338.007727-166.853687 36.639006-48.335965 61.581052-102.348396 74.48211-160.833193 3.78431-17.373425-7.224593-34.402822-24.426004-38.187133-17.201411-3.78431-34.402822 7.052579-38.187133 24.426004-10.836889 49.36805-31.994625 95.123803-62.957164 135.891147-118.173694 156.016798-342.996136 187.839409-500.90509 70.869814-76.546279-56.592642-126.086343-139.33143-139.503444-232.907106-13.417101-93.059634 10.664875-185.775239 67.77356-261.11742C318.05409 144.491853 542.704519 112.497228 700.785486 229.466823c57.280699 42.315471 100.112212 100.972283 123.334117 167.197715l-110.261045-43.003528c-16.513355-6.364522-35.090879 1.720141-41.627415 18.233496-6.536536 16.513355 1.720141 35.090879 18.233496 41.627415l162.38132 63.473207c3.78431 1.548127 7.740635 2.236183 11.69696 2.236183 0.516042 0 1.032085-0.172014 1.548127-0.172014 1.204099 0.172014 2.408198 0.688056 3.612296 0.688056 13.245087 0 25.630102-8.256677 30.274483-21.32975l57.796741-161.693264C963.623047 279.694944 955.022342 261.289434 938.336973 255.26894z"
            fill="#8a8a8a"></path>
        </svg>
      </li>
      <li @click="gotoTop" title="回到顶部">
        <svg class="tool-sidebar-icon" viewBox="0 0 1024 1024"
             xmlns="http://www.w3.org/2000/svg"
             width="32" height="32">
          <path
            d="M752.736 431.063C757.159 140.575 520.41 8.97 504.518 0.41V0l-0.45 0.205-0.41-0.205v0.41c-15.934 8.56-252.723 140.165-248.259 430.653-48.21 31.457-98.713 87.368-90.685 184.074 8.028 96.666 101.007 160.768 136.601 157.287 35.595-3.482 25.232-30.31 25.232-30.31l12.206-50.095s52.47 80.569 69.304 80.528c15.114-1.23 87-0.123 95.6 0h0.82c8.602-0.123 80.486-1.23 95.6 0 16.794 0 69.305-80.528 69.305-80.528l12.165 50.094s-10.322 26.83 25.272 30.31c35.595 3.482 128.574-60.62 136.602-157.286 8.028-96.665-42.475-152.617-90.685-184.074z m-248.669-4.26c-6.758-0.123-94.781-3.359-102.891-107.192 2.95-98.714 95.97-107.438 102.891-107.93 6.964 0.492 99.943 9.216 102.892 107.93-8.11 103.833-96.174 107.07-102.892 107.192z m-52.019 500.531c0 11.838-9.42 21.382-21.012 21.382a21.217 21.217 0 0 1-21.054-21.34V821.74c0-11.797 9.421-21.382 21.054-21.382 11.591 0 21.012 9.585 21.012 21.382v105.635z m77.333 57.222a21.504 21.504 0 0 1-21.34 21.626 21.504 21.504 0 0 1-21.34-21.626V827.474c0-11.96 9.543-21.668 21.299-21.668 11.796 0 21.38 9.708 21.38 21.668v157.082z m71.147-82.043c0 11.796-9.42 21.34-21.053 21.34a21.217 21.217 0 0 1-21.013-21.34v-75.367c0-11.755 9.421-21.299 21.013-21.299 11.632 0 21.053 9.544 21.053 21.3v75.366z"
            fill="#8a8a8a"></path>
        </svg>
      </li>
    </ul>
  </div>
</template>

<script>export default {name: "ZonePost"}</script>
<script setup>
import PostList from "@/components/PostList.vue"
import {useRoute, useRouter} from "vue-router"
import SendPost from "@/components/SendPost.vue"
import {ref} from "vue"
import {getAllPostsByZone, getHotPosts} from "@/api/post.js"
import {POST_PER_PAGE} from "@/config/constVal.js"
import {chunk} from "@/utils/array.js"
import {debounce} from "@/utils/debounce.js"
import store from "@/store"

const zoneList = [
  {
    banner: "/image/banner-0.webp",
    logo: "/image/logo-0.webp",
    title: "首页",
    slogan: "来看看大家都在聊什么吧",
  },
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
// 发帖、刷新、回到顶部
const toSendPost = ref(false)
const refreshLoading = ref(false)
const refresh = debounce(() => {
  refreshLoading.value = true
  getPostIds().then(() => {
    store.commit("alert", {message: "刷新成功", type: "success"})
    refreshLoading.value = false
  })
})
const gotoTop = () => {
  scrollTo(0, 0)
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