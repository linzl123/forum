<template>
  <div>
    <template v-if="store.state.ownId===Number(route.params.id)">
      <div v-for="(replies,idx) in repliesList" :key="idx" class="reply-item">
        <el-row v-for="reply in replies" :key="reply.reply_id">
          <el-col :span="20">
            <div class="reply-text" @click="goto(reply)">
              {{ reply.reply_txt }}
            </div>
          </el-col>
          <el-col :span="4">
            <el-button :disabled="!reply.exist" type="danger" plain
                       @click="deleteReply(reply)">
              {{ reply.handle }}
            </el-button>
          </el-col>
          <el-divider></el-divider>
        </el-row>
      </div>
    </template>

    <template v-else>
      <div v-for="(replies,idx) in repliesList" :key="idx" class="reply-item">
        <el-row v-for="reply in replies" :key="reply.reply_id">
          <div class="reply-text" @click="goto(reply)">
            {{ reply.reply_txt }}
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
import {POST_PER_PAGE} from "@/config/constVal.js"
import {useRoute, useRouter} from "vue-router"
import {chunk} from "@/utils/array.js"
import store from "@/store"
import {deleteReplyByRid, getReplyByRid, getReplyByUid} from "@/api/reply.js"
import {debounce} from "@/utils/debounce.js"

const route = useRoute()
const router = useRouter()
const description = ref("暂无更多回复")
//
let replyIds = []
const getReplyIds = async () => {
  let res = await getReplyByUid(route.params.id)
  console.log(res)
  if (res.state === 100) {
    if (res.reply_ids) {
      replyIds = chunk(res.reply_ids, POST_PER_PAGE)
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
const repliesList = ref([])
let activePage = -1, activePageIds = null
let resReplies = null
const isLoading = ref(true)
const noData = ref(false)
const getReplies = async () => {
  isLoading.value = true
  activePageIds = replyIds[++activePage]
  if (activePageIds == null) {
    isLoading.value = false
    noData.value = true
    return
  }
  let reqReplies = Array(activePageIds.length)
  activePageIds.forEach((v, i) => {
    reqReplies[i] = getReplyByRid(v)
  })
  resReplies = await Promise.all(reqReplies)
  resReplies.forEach((v, i) => {
    v.reply_id = activePageIds[i]
    v.reply_time = v.reply_time.slice(0, 10) + " " + v.reply_time.slice(11, 16)
    v.exist = true
    v.handle = "删除"
  })
  repliesList.value.push(resReplies)
  isLoading.value = false
  nextTick(() => {
    getPostsObserver.observe(elementList[elementList.length - 1])
  })
}
getReplyIds().then(() => {
  getReplies()
}).catch(() => {
  isLoading.value = false
})
//
const goto = (reply) => {
  reply.exist ?
    router.push("/post/" + reply.post_id).then(() => {
      store.commit("setGotoElement", "#c" + reply.comment_id + "r" + reply.reply_id)
    })
    : store.commit("alert", {message: "回复已被删除", type: "info"})
}
//删除回复
const deleteReply = debounce(async (reply) => {
  let message, type
  let res = await deleteReplyByRid(reply.reply_id)
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
// 监听最后第X个元素
const getPostsObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        observer.unobserve(entry.target)
        getReplies()
      }
    })
  },
  {
    threshold: 0,
  },
)
let elementList = null
nextTick(() => {
  elementList = document.getElementsByClassName("reply-item")
})
</script>

<style scoped>
.reply-text {
  width: 96%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  cursor: pointer;
}

.reply-text:hover {
  color: #ff0000;
}
</style>