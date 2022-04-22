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
                <el-button @click="toSendComment=true">评论</el-button>
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
                <span v-for="(nickname,uid) in post.someone_be_at" :key="'pa'+uid">
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
                  <svg class="agree-icon" viewBox="0 0 1024 1024"
                       xmlns="http://www.w3.org/2000/svg"
                       width="200" height="200">
                    <path
                      d="M612.910545 372.037818h226.56a93.090909 93.090909 0 0 1 91.834182 108.334546l-61.905454 372.689454A93.090909 93.090909 0 0 1 777.565091 930.909091H374.690909V372.037818c82.152727-81.338182 72.890182-210.571636 88.832-242.338909 15.965091-31.767273 47.639273-36.119273 55.645091-36.608 39.68 0 179.665455 32.395636 93.765818 278.946909zM315.531636 372.363636v558.545455H204.613818a93.090909 93.090909 0 0 1-92.997818-88.901818l-16.709818-372.363637A93.090909 93.090909 0 0 1 187.904 372.363636h127.627636z"
                      :fill="agreeColor"></path>
                  </svg>
                </div>
                <div class="agree-number">{{ post.agreeCnt }}</div>
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
                <span class="handle-text" @click="toSendComment=true">评论</span>
              </div>
            </el-col>
          </el-row>
          <el-divider></el-divider>
          <!--    评论-->
          <div v-for="(comments,idx) in commentsList" :key="'c'+idx">
            <div v-for="comment in comments" :key="'cc'+comment.cid" class="comment-item">
              <comment-detail :lz-uid="lzUid" :comment="comment"
                              @getReplies="getReplies(comment)" @delComment="delComment">
              </comment-detail>
            </div>
          </div>
          <div v-if="noData" class="no-data">暂无更多评论</div>
          <div v-loading="commentIsLoading"></div>
        </el-card>
        <!--发送评论-->
        <div v-if="toSendComment">
          <send-comment :pid="pid" @close="toSendComment = false"></send-comment>
        </div>
      </template>
      <template v-else>
        <el-empty description="啊 哦，帖子不见了"></el-empty>
      </template>
    </template>

    <ul class="tool-sidebar">
      <li @click="toSendComment=true" title="评论">
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
import {chunk} from "@/utils/array.js"
import {POST_PER_PAGE} from "@/config/constVal.js"
import {debounce} from "@/utils/debounce.js"

