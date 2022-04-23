<template>
  <el-card shadow="never" class="send-card">
    <div class="send-item">
      <add-picture :remove="remove" @uploadImg="uploadImg" @removeImg="removeImg"></add-picture>
    </div>
    <div class="at-list">
      <el-tag v-for="at in atList" :key="'a'+at[0]" class="at-tag"
              type="success" closable @close="removeAt(at)">
        @{{ at[1] }}
      </el-tag>
      <el-input v-model="atInput" size="small" class="at-input"
                @keyup.enter="handleAtInput" @blur="handleAtInput">
        <template #prefix>@</template>
      </el-input>
    </div>
    <slot></slot>
    <div class="send-item">
      <el-input type="textarea" v-model="content" :rows="5" placeholder="按 ctrl+entry 发送"
                @keyup.ctrl.enter.exact="send" ref="inputRef"/>
    </div>
    <div class="send-btn">
      <el-button type="primary" @click="send" :loading="sendLoading">发送</el-button>
    </div>
  </el-card>
</template>

<script setup>
import {onMounted, ref} from "vue"
import AddPicture from "@/components/AddPicture.vue"
import store from "@/store"
import {createPost} from "@/api/post.js"
import {getUserIdByNickname} from "@/api/user.js"
import {checkNickname} from "@/utils/validate.js"
import {createComment} from "@/api/comment.js"
import {useRouter} from "vue-router"

const props = defineProps({
    mode: {
      type: String,
      required: true,
    },
    zone: {
      type: Number,
    },
    title: {
      type: String,
    },
    pid: {
      type: Number,
    },
  },
)
const emits = defineEmits(["sendSuccess"])
const content = ref("")
const router = useRouter()
//引用
const inputRef = ref()
onMounted(() => {
  inputRef.value.focus()
})
//
//@人
const atInput = ref("")
const atList = ref([])
const handleAtInput = async () => {
  if (atInput.value === "") return
  if (checkNickname(atInput.value)) {
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
//图片
const remove = ref(false)
let image = null
const uploadImg = (img) => {
  image = img
}
const removeImg = () => {
  image = null
}
//
const sendLoading = ref(false)
const send = async () => {
  if (store.state.ownSilence > new Date().valueOf()) {
    store.commit("alert", {message: "您已被禁言", type: "warning"})
    return
  }
  if (content.value === "") {
    store.commit("alert", {message: "内容不能为空", type: "error"})
    return
  }
  const data = new FormData()
  if (props.mode === "post") {
    let title = props.title
    if (title === "") {
      title = content.value.slice(0, 50)
    }
    sendLoading.value = true
    data.append("post_name", title)
    data.append("post_txt", content.value)
    data.append("post_txt_html", content.value)
    data.append("zone", props.zone)
    if (image) data.append("image", image)
    let atObj = {}
    atList.value.forEach((at) => {
      atObj[at[0]] = at[1]
    })
    data.append("someone_be_at", JSON.stringify(atObj))
    let res = await createPost(data)
    if (res.state === 100 || res.state === 200) {
      content.value = ""
      remove.value = !remove.value
      atList.value = []
      window.scroll(0, 0)
      emits("sendSuccess")
      res.state === 100 ?
        store.commit("alert", {message: "发帖成功", type: "success"})
        : store.commit("alert", {message: "发帖成功，等待管理员审核", type: "warning"})
    } else {
      store.commit("alert", {message: res.state_message, type: "error"})
    }
  } else {
    sendLoading.value = true
    data.append("post_id", props.pid)
    data.append("comment_txt", content.value)
    if (image) data.append("image", image)
    let atObj = {}
    atList.value.forEach((at) => {
      atObj[at[0]] = at[1]
    })
    data.append("someone_be_at", JSON.stringify(atObj))
    let res = await createComment(data)
    if (res.state === 100) {
      content.value = ""
      remove.value = !remove.value
      atList.value = []
      emits("sendSuccess")
      store.commit("alert", {message: "评论成功", type: "success"})
    } else if (res.state === 101) {
      router.replace({path: history.state.back})
      store.commit("alert", {message: "帖子已被删除，无法评论", type: "warning"})
    } else {
      store.commit("alert", {message: res.state_message, type: "error"})
    }
  }
  sendLoading.value = false
}
</script>

<style scoped>
.send-card {
  margin-top: 1rem
}

.send-btn {
  display: flex;
  justify-content: end;
}

.at-input:deep(.el-input__inner) {
  padding-left: 24px !important;
}
</style>