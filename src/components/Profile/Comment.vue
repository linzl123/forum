<template>
  <div v-loading="isLoading" style="min-height: 40px"></div>
  <div v-if="!isLoading" style="margin-top: -40px">

    <template v-if="commentIds.length">
      <template v-if="store.state.ownId===Number(route.params.id)">
        <el-row v-for="comment in comments[idx]" :key="comment.cid">
          <el-col :span="20">
            <div class="comment-content">
              <span class="comment-text" @click="goto(comment)">
                {{ comment.comment_txt }}
              </span>
            </div>
            <div v-show="comment.img_id">
              <img :src="comment.img_id" class="comment-img"/>
            </div>
          </el-col>
          <el-col :span="4">
            <el-button :disabled="!comment.exist" type="danger" plain
                       @click="deleteComment(comment)">
              {{ comment.handle }}
            </el-button>
          </el-col>
          <el-divider></el-divider>
        </el-row>
      </template>

      <template v-else>
        <el-row v-for="comment in comments[idx]" :key="comment.cid">
          <div class="comment-content">
              <span class="comment-text" @click="goto(comment)">
                {{ comment.comment_txt }}
              </span>
          </div>
          <div v-show="comment.img_id">
            <img :src="comment.img_id" class="comment-img"/>
          </div>
          <el-divider></el-divider>
        </el-row>
      </template>
      <el-pagination v-show="!isLoading" v-model:current-page="activePage" layout="prev,pager,next"
                     :page-size="POST_PER_PAGE" :page-count="commentIds.length">
      </el-pagination>
    </template>

    <template v-else>
      <el-empty :description="description"></el-empty>
    </template>
  </div>
</template>

<script setup>
import {ref, watch} from "vue"
import {deleteCommentByCid, getCommentByCid, getCommentByUid} from "@/api/comment.js"
import {MAX_CACHED, POST_PER_PAGE} from "@/config/constVal.js"
import {useRoute, useRouter} from "vue-router"
import {chunk} from "@/utils/array.js"
import {getImg} from "@/api/image.js"
import store from "@/store"
import {debounce} from "@/utils/debounce.js"

const route = useRoute()
const router = useRouter()
const activePage = ref(0)
const activePageIds = ref([])
const commentIds = ref([])
const comments = ref([])
const isLoading = ref(true)
const description = ref("啊 哦，什么都没有呢")
//
const getCommentIds = async () => {
  let res = await getCommentByUid(route.params.id)
  if (res.state === 100) {
    if (res.comment_ids) {
      commentIds.value = chunk(res.comment_ids, POST_PER_PAGE)
    } else {
      return Promise.reject()
    }
  } else if (res.state === 103) {
    description.value = "暂无权限访问"
    return Promise.reject()
  } else {
    store.commit("alert", {message: "未处理的响应", type: "type"})
  }
}
//
let cached = []
const idx = ref()
watch(activePage, async () => {
  idx.value = cached.indexOf(activePage.value)
  if (idx.value !== -1) {
    isLoading.value = false
    return
  }
  isLoading.value = true
  activePageIds.value = commentIds.value[activePage.value - 1]
  let reqComment = Array(activePageIds.value.length)
  activePageIds.value.forEach((v, i) => {
    reqComment[i] = getCommentByCid(v)
  })
  let resComment = await Promise.all(reqComment)
  resComment.forEach((v, i) => {
    v.cid = activePageIds.value[i]
    v.comment_time = v.comment_time.slice(0, 10) + " " + v.comment_time.slice(11, 16)
    v.img_id = getImg(v.img_id)
    v.exist = true
    v.handle = "删除"
  })
  if (cached.length > MAX_CACHED) {
    cached.shift()
    comments.value.shift()
  }
  cached.push(activePage.value)
  comments.value.push(resComment)
  idx.value = cached.length - 1
  isLoading.value = false
})
//
const goto = (comment) => {
  comment.exist ?
    router.push("/post/" + comment.post_id).then(() => {
      store.commit("setGotoElement", "#c" + comment.cid)
    })
    : store.commit("alert", {message: "评论已被删除", type: "info"})
}
//删除评论
const deleteComment = debounce(async (comment) => {
  let message, type
  let res = await deleteCommentByCid(comment.cid)
  if (res.state === 100) {
    message = "删除成功"
    type = "success"
    comment.exist = false
    comment.handle = "已删除"
  } else {
    message = res.state_message
    type = "error"
  }
  store.commit("alert", {message, type})
})
//
getCommentIds().then(() => {
  activePage.value = 1
}).catch(() => {
  isLoading.value = false
})
</script>

<style scoped>
.comment-content {
  display: block;
  width: 90%;
  max-height: 3rem;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.comment-img {
  max-height: 80px;
  object-fit: contain;
}

.comment-text {
  cursor: pointer;
}

.comment-text:hover {
  color: #ff0000;
}
</style>