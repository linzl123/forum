<template>
  <div>
    <template v-if="!postIsLoading">
      <template v-if="!noFound">
        <el-card shadow="never">
          <template #header>
            <div class="card-header">
              <div class="header-title">{{ post.post_name }}</div>
              <div>
                <el-button type="primary" :plain="onlyLzText==='只看楼主'" @click="toggleOnlyLz">
                  {{ onlyLzText }}
                </el-button>
                <favorite-handle :pid="Number(route.params.id)"></favorite-handle>
                <el-button @click="toComment">评论</el-button>
              </div>
            </div>
          </template>
          <!--    发帖人-->
          <el-row :gutter="20" style="min-height: 200px">
            <el-col :span="3" class="sender-info">
              <div class="author ">
                <img class="img-80" :src="post.avatar" alt="avatar"/>
                <div class="lz-icon"></div>
              </div>
              <span class="user-nickname" @click="router.push('/profile/'+post.u_id)">
                {{ post.sender }}
              </span>
            </el-col>
            <el-col :span="21">
              <div class="content-main">
                <span v-for="(nickname,uid) in post.someone_be_at" :key="uid">
                  @<span class="user-nickname" @click="router.push('/profile/'+uid)">{{ nickname }}</span>
                </span>
                <div class="content-text">
                  {{ post.post_txt }}
                </div>
                <div v-show="post.img_id">
                  <img :src="post.img_id" class="content-img" alt="评论图片"/>
                </div>
              </div>
              <div class="content-tail">
                <div @click="agree">
                  <svg t="1648987228146" class="agree-icon" viewBox="0 0 1024 1024" version="1.1"
                       xmlns="http://www.w3.org/2000/svg"
                       p-id="1237" width="200" height="200">
                    <path
                      d="M612.910545 372.037818h226.56a93.090909 93.090909 0 0 1 91.834182 108.334546l-61.905454 372.689454A93.090909 93.090909 0 0 1 777.565091 930.909091H374.690909V372.037818c82.152727-81.338182 72.890182-210.571636 88.832-242.338909 15.965091-31.767273 47.639273-36.119273 55.645091-36.608 39.68 0 179.665455 32.395636 93.765818 278.946909zM315.531636 372.363636v558.545455H204.613818a93.090909 93.090909 0 0 1-92.997818-88.901818l-16.709818-372.363637A93.090909 93.090909 0 0 1 187.904 372.363636h127.627636z"
                      :fill="agreeColor" p-id="1238"></path>
                  </svg>
                </div>
                <div class="agree-number">{{ post.agreeCnt }}</div>
                &ensp;
                <div @click="disagree">
                  <svg t="1648987335394" class="agree-icon" viewBox="0 0 1024 1024" version="1.1"
                       xmlns="http://www.w3.org/2000/svg"
                       p-id="639" width="200" height="200">
                    <path
                      d="M611.188364 651.962182h226.56a93.090909 93.090909 0 0 0 91.834181-108.334546l-61.905454-372.689454A93.090909 93.090909 0 0 0 775.889455 93.090909H372.968727v558.871273c82.152727 81.338182 72.866909 210.571636 88.832 242.338909 15.941818 31.767273 47.616 36.119273 55.621818 36.608 39.703273 0 179.665455-32.395636 93.789091-278.946909zM313.832727 651.636364V93.090909H202.891636a93.090909 93.090909 0 0 0-92.997818 88.901818l-16.709818 372.363637A93.090909 93.090909 0 0 0 186.181818 651.636364h127.650909z"
                      :fill="disagreeColor" p-id="640"></path>
                  </svg>
                </div>
                <div class="agree-number">{{ post.disagreeCnt }}</div>
                &ensp;
                <span class="content-time">{{ post.post_time }}</span>
                &ensp;
                <template v-if="post.u_id===store.state.ownId">
                  <el-popconfirm confirm-button-text="确定" cancel-button-text="取消" title="确定删除此帖？"
                                 @confirm="deletePost">
                    <template #reference>
                      <span class="delete-speak">删除</span>
                    </template>
                  </el-popconfirm>
                </template>
                &ensp;
                <span class="handle-text" @click="toComment">评论</span>
              </div>
            </el-col>
          </el-row>
          <el-divider></el-divider>
          <!--    评论-->
          <comment-detail v-for="comment in comments" :key="comment.cid" :comment="comment"
                          :lzUid="lzUid"
                          @getReplies="getReplies(comment)"
                          @delComment="delComment">
          </comment-detail>
          <div v-loading="commentIsLoading"></div>
        </el-card>
        <!--发送评论-->
        <send-comment :pid="pid" ref="sendCommentRef" @sendSuccess="getComments"></send-comment>
      </template>
      <template v-else>
        <el-empty description="啊 哦，帖子不见了"></el-empty>
      </template>
    </template>
  </div>
