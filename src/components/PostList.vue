<template>
  <div v-loading="isLoading" style="min-height: 40px"></div>
  <div v-if="!isLoading" style="margin-top: -40px">
    <template v-if="postIds.length">
      <el-row v-for="post in posts[idx]" :key="post.post_id">
        <el-col :span="20">
          <div class="post-title">
            <span class="title-text" @click="goto(post)">
              {{ post.post_name }}
            </span>
          </div>
          <div v-text="post.post_txt" class="post-content"></div>
          <div v-show="post.img_id">
            <img :src="post.img_id" alt="帖子图片" class="post-img"/>
          </div>
        </el-col>
        <el-col :span="4">
          <slot :post="post"></slot>
        </el-col>
        <el-divider></el-divider>
      </el-row>
      <el-pagination v-show="!isLoading" v-model:current-page="activePage" layout="prev,pager,next"
                     :page-size="POST_PER_PAGE" :page-count="postIds.length">
      </el-pagination>
    </template>
    <div v-else>
      <el-empty :description="description"></el-empty>
    </div>
  </div>
</template>

<script setup>
import {ref, toRefs, watch} from "vue"
import {useRouter} from "vue-router"
import {getUserByUid} from "@/api/user"
import {getPostsByPids} from "@/api/post"
import {getImg} from "@/api/image"
import {MAX_CACHED, POST_PER_PAGE} from "@/config/constVal"
import store from "@/store"

const props = defineProps({
  postIds: {
    type: Array,
    required: true,
  },
  description: {
    type: String,
  },
})
const router = useRouter()
const {postIds} = toRefs(props)
const activePage = ref(1)
const activePageIds = ref([])
const posts = ref([])
const isLoading = ref(true)

const goto = (post) => {
  post.exist ?
    router.push("/post/" + post.post_id)
    : store.commit("alert", {message: "帖子已被删除", type: "info"})
}

let cached = []
watch(postIds, (newValue) => {
  if (newValue.length === 0) {
    isLoading.value = false
  } else {
    cached = []
    posts.value = []
    activePage.value = -1
  }
})
const idx = ref()
watch(activePage, async (newValue, oldValue) => {
  if (newValue === -1) {
    activePage.value = oldValue
    return
  }
  idx.value = cached.indexOf(activePage.value)
  if (idx.value !== -1) {
    isLoading.value = false
    return
  }
  isLoading.value = true
  activePageIds.value = postIds.value[activePage.value - 1]
  let reqUsers = Array(activePageIds.value.length)
  let resPosts = await getPostsByPids(activePageIds.value)
  resPosts = resPosts.posts
  let existPostIds = Array(activePageIds.value.length).fill(0)
  resPosts.forEach((v, i) => {
    v.post_time = v.post_time.slice(0, 10) + " " + v.post_time.slice(11, 16)
    v.img_id = getImg(v.img_id)
    v.exist = true
    reqUsers[i] = getUserByUid(v.u_id)
    existPostIds[i] = [v.post_id, i]
  })
  let resUsers = await Promise.all(reqUsers)
  resPosts.forEach((v, i) => {
    v.sender = resUsers[i].nickname
  })
  let tmpPosts = Array(activePageIds.value.length)
  existPostIds.forEach((v, i) => {
    if (v[0] > 0) {
      tmpPosts[i] = resPosts[v[1]]
    } else {
      tmpPosts[i] = {post_txt: "该帖子不存在", post_id: activePageIds.value[i], exist: false}
    }
  })
  if (cached.length > MAX_CACHED) {
    cached.shift()
    posts.value.shift()
  }
  cached.push(activePage.value)
  posts.value.push(tmpPosts)
  idx.value = cached.length - 1
  isLoading.value = false
})
</script>

<style scoped>
.post-title {
  display: block;
  width: 60%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.post-content {
  display: block;
  width: 90%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.post-img {
  max-height: 80px;
  object-fit: contain;
}
</style>