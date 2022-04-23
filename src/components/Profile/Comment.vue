<template>
  <div>
    <template v-if="store.state.ownId===Number(route.params.id)">
      <div v-for="(comments,idx) in commentsList" :key="'c'+idx" class="comments-item">
        <el-row v-for="comment in comments" :key="comment.comment_id">
          <el-col :span="20">
            <div class="comment-text" @click="goto(comment)">
              {{ comment.comment_txt }}
            </div>
            <div v-show="comment.img_id">
              <img :src="comment.img_id" class="comment-img" alt="评论图片"/>
            </div>
          </el-col>
          <el-col :span="4">
            <el-button type="danger" plain @click="deleteComment(idx,comment)">
              删除
            </el-button>
          </el-col>
          <el-divider></el-divider>
        </el-row>
      </div>
    </template>

    <template v-else>
      <div v-for="(comments,idx) in commentsList" :key="'c'+idx" class="comments-item">
        <el-row v-for="comment in comments" :key="comment.comment_id">
          <div class="comment-text" @click="goto(comment)">
            {{ comment.comment_txt }}
          </div>
          <div v-show="comment.img_id">
            <img :src="comment.img_id" class="comment-img" alt="评论图片"/>
          </div>
          <el-divider></el-divider>
        </el-row>
      </div>
    </template>
    <div v-if="noData" class="no-data">{{ description }}</div>
    <div v-loading="isLoading" style="margin-top: 18px"></div>
  </div>
</template>

<script setup>
import {nextTick, ref} from "vue"
import {deleteCommentByCid, getCommentByCid, getCommentByUid} from "@/api/comment.js"
import {POST_PER_PAGE} from "@/config/constVal.js"
import {useRoute, useRouter} from "vue-router"
import {chunk} from "@/utils/array.js"
import {getImg} from "@/api/image.js"
import store from "@/store"
import {debounce} from "@/utils/debounce.js"

const route = useRoute()
const router = useRouter()
const description = ref("暂无更多评论")
//
let commentIds = []
const getCommentIds = async () => {
  let res = await getCommentByUid(route.params.id)
  if (res.state === 100) {
    if (res.comment_ids) {
      commentIds = chunk(res.comment_ids, POST_PER_PAGE)
    }
  } else if (res.state === 103) {
    description.value = "暂无权限访问"
  } else {
    store.commit("alert", {message: "未经处理的响应", type: "type"})
  }
}
const commentsList = ref([])
let activePage = -1, activePageIds = null
const isLoading = ref(true)
const noData = ref(false)
const getComments = async () => {
  isLoading.value = true
  activePageIds = commentIds[++activePage]
  if (activePageIds == null) {
    isLoading.value = false
    noData.value = true
    return
  }
  let reqComments = Array(activePageIds.length)
  activePageIds.forEach((v, i) => {
    reqComments[i] = getCommentByCid(v)
  })
  let resComments = await Promise.all(reqComments)
  resComments.forEach((v, i) => {
    v.comment_id = activePageIds[i]
    v.comment_time = v.comment_time.slice(0, 10) + " " + v.comment_time.slice(11, 16)
    v.img_id = getImg(v.img_id)
  })
  commentsList.value.push(resComments)
  isLoading.value = false
  if (activePageIds.length === POST_PER_PAGE) {
    nextTick(() => {
      getPostsObserver.observe(elementList[elementList.length - 1])
    })
  } else {
    noData.value = true
  }
}
getCommentIds().then(() => {
  getComments()
})
//
const goto = (comment) => {
  router.push("/post/" + comment.post_id).then(() => {
    store.commit("setGotoElement", "#c" + comment.comment_id)
  })
}
//删除评论
const deleteComment = debounce(async (idx, comment) => {
  let res = await deleteCommentByCid(comment.comment_id)
  if (res.state === 100) {
    commentsList.value[idx].splice(commentsList.value[idx].indexOf(comment), 1)
    store.commit("alert", {message: "删除成功", type: "success"})
  } else {
    store.commit("alert", {message: res.state_message, type: "error"})
  }
})
// 监听最后第X个元素
const getPostsObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        observer.unobserve(entry.target)
        getComments()
      }
    })
  },
  {
    threshold: 0,
  },
)
let elementList = null
nextTick(() => {
  elementList = document.getElementsByClassName("comments-item")
})
</script>

<style scoped>
.comment-img {
  max-height: 80px;
  object-fit: contain;
}

.comment-text {
  width: 96%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  cursor: pointer;
}

.comment-text:hover {
  color: #ff0000;
}
</style>