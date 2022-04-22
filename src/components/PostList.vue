<template>
  <div>
    <div v-for="(posts,idx) in postsList" :key="idx" class="post-item">
      <el-row v-for="post in posts" :key="post.post_id">
        <el-col :span="20">
          <div class="post-title" @click="goto(post)">
            {{ post.post_name }}
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
    </div>
    <div v-if="noData" class="no-data">{{ description }}</div>
    <div v-loading="isLoading" style="margin-top: 18px"></div>
  </div>
</template>

<script setup>
import {nextTick, ref, toRefs, watch} from "vue"
import {useRouter} from "vue-router"
import {getUserByUid} from "@/api/user"
import {getPostsByPids} from "@/api/post"
import {getImg} from "@/api/image"
import store from "@/store"

const props = defineProps({
  postIds: {
    type: Array,
    required: true,
  },
  origin: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
})
// 获取帖子
const postsList = ref([])
let activePage = -1, activePageIds = null
let resPosts = null
const isLoading = ref(true)
const noData = ref(false)
const getPosts = async () => {
  isLoading.value = true
  activePageIds = props.postIds[++activePage]
  if (activePageIds == null) {
    isLoading.value = false
    noData.value = true
    return
  }
  while (1) {
    try {
      resPosts = await getPostsByPids(activePageIds)
      if (resPosts.state === 100) {
        resPosts = resPosts.posts
        //处理帖子
        switch (props.origin) {
          //分区帖子
          case "ZonePost":
            let reqUsers = Array(activePageIds.length)
            resPosts.forEach((v, i) => {
              v.post_time = v.post_time.slice(0, 10) + " " + v.post_time.slice(11, 16)
              v.img_id = getImg(v.img_id)
              reqUsers[i] = getUserByUid(v.u_id)
            })
            let resUsers = await Promise.all(reqUsers)
            resPosts.forEach((v, i) => {
              v.sender = resUsers[i].nickname
            })
            break
          //用户资料帖子
          case "ProfilePost":
            resPosts.forEach((v, i) => {
              v.post_time = v.post_time.slice(0, 10) + " " + v.post_time.slice(11, 16)
              v.img_id = getImg(v.img_id)
              v.exist = true
            })
            break
          //用户资料收藏
          case "ProfileFavorite":
            let existPostIds = Array(activePageIds.length).fill(0)
            resPosts.forEach((v, i) => {
              v.post_time = v.post_time.slice(0, 10) + " " + v.post_time.slice(11, 16)
              v.img_id = getImg(v.img_id)
              existPostIds[i] = [v.post_id, i]
            })
            let tmpPosts = Array(activePageIds.length)
            existPostIds.forEach((v, i) => {
              if (v[0] > 0) tmpPosts[i] = resPosts[v[1]]
              else tmpPosts[i] = {post_txt: "帖子已被删除", post_id: activePageIds[i], exist: false}
            })
            resPosts = tmpPosts
            break
        }
        break
      } else {
        store.commit("alert", {message: "未经处理的响应", type: "error"})
      }
    } catch (err) {
      store.commit("alert", {message: "获取帖子失败，正在重新获取", type: "warning"})
    }
  }
  postsList.value.push(resPosts)
  isLoading.value = false
  nextTick(() => {
    getPostsObserver.observe(elementList[elementList.length - 1])
  })
}
// 进入帖子详情
const router = useRouter()
const goto = (post) => {
  router.push("/post/" + post.post_id)
}
// 监听最后第X个元素
const getPostsObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        observer.unobserve(entry.target)
        getPosts()
      }
    })
  },
  {
    // root: document.querySelector(""),
    threshold: 0,
  },
)
let elementList = null
nextTick(() => {
  elementList = document.getElementsByClassName("post-item")
})
//
const {postIds} = toRefs(props)
watch(postIds, () => {
  postsList.value = []
  activePage = -1
  activePageIds = null
  getPosts()
})
const {description} = toRefs(props)
</script>

<style scoped>
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
</style>