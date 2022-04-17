<template>
  <div class="reply-area">
    <el-row v-for="reply in replies" :key="replyKey(reply)" :id="replyKey(reply)">
      <el-col :span="1">
        <img class="img-32" :src="reply.avatar" alt="avatar"/>
        <div v-if="reply.isCz" class="cz-icon" title="层主"></div>
        <div v-else-if="reply.isLz" class="lz-icon" title="楼主"></div>
      </el-col>
      <el-col :span="23">
        <el-row>
          <div class="reply-main">
            <span class="user-nickname" @click="router.push('/profile/'+reply.u_id)">
              {{ reply.sender }}
            </span>
            :
            <span v-for="(nickname,uid) in reply.someone_be_at" :key="uid">
              @<span class="user-nickname" @click="router.push('/profile/'+uid)">{{ nickname }}</span>
            </span>
            <span>
              &ensp;{{ reply.reply_txt }}
            </span>
          </div>
        </el-row>
        <el-row v-if="reply.target>0">
          <div class="cite-content" @click="gotoCite(reply)">
            {{ reply.target_nickname }}&colon;&ensp;{{ reply.target_txt }}
          </div>
        </el-row>
        <el-row class="reply-tail">
          <span class="content-time">{{ reply.reply_time }}</span>
          &ensp;
          <template v-if="reply.own">
            <el-popconfirm confirm-button-text="确定" cancel-button-text="取消" title="确定删除回复吗?"
                           @confirm="deleteReply(reply)">
              <template #reference>
                <span class="delete-speak">删除</span>
              </template>
            </el-popconfirm>
          </template>
          &ensp;
          <span class="handle-text" @click="replyTarget(reply.reply_id)">回复</span>
        </el-row>
      </el-col>
    </el-row>
    <div>
      <div class="at-list">
        <el-tag v-for="at in atList" :key="at[0]" class="at-tag"
                type="success" closable @close="removeAt(at)">
          @{{ at[1] }}
        </el-tag>
        <el-input v-model="atInput" size="small" class="at-input"
                  @keyup.enter="handleAtInput" @blur="handleAtInput">
          <template #prefix>@</template>
        </el-input>
      </div>
      <el-input v-model="content" placeholder="内容" ref="replyInputRef"/>
      <div class="reply-input-tail">
        <el-tag v-show="target" class="reply-cite" closable type="success" size="large" @close="closeCite">
          {{ cite }}
        </el-tag>
        <el-button type="primary" size="small" @click="sendReply" class="reply-send">发送</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import {ref, toRefs, watch} from "vue"
import {useRouter} from "vue-router"
import {debounce} from "@/utils/debounce.js"
import {createReply, deleteReplyByRid} from "@/api/reply.js"
import store from "@/store"
import {getUserByUid, getUserIdByNickname} from "@/api/user.js"
import {validateAtInput} from "@/utils/validate.js"