</template>

<script>
export default {name: "PostDetail"}
</script>
<script setup>
import {nextTick, ref} from "vue"
import {useRoute, useRouter} from "vue-router"
import {deletePostByPid, getPostByPid} from "@/api/post.js"
import {getUserByUid} from "@/api/user.js"
import {getImg} from "@/api/image.js"
import {getAllCommentIdsByPid, getCommentWithRepliesByCid} from "@/api/comment.js"
import store from "@/store"
import CommentDetail from "@/components/CommentDetail.vue"
import SendComment from "@/components/SendComment.vue"
import FavoriteHandle from "@/components/FavoriteHandle.vue"
import {getCommentAgree, getPostAgree, setPostAgree} from "@/api/agree.js"

const route = useRoute()
const router = useRouter()
const pid = Number(route.params.id)
const post = ref()
const commentIds = ref()
const comments = ref()
const noFound = ref(true)
const postIsLoading = ref(true)
const commentIsLoading = ref(true)
const lzUid = ref() // 楼主的Uid
//
const getPost = async () => {
  let res = await getPostByPid(pid)
  if (res.state === 101) {
    return Promise.reject()
  }
  noFound.value = false
  lzUid.value = res.u_id
  res.img_id = getImg(res.img_id)
  res.someone_be_at = JSON.parse(res.someone_be_at)
  res.post_time = res.post_time.slice(0, 10) + " " + res.post_time.slice(11, 16)
  let reqUser = getUserByUid(res.u_id)
  let reqAgree = getPostAgree(pid)
  let [resUser, resAgree] = await Promise.all([reqUser, reqAgree])
  res.sender = resUser.nickname
  res.avatar = resUser.avatar
  let agreeCnt = 0, disagreeCnt = 0
  for (let [k, v] of Object.entries(resAgree.vote_message)) {
    v === true ? agreeCnt++ : disagreeCnt++
    if (Number(k) === store.state.ownId) {
      if (v) agreeColor.value = ENSURE_COLOR
      else disagreeColor.value = ENSURE_COLOR
    }
  }
  res.agreeCnt = agreeCnt
  res.disagreeCnt = disagreeCnt
  post.value = res
}
const getComments = async () => {
  commentIsLoading.value = true
  let res = await getAllCommentIdsByPid(pid)
  if (res.comment_ids !== null) {
    commentIds.value = res.comment_ids
  } else {
    commentIsLoading.value = false
    return
  }
  let reqComment = Array(commentIds.value.length)
  commentIds.value.forEach((v, i) => {
    reqComment[i] = getCommentWithRepliesByCid(v)
  })
  let resComment = await Promise.all(reqComment)
  let reqUser = Array(commentIds.value.length)
  let reqAgree = Array(commentIds.value.length)
  resComment.forEach((v, i) => {
    v.cid = commentIds.value[i]
    v.comment_time = v.comment_time.slice(0, 10) + " " + v.comment_time.slice(11, 16)
    v.img_id = getImg(v.img_id)
    v.someone_be_at = JSON.parse(v.someone_be_at)
    if (lzUid.value === v.u_id) v.isLz = true
    reqUser[i] = getUserByUid(v.u_id)
    reqAgree[i] = getCommentAgree(v.cid)
  })
  let resUser = await Promise.all(reqUser)
  let resAgree = await Promise.all(reqAgree)
  resComment.forEach((v, i) => {
    v.sender = resUser[i].nickname
    v.avatar = resUser[i].avatar
    v.isVote = 0
    v.agreeCnt = 0
    v.disagreeCnt = 0
  })
  comments.value = resComment
  commentIsLoading.value = false
  resAgree.forEach((v, i) => {
    let agreeCnt = 0, disagreeCnt = 0
    for (let [key, value] of Object.entries(v.vote_message)) {
      value === true ? agreeCnt++ : disagreeCnt++
      if (Number(key) === store.state.ownId) {
        if (value) comments.value[i].isVote = 1
        else comments.value[i].isVote = -1
      }
    }
    comments.value[i].agreeCnt = agreeCnt
    comments.value[i].disagreeCnt = disagreeCnt
  })
}
const getReplies = async (comment) => {
  let res = await getCommentWithRepliesByCid(comment.cid)
  comment.replies = res.replies
}
//
const sendCommentRef = ref()
const toComment = () => {
  sendCommentRef.value.sendEditorRef.inputRef.focus()
}
//删除
const deletePost = async () => {
  let message, type
  let res = await deletePostByPid(pid)
  if (res.state === 100) {
    message = "删除成功"
    type = "success"
    router.replace({path: history.state.back})
  } else {
    message = res.state_message
    type = "error"
  }
  store.commit("alert", {message, type})
}
const delComment = (cid) => {
  comments.value.splice(comments.value.findIndex((i) => i.cid === cid), 1)
}
//
const onlyLz = ref("false")
const onlyLzText = ref("只看楼主")
const toggleOnlyLz = () => {
  if (onlyLz.value) {
    let tmpComments = []
    comments.value.forEach((v, i) => {
      if (v.isLz) tmpComments.push(v)
    })
    comments.value = tmpComments
    onlyLzText.value = "取消只看楼主"
  } else {
    getComments().then(() => {
      onlyLzText.value = "只看楼主"
    })
  }
  onlyLz.value = !onlyLz.value
}
// 赞同 or 不赞同
const UNKNOWN_COLOR = "#8a8a8a"
const ENSURE_COLOR = "#1296db"
const voteLoading = ref(false)
const agreeColor = ref(UNKNOWN_COLOR)
const disagreeColor = ref(UNKNOWN_COLOR)
const agree = async () => {
  if (voteLoading.value === true) return
  voteLoading.value = true
  if (agreeColor.value === UNKNOWN_COLOR) {
    await setPostAgree(pid, 1)
    agreeColor.value = ENSURE_COLOR
    post.value.agreeCnt++
    if (disagreeColor.value === ENSURE_COLOR) {
      disagreeColor.value = UNKNOWN_COLOR
      post.value.disagreeCnt--
    }
  } else {
    await setPostAgree(pid, 0)
    agreeColor.value = UNKNOWN_COLOR
    post.value.agreeCnt--
  }
  voteLoading.value = false
}
const disagree = async () => {
  if (voteLoading.value === true) return
  voteLoading.value = true
  if (disagreeColor.value === UNKNOWN_COLOR) {
    await setPostAgree(pid, -1)
    disagreeColor.value = ENSURE_COLOR
    post.value.disagreeCnt++
    if (agreeColor.value === ENSURE_COLOR) {
      agreeColor.value = UNKNOWN_COLOR
      post.value.agreeCnt--
    }
  } else {
    await setPostAgree(pid, 0)
    disagreeColor.value = UNKNOWN_COLOR
    post.value.disagreeCnt--
  }
  voteLoading.value = false
}
//create
getPost().then(() => {
  postIsLoading.value = false
  getComments().then(() => {
    nextTick(() => {
      if (store.state.gotoElement) {
        let elementLocation = document.querySelector(store.state.gotoElement)
        if (elementLocation) {
          elementLocation.scrollIntoView({behavior: "auto", block: "center"})
          let color = elementLocation.style.background
          elementLocation.style.background = "#faecd8"
          setTimeout(() => {
            elementLocation.style.background = color
          }, 1000)
        } else {
          store.commit("alert", {message: "已被删除", type: "warning"})
        }
        store.commit("setGotoElement", "")
      }
    })
  })
}).catch(() => {
  postIsLoading.value = false
})
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-title {
  width: 650px;
  font-weight: bold;
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