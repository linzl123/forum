<template>
  <el-row :gutter="20">
    <el-col :span="3" class="sender-info">
      <div class="author">
        <img class="img-80" :src="comment.avatar" alt="avatar"/>
        <div v-if="comment.isLz" class="lz-icon"></div>
      </div>
      <span class="user-nickname" @click="router.push('/profile/'+comment.u_id)">{{ comment.sender }}</span>
    </el-col>
    <el-col :span="21">
      <div class="content-main" :id="commentKey(comment.cid)">
        <span v-for="(nickname,uid) in comment.someone_be_at" :key="uid">
          @<span class="user-nickname" @click="router.push('/profile/'+uid)">{{ nickname }}</span>
        </span>
        <div class="content-text">
          {{ comment.comment_txt }}
        </div>
        <div v-show="comment.img_id">
          <img :src="comment.img_id" class="content-img" alt="评论图片"/>
        </div>
      </div>
      <div class="content-tail">
        <div @click="agree">
          <svg class="agree-icon" viewBox="0 0 1024 1024"
               xmlns="http://www.w3.org/2000/svg"
               width="200" height="200">
            <path
              d="M612.910545 372.037818h226.56a93.090909 93.090909 0 0 1 91.834182 108.334546l-61.905454 372.689454A93.090909 93.090909 0 0 1 777.565091 930.909091H374.690909V372.037818c82.152727-81.338182 72.890182-210.571636 88.832-242.338909 15.965091-31.767273 47.639273-36.119273 55.645091-36.608 39.68 0 179.665455 32.395636 93.765818 278.946909zM315.531636 372.363636v558.545455H204.613818a93.090909 93.090909 0 0 1-92.997818-88.901818l-16.709818-372.363637A93.090909 93.090909 0 0 1 187.904 372.363636h127.627636z"
              :fill="agreeColor"></path>
          </svg>
        </div>
        <div class="agree-number">{{ comment.agreeCnt }}</div>
        &ensp;
        <div @click="disagree">
          <svg class="agree-icon" viewBox="0 0 1024 1024"
               xmlns="http://www.w3.org/2000/svg"
               width="200" height="200">
            <path
              d="M611.188364 651.962182h226.56a93.090909 93.090909 0 0 0 91.834181-108.334546l-61.905454-372.689454A93.090909 93.090909 0 0 0 775.889455 93.090909H372.968727v558.871273c82.152727 81.338182 72.866909 210.571636 88.832 242.338909 15.941818 31.767273 47.616 36.119273 55.621818 36.608 39.703273 0 179.665455-32.395636 93.789091-278.946909zM313.832727 651.636364V93.090909H202.891636a93.090909 93.090909 0 0 0-92.997818 88.901818l-16.709818 372.363637A93.090909 93.090909 0 0 0 186.181818 651.636364h127.650909z"
              :fill="disagreeColor"></path>
          </svg>
        </div>
        <div class="agree-number">{{ comment.disagreeCnt }}</div>
        &ensp;
        <span class="content-time">{{ comment.comment_time }}</span>
        &ensp;
        <template v-if="comment.u_id===store.state.ownId">
          <el-popconfirm confirm-button-text="确定" cancel-button-text="取消" title="确定删除评论吗?"
                         @confirm="deleteComment(comment)">
            <template #reference>
              <span class="delete-speak">删除</span>
            </template>
          </el-popconfirm>
        </template>
        &ensp;
        <span class="handle-text">
          <span v-show="showReply" @click="foldReply" class="reply-wrapper">收起回复</span>
          <span v-show="!showReply" @click="unfoldReply">回复({{ comment.replies.length }})</span>
        </span>
      </div>
      <!--        回复区域-->
      <el-row class="reply-area">
        <reply-detail v-show="showReply" :replies="comment.replies" :cid="comment.cid"
                      :lz-uid="lzUid" :cz-uid="comment.u_id"
                      @getReplies="getReplies" @delReply="delReply"
                      @removedComment="emits('delComment',  comment.cid)">
        </reply-detail>
      </el-row>
    </el-col>
  </el-row>
  <el-divider></el-divider>