const props = defineProps({
  replies: {
    type: Array,
    required: true,
  },
  cid: {
    type: Number,
    required: true,
  },
  czUid: {
    type: Number,
    required: true,
  },
  lzUid: {
    type: Number,
    required: true,
  },
})
const {replies} = toRefs(props)
const emits = defineEmits(["getReplies", "delReply"])
const router = useRouter()
const target = ref(0)
const replyInputRef = ref(null)
const content = ref("")
const replyKey = (reply) => "c" + reply.comment_id + "r" + reply.reply_id
//
const processReplies = async () => {
  let reqUser = Array(replies.value.length)
  let reqTarUser = Array(replies.value.length)
  replies.value.forEach((v, i) => {
    if (v.u_id === store.state.ownId) v.own = true
    if (v.u_id === props.czUid) v.isCz = true
    else if (v.u_id === props.lzUid) v.isLz = true
    v.someone_be_at = JSON.parse(v.someone_be_at)
    v.reply_time = v.reply_time.slice(0, 10) + " " + v.reply_time.slice(11, 16)
    reqUser[i] = getUserByUid(v.u_id)
    if (v.target > 0) {
      let tarReply = replies.value.find(i => i.reply_id === v.target)
      let txt
      if (tarReply) {
        v.tarExist = true
        txt = tarReply.reply_txt
        if (txt.length > 100) {
          txt = txt.slice(0, 100) + "..."
        }
      } else {
        v.tarExist = false
        txt = "该引用已被删除"
      }
      v.target_txt = txt
      reqTarUser[i] = getUserByUid(v.target_uid)
    }
  })
  let resUser = await Promise.all(reqUser)
  let resTarUser = await Promise.all(reqTarUser)
  replies.value.forEach((v, i) => {
    v.sender = resUser[i].nickname
    v.avatar = resUser[i].avatar
    if (v.target > 0) v.target_nickname = resTarUser[i].nickname
  })
}
watch(replies, async () => {
  await processReplies()
})
//引用
const cite = ref("")
watch(target, (newValue) => {
  if (newValue > 0) {
    let tar = replies.value.find(e => e.reply_id === newValue)
    let txt = tar.reply_txt
    if (txt.length > 30) {
      txt = txt.slice(0, 30) + "..."
    }
    cite.value = tar.sender + ": " + txt
  } else {
    cite.value = ""
  }
})
const closeCite = () => {
  target.value = 0
}
const gotoCite = (reply) => {
  if (reply.tarExist) {
    const target = replies.value.find(i => i.reply_id === reply.target)
    const key = replyKey(target)
    let elementLocation = document.querySelector("#" + key)
    elementLocation.scrollIntoView({behavior: "auto", block: "nearest"})
    let color = elementLocation.style.background
    elementLocation.style.background = "#faecd8"
    setTimeout(() => {
      elementLocation.style.background = color
    }, 1000)
  } else {
    store.commit("alert", {message: "引用已被删除", type: "info"})
  }
}
//
const deleteReply = debounce(async (reply) => {
  let message, type
  let res = await deleteReplyByRid(reply.reply_id)
  if (res.state === 100) {
    message = "删除成功"
    type = "success"
    reply.own = false
    emits("delReply", reply.reply_id)
  } else {
    message = res.state_message
    type = "error"
  }
  store.commit("alert", {message, type})
})
//@人
const atInput = ref("")
const atList = ref([])
const handleAtInput = async () => {
  if (atInput.value === "") return
  if (validateAtInput(atInput.value)) {
    if (store.state.userMap.get(store.state.ownId).nickname === atInput.value) {
      store.commit("alert", {message: "禁止自娱自乐", type: "warning"})
    } else if (atList.value.findIndex((at) => at[1] === atInput.value) > -1) {
      store.commit("alert", {message: "已经@啦", type: "info"})
    } else {
      let user = Array(2)
      user[1] = atInput.value
      let res = await getUserIdByNickname(atInput.value)
      if (res.u_id > 0) {
        user[0] = res.u_id
        atInput.value = ""
        atList.value.push(user)
      } else {
        store.commit("alert", {message: "该用户不存在", type: "error"})
      }
    }
  } else {
    store.commit("alert", {message: "请输入合法的昵称", type: "error"})
  }
}
const removeAt = (at) => {
  atList.value.splice(atList.value.indexOf(at), 1)
}
//回复
const replyTarget = (rid) => {
  target.value = rid
  replyInputRef.value.focus()
}
const sendReply = debounce(async () => {
  if (store.state.ownSilence > new Date().valueOf()) {
    store.commit("alert", {message: "您已被禁言", type: "warning"})
    return
  }
  if (content.value === "") {
    store.commit("alert", {message: "内容不能为空", type: "error"})
    return
  }
  let message, type
  let atObj = {}
  atList.value.forEach((at) => {
    atObj[at[0]] = at[1]
  })
  let res = await createReply(props.cid, content.value, target.value, atObj)
  if (res.state === 100) {
    message = "回复成功"
    type = "success"
    target.value = 0
    content.value = ""
    atList.value = []
    emits("getReplies")
  } else {
    message = res.state_message
    type = "error"
  }
  store.commit("alert", {message, type})
})
//
processReplies()
defineExpose({replyInputRef})
</script>

<style scoped>
.reply-area {
  width: 100%;
  padding: 1rem;
  background-color: #f2f6fc;
}

.reply-main {
  margin-left: 10px;
  min-height: 2rem;
}

.reply-tail {
  margin: 0.3rem 0;
  font-size: 0.7rem;
  justify-content: end;
}

.reply-input-tail {
  margin-top: 0.3rem;
}

.reply-cite {
  float: left;
}

.reply-send {
  float: right;
}

.cite-content {
  max-width: 78%;
  margin-top: 0.3rem;
  padding: 0.3rem;
  font-size: 0.86rem;
  cursor: pointer;
  background-color: #e9e9eb;
  color: #73767a;
}

.cz-icon {
  position: absolute;
  left: 20px;
  top: -4px;
  width: 0;
  height: 0;
  border-right: 16px solid #53a8ff;
  border-bottom: 16px solid transparent;
}

.lz-icon {
  position: absolute;
  left: 20px;
  top: -4px;
  width: 0;
  height: 0;
  border-right: 16px solid #2d64b3;
  border-bottom: 16px solid transparent;
}
</style>