const route = useRoute()
const router = useRouter()
//
const pid = Number(route.params.id)
const post = ref()
const noFound = ref(true)
const postIsLoading = ref(true)
const lzUid = ref() // 楼主的Uid
let commentIds = []
const getPost = async () => {
  let resPost = await getPostByPid(pid)
  if (resPost.state === 101) {
    return Promise.reject()
  }
  noFound.value = false
  lzUid.value = resPost.u_id
  resPost.img_id = getImg(resPost.img_id)
  resPost.someone_be_at = JSON.parse(resPost.someone_be_at)
  resPost.post_time = resPost.post_time.slice(0, 10) + " " + resPost.post_time.slice(11, 16)
  let reqUser = getUserByUid(resPost.u_id)
  let reqAgree = getPostAgree(pid)
  let reqCommentIds = getAllCommentIdsByPid(pid)
  let [resUser, resAgree, resCommentIds] = await Promise.all([reqUser, reqAgree, reqCommentIds])
  resPost.sender = resUser.nickname
  resPost.avatar = resUser.avatar
  if (resCommentIds.comment_ids) commentIds = chunk(resCommentIds.comment_ids, POST_PER_PAGE)
  let agreeCnt = 0, disagreeCnt = 0
  for (let [k, v] of Object.entries(resAgree.vote_message)) {
    v === true ? agreeCnt++ : disagreeCnt++
    if (Number(k) === store.state.ownId) {
      if (v) agreeColor.value = ENSURE_COLOR
      else disagreeColor.value = ENSURE_COLOR
    }
  }
  resPost.agreeCnt = agreeCnt
  resPost.disagreeCnt = disagreeCnt
  post.value = resPost
}
const commentsList = ref([])
let activePage = -1, activePageIds = null
const commentIsLoading = ref(true)
const noData = ref(false)
let getCommentsLock = false
const getComments = async () => {
  if (getCommentsLock) return
  getCommentsLock = true
  commentIsLoading.value = true
  activePageIds = commentIds[++activePage]
  if (activePageIds == null) {
    commentIsLoading.value = false
    noData.value = true
    return
  }
  let reqComments = Array(activePageIds.length)
  activePageIds.forEach((v, i) => {
    reqComments[i] = getCommentWithRepliesByCid(v)
  })
  let resComments = await Promise.all(reqComments)
  let reqUser = Array(activePageIds.length)
  let reqAgree = Array(activePageIds.length)
  resComments.forEach((v, i) => {
    v.cid = activePageIds[i]
    v.comment_time = v.comment_time.slice(0, 10) + " " + v.comment_time.slice(11, 16)
    v.img_id = getImg(v.img_id)
    v.someone_be_at = JSON.parse(v.someone_be_at)
    if (lzUid.value === v.u_id) v.isLz = true
    reqUser[i] = getUserByUid(v.u_id)
    reqAgree[i] = getCommentAgree(v.cid)
  })
  let resUser = await Promise.all(reqUser)
  let resAgree = await Promise.all(reqAgree)
  resComments.forEach((v, i) => {
    v.sender = resUser[i].nickname
    v.avatar = resUser[i].avatar
    v.isVote = 0
    v.agreeCnt = 0
    v.disagreeCnt = 0
  })
  resAgree.forEach((v, i) => {
    let agreeCnt = 0, disagreeCnt = 0
    for (let [key, value] of Object.entries(v.vote_message)) {
      value === true ? agreeCnt++ : disagreeCnt++
      if (Number(key) === store.state.ownId) {
        if (value) resComments[i].isVote = 1
        else resComments[i].isVote = -1
      }
    }
    resComments[i].agreeCnt = agreeCnt
    resComments[i].disagreeCnt = disagreeCnt
  })
  commentsList.value.push(resComments)
  commentIsLoading.value = false
  nextTick(() => {
    getPostsObserver.observe(elementList[elementList.length - (Math.ceil(POST_PER_PAGE / 2))])
  })
  getCommentsLock = false
}
const getReplies = async (comment) => {
  let res = await getCommentWithRepliesByCid(comment.cid)
  comment.replies = res.replies
}
getPost().then(() => {
  postIsLoading.value = false
  getComments().then(() => {
    nextTick(async () => {
      if (store.state.gotoElement) {
        let elementLocation = null, noFind = true
        while (!noData.value) {
          elementLocation = document.querySelector(store.state.gotoElement)
          if (elementLocation) {
            elementLocation.scrollIntoView({behavior: "auto", block: "center"})
            let color = elementLocation.style.background
            elementLocation.style.background = "#faecd8"
            setTimeout(() => {
              elementLocation.style.background = color
            }, 1000)
            noFind = false
            break
          } else {
            await getComments()
          }
        }
        if (noFind) {
          store.commit("alert", {message: "已被删除", type: "warning"})
        }
        store.commit("setGotoElement", "")
      }
    })
  })
}).catch(() => {
  postIsLoading.value = false
})
//监听元素，重新获取数据
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
  elementList = document.getElementsByClassName("comment-item")
})
// 发表评论
const toSendComment = ref(false)
// 刷新
const refresh = debounce(() => {
  activePage = -1
  commentsList.value = []
  getComments()
})
// 回到顶部
const gotoTop = () => {
  scrollTo(0, 0)
}
//删除
const deletePost = async () => {
  let message, type
  let res = await deletePostByPid(pid)
  if (res.state === 100 || res.state === 101) {
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