</template>

<script setup>
import {ref, toRefs} from "vue"
import {useRoute, useRouter} from "vue-router"
import {deleteCommentByCid} from "@/api/comment.js"
import ReplyDetail from "@/components/ReplyDetail.vue"
import store from "@/store"
import {debounce} from "@/utils/debounce.js"
import {setCommentAgree} from "@/api/agree.js"

const props = defineProps({
  comment: {
    type: Object,
    required: true,
  },
  lzUid: {
    type: Number,
    required: true,
  },
  idx: {
    type: Number,
    required: true,
  },
})
const showReply = ref(true)
const {comment} = toRefs(props)
const route = useRoute()
const router = useRouter()
const emits = defineEmits(["getReplies", "delComment"])

const foldReply = () => {
  showReply.value = false
}
const unfoldReply = () => {
  emits("getReplies")
  showReply.value = true
}

const commentKey = (cid) => "c" + cid
// 子组件事件 reply-detail
const getReplies = () => {
  emits("getReplies", comment)
}

const delReply = (rid) => {
  comment.value.replies.splice(comment.value.replies.findIndex((i) => i.reply_id === rid), 1)
}

const deleteComment = debounce(async (comment) => {
  let message, type
  let res = await deleteCommentByCid(comment.cid)
  if (res.state === 100 || res.state === 101) {
    message = "删除成功"
    type = "success"
    emits("delComment", comment.cid)
  } else {
    message = res.state_message
    type = "error"
  }
  store.commit("alert", {message, type})
})
// 赞同 or 不赞同
const UNKNOWN_COLOR = "#8a8a8a"
const ENSURE_COLOR = "#1296db"
const voteLoading = ref(false)
const agreeColor = ref(UNKNOWN_COLOR)
const disagreeColor = ref(UNKNOWN_COLOR)
if (props.comment.isVote === 1) agreeColor.value = ENSURE_COLOR
else if (props.comment.isVote === -1) disagreeColor.value = ENSURE_COLOR
const agree = async () => {
  // if(post.uid===store.state.ownId) return
  if (voteLoading.value === true) return
  voteLoading.value = true
  if (agreeColor.value === UNKNOWN_COLOR) {
    await setCommentAgree(props.comment.cid, 1)
    agreeColor.value = ENSURE_COLOR
    props.comment.agreeCnt++
    if (disagreeColor.value === ENSURE_COLOR) {
      disagreeColor.value = UNKNOWN_COLOR
      props.comment.disagreeCnt--
    }
  } else {
    await setCommentAgree(props.comment.cid, 0)
    agreeColor.value = UNKNOWN_COLOR
    props.comment.agreeCnt--
  }
  voteLoading.value = false
}
const disagree = async () => {
  // if(post.uid===store.state.ownId) return
  if (voteLoading.value === true) return
  voteLoading.value = true
  if (disagreeColor.value === UNKNOWN_COLOR) {
    await setCommentAgree(props.comment.cid, -1)
    disagreeColor.value = ENSURE_COLOR
    props.comment.disagreeCnt++
    if (agreeColor.value === ENSURE_COLOR) {
      agreeColor.value = UNKNOWN_COLOR
      props.comment.agreeCnt--
    }
  } else {
    await setCommentAgree(props.comment.cid, 0)
    disagreeColor.value = UNKNOWN_COLOR
    props.comment.disagreeCnt--
  }
  voteLoading.value = false
}
</script>

<style scoped>
.reply-wrapper {
  margin-top: 1rem;
  padding: 0.3rem 0.6rem;
  background-color: #f2f6fc;
}

.author {
  width: 80px;
  height: 80px;
  padding: 10px;
}

.lz-icon {
  position: absolute;
  left: 74px;
  top: 0;
  width: 0;
  height: 0;
  border-right: 36px solid #2d64b3;
  border-bottom: 36px solid transparent;
}

.lz-icon::after {
  position: absolute;
  display: block;
  font-size: 5px;
  width: 5em;
  height: 1em;
  content: "\697c\4e3b";
  color: white;
  transform: rotate(45deg) translate(16px, -7px);
}
</style>