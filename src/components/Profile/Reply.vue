<template>
  <div v-loading="isLoading" style="min-height: 40px"></div>
  <div v-if="!isLoading" style="margin-top: -40px">
    <template v-if="replyIds.length>0">
      <template v-if="store.state.ownId===Number(route.params.id)">
        <el-row v-for="reply in replies[activePage-1]" :key="reply.rid">
          <el-col :span="20">
            <div class="reply-content">
              <span class="reply-text" @click="goto(reply)">
                {{ reply.reply_txt }}
              </span>
            </div>
          </el-col>
          <el-col :span="4">
            <el-button :disabled="!reply.exist" type="danger" plain @click="deleteReply(reply)">
              {{ reply.handle }}
            </el-button>
          </el-col>
          <el-divider></el-divider>
        </el-row>
      </template>

      <template v-else>
        <el-row v-for="reply in replies" :key="reply.rid">
          <div class="reply-content">
              <span class="reply-text" @click="goto(reply)">
                {{ reply.reply_txt }}
              </span>
          </div>
          <el-divider></el-divider>
        </el-row>
      </template>
      <el-pagination v-show="!isLoading" v-model:current-page="activePage" layout="prev,pager,next"
                     :page-size="POST_PER_PAGE" :page-count="replyIds.length">
      </el-pagination>
    </template>
    <div v-else>
      <el-empty :description="description"></el-empty>
    </div>
  </div>
</template>

<script setup>
import {ref, watch} from "vue"
import {MAX_CACHED, POST_PER_PAGE} from "@/config/constVal.js"
import {useRoute, useRouter} from "vue-router"
import {chunk} from "@/utils/array.js"
import store from "@/store"
import {deleteReplyByRid, getReplyByRid, getReplyByUid} from "@/api/reply.js"
import {debounce} from "@/utils/debounce.js"

const route = useRoute()
const router = useRouter()
const activePage = ref(0)
const activePageIds = ref([])
const replyIds = ref([])
const replies = ref([])
const isLoading = ref(true)
const description = ref("啊 哦，什么都没有呢")
//
const getReplyIds = async () => {
  let res = await getReplyByUid(route.params.id)
  if (res.state === 100) {
    if (res.reply_ids) {
      replyIds.value = chunk(res.reply_ids, POST_PER_PAGE)
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
  activePageIds.value = replyIds.value[activePage.value - 1]
  let reqReply = Array(activePageIds.value.length)
  activePageIds.value.forEach((v, i) => {
    reqReply[i] = getReplyByRid(v)
  })
  let resReply = await Promise.all(reqReply)
  resReply.forEach((v, i) => {
    v.rid = activePageIds.value[i]
    v.reply_time = v.reply_time.slice(0, 10) + " " + v.reply_time.slice(11, 16)
    v.exist = true
    v.handle = "删除"
  })
  if (cached.length > MAX_CACHED) {
    cached.shift()
    replies.value.shift()
  }
  cached.push(activePage.value)
  replies.value.push(resReply)
  idx.value = cached.length - 1
  isLoading.value = false
})
//
const goto = (reply) => {
  reply.exist ?
    router.push("/post/" + reply.post_id).then(() => {
      store.commit("setGotoElement", "#c" + reply.comment_id + "r" + reply.rid)
    })
    : store.commit("alert", {message: "回复已被删除", type: "info"})
}
//删除回复
const deleteReply = debounce(async (reply) => {
  let message, type
  let res = await deleteReplyByRid(reply.rid)
  if (res.state === 100) {
    message = "删除成功"
    type = "success"
    reply.handle = "已删除"
    reply.exist = false
  } else {
    message = res.state_message
    type = "error"
  }
  store.commit("alert", {message, type})
})
//
getReplyIds().then(() => {
  activePage.value = 1
}).catch(() => {
  isLoading.value = false
})
</script>

<style scoped>
.reply-content {
  display: block;
  width: 90%;
  max-height: 3rem;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.reply-text {
  cursor: pointer;
}

.reply-text:hover {
  color: #ff0000;
}
</style>