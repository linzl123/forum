<template>
  <div class="dialog">
    <div class="new-message" v-show="hasNewMsg">
      <div class="drop-down" @click="dropDown">
        <svg class="drop-down-icon" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg"
             width="12" height="12">
          <path
            d="M915.110634 526.94854c-11.698858-11.698858-30.697002-11.698858-42.39586 0L490.852065 908.711259c-11.698858 11.698858-11.698858 30.697002 0 42.395859s30.697002 11.698858 42.39586 0l381.762718-381.762718c11.798848-11.698858 11.798848-30.697002 0.099991-42.39586z"
            fill="#09bb07"></path>
          <path
            d="M534.247827 908.811249l-381.962699-381.962699c-11.698858-11.698858-30.697002-11.698858-42.395859 0s-11.698858 30.697002 0 42.39586l381.962699 381.962699c11.698858 11.698858 30.697002 11.698858 42.395859 0s11.698858-30.697002 0-42.39586z"
            fill="#09bb07"></path>
          <path
            d="M915.110634 72.992872c-11.698858-11.698858-30.697002-11.698858-42.39586 0L490.852065 454.75559c-11.698858 11.698858-11.698858 30.697002 0 42.39586s30.697002 11.698858 42.39586 0l381.762718-381.762718c11.798848-11.698858 11.798848-30.697002 0.099991-42.39586z"
            fill="#09bb07"></path>
          <path
            d="M534.247827 454.855581l-381.962699-381.962699c-11.698858-11.698858-30.697002-11.698858-42.395859 0s-11.698858 30.697002 0 42.395859l381.962699 381.962699c11.698858 11.698858 30.697002 11.698858 42.395859 0s11.698858-30.697002 0-42.395859z"
            fill="#09bb07"></path>
        </svg>
        <span class="new-message-text">有新消息</span>
      </div>
      <el-divider direction="vertical"></el-divider>
      <div class="cancel-drop-down">
        <span @click="hasNewMsg=false">×</span>
      </div>
    </div>
    <div class="dialog-list">
      <div v-for="msg in dialog" :key="msg.chat_id" :id="letterId(msg.chat_id)" class="dialog-message">
        <div class="dialog-time">{{ msg.chat_time }}</div>
        <template v-if="msg.am_i_sender">
          <div class="dialog-item">
            <div class="own-user">
              <el-avatar :size="30" class="user-avatar"
                         :src="ownAvatar" @click="gotoOwn">
              </el-avatar>
            </div>
            <div class="own-content">
              <div>{{ msg.chat_txt }}</div>
              <img v-if="msg.img_id" class="content-img" :src="getImg(msg.img_id)"/>
            </div>
          </div>
        </template>
        <template v-else>
          <div class="dialog-item">
            <div class="peer-user">
              <el-avatar :size="30" class="user-avatar"
                         :src="tarAvatar" @click="gotoPeer">
              </el-avatar>
            </div>
            <div class="peer-content">
              <div>{{ msg.chat_txt }}</div>
              <img v-if="msg.img_id" class="content-img" :src="getImg(msg.img_id)"/>
            </div>
          </div>
        </template>
      </div>
    </div>

    <div class="send-box">
      <div class="send-img-box">
        <input id="img" accept="image/png,image/jpeg" type="file" @input="upload" style="width: 0;" ref="imgRef"/>
        <label for="img" class="send-img">添加图片</label>
        &ensp;<span class="send-img-text">{{ imgName }}</span>
        <img :src="imgSrc" class="send-img-hover"/>
        <span v-show="imgName!==''" class="delete-image" @click="remove">✖</span>
      </div>
      <div>
        <el-input type="textarea" v-model="content" :rows="5" @keyup.ctrl.enter.exact="send" class="send-input"/>
      </div>
      <div class="send-btn-box">
        <el-button color="#1389BF" @click="send" class="send-btn" :loading="sendLoading">
          发送 / Ctrl+Entry
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import {computed, nextTick, onUnmounted, ref, toRefs, watch} from "vue"
import store from "@/store"
import {createLetter} from "@/api/message.js"
import {getImg} from "@/api/image.js"
import {useRouter} from "vue-router"

const props = defineProps({
  tarUid: {
    type: Number,
    required: true,
  },
  dialog: {
    type: Object,
    required: true,
  },
  unreadLetters: {
    type: Array,
    required: true,
  },
})
const emits = defineEmits(["getLetter", "rmUnread", "rmAllUnread"])
const router = useRouter()
const ownUid = store.state.ownId
const letterId = (lid) => "l" + lid
// 根据UID展示不同的头像和昵称
const ownAvatar = store.state.userMap.get(ownUid).avatar
const ownNickname = store.state.userMap.get(ownUid).nickname
const tarAvatar = computed(() => store.state.userMap.get(props.tarUid).avatar)
const tarNickname = computed(() => store.state.userMap.get(props.tarUid).nickname)
if (store.state.gotoLetter) {
  store.commit("setGotoLetter", "")
}
// 发送框的内容、图片和发送函数
const content = ref("")
let imgFile = null
const imgSrc = ref("")
const imgName = ref("")
const imgRef = ref()
const sendLoading = ref(false)
const send = async () => {
  if (content.value === "") {
    store.commit("alert", {message: "内容不能为空", type: "error"})
    return
  }
  sendLoading.value = true
  const data = new FormData()
  data.append("addressee_id", props.tarUid)
  data.append("chat_txt", content.value)
  if (imgFile) data.append("image", imgFile)
  let res = await createLetter(data)
  if (res.state === 100) {
    imgFile = null
    imgName.value = ""
    content.value = ""
    emits("rmAllUnread", props.tarUid)
    emits("getLetter", props.tarUid)
  } else {
    store.commit("alert", {message: res.state_message, type: "error"})
  }
  sendLoading.value = false
}
// 图片相关的处理函数
const remove = () => {
  imgSrc.value = ""
  imgName.value = ""
  imgRef.value.value = ""
  imgFile = null
}
const beforeUpload = (file) => {
  if (!file) return
  const isJPG = file.type === "image/jpeg" || file.type === "image/png"
  const isLt1M = file.size / 1024 / 1024 < 1
  if (!isJPG) {
    store.commit("alert", {message: "文件格式必须为 JPG 或 PNG", type: "error"})
  } else if (!isLt1M) {
    store.commit("alert", {message: "文件大小必须小于 1MB", type: "error"})
  }
  return isJPG && isLt1M
}
const upload = (e) => {
  imgFile = e.target.files[0]
  if (!imgFile || !beforeUpload(imgFile)) {
    imgRef.value.value = ""
    imgFile = null
    return
  }
  imgName.value = imgFile.name
  URL.revokeObjectURL(imgSrc.value)
  imgSrc.value = URL.createObjectURL(imgFile)
}
// 点击头像跳转到个人资料
const gotoPeer = () => {
  router.push("/profile/" + props.tarUid)
}
const gotoOwn = () => {
  router.push("/profile/" + ownUid)
}
// 首次进入+切换用户的滚动+观察是否已读消息
const callback = (entries, observer) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      observer.unobserve(entry.target)
      let lid = Number(entry.target.id.slice(1))
      let idx = props.unreadLetters.indexOf(lid)
      if (idx !== -1) {
        emits("rmUnread", lid)
      }
    }
  })
}
const options = {
  root: document.querySelector(".dialog-list"),
  threshold: 0.5,
}
let readObserver, msgElements, reachBottom = true
let hasNewMsg = ref(false)
nextTick(() => {
  if (props.unreadLetters.length > 0) {
    document.querySelector("#l" + props.unreadLetters[0]).scrollIntoView({behavior: "auto", block: "start"})
  } else {
    document.querySelector(".dialog-message:last-child").scrollIntoView({behavior: "auto", block: "start"})
  }
  msgElements = document.getElementsByClassName("dialog-message")
  readObserver = new IntersectionObserver(callback, options)
  Array.from(msgElements).forEach((v) => {
    readObserver.observe(v)
  })
  // 触底监听
  let dialogListDom = document.querySelector(".dialog-list")
  dialogListDom.addEventListener("scroll", () => {
    if (parseInt(window.getComputedStyle(dialogListDom).height) + dialogListDom.scrollTop + 18 >= dialogListDom.scrollHeight) {
      reachBottom = true
      hasNewMsg.value = false
    } else {
      reachBottom = false
    }
  })
})
const {tarUid} = toRefs(props)
watch(tarUid, () => {
  nextTick(() => {
    readObserver.disconnect()
    readObserver = new IntersectionObserver(callback, options)
    Array.from(msgElements).forEach((v) => {
      readObserver.observe(v)
    })
  })
})
const {dialog} = toRefs(props)
watch(dialog, () => {
  nextTick(() => {
    readObserver.disconnect()
    readObserver = new IntersectionObserver(callback, options)
    Array.from(msgElements).forEach((v) => {
      readObserver.observe(v)
    })
    if (reachBottom) {
      if (props.unreadLetters.length > 0) {
        document.querySelector("#l" + props.unreadLetters[0]).scrollIntoView({behavior: "auto", block: "start"})
      } else {
        document.querySelector(".dialog-message:last-child").scrollIntoView({behavior: "auto", block: "start"})
      }
    } else {
      if (props.unreadLetters.length > 0) {
        hasNewMsg.value = true
      }
    }
  })
})
// 滚动到第一条未读
const dropDown = () => {
  document.querySelector("#l" + props.unreadLetters[0]).scrollIntoView({behavior: "auto", block: "start"})
  hasNewMsg.value = false
}
// 挂载时清除图片在浏览器的URL
onUnmounted(() => {
  URL.revokeObjectURL(imgSrc.value)
  readObserver.disconnect()
})
</script>

<style scoped>
.dialog {
  height: calc(100vh - 176px);
  background-color: #f4f5f7;
  position: relative;
}

.dialog-list {
  height: calc(100% - 210px);
  padding: 8px 0 8px 8px;
  overflow-y: auto;
}

.dialog-item {
  min-height: 48px;
  padding: 0 8px 8px;
  overflow: hidden;
}

.own-user {
  float: right;
}

.own-content {
  float: right;
  max-width: 480px;
  margin: 0 5px;
  background-color: #95ec69;
  border-radius: 8px 0 8px 8px;
  padding: 4px 8px;
}

.peer-user {
  float: left;
}

.peer-content {
  float: left;
  max-width: 480px;
  margin: 0 5px;
  background-color: #ffffff;
  border-radius: 0 8px 8px 8px;
  padding: 4px 8px;
}

.user-avatar {
  cursor: pointer;
}

.dialog-time {
  color: #999999;
  font-size: 12px;
  padding: 10px 0 10px;
  text-align: center;
}

.send-box {
  height: 183px;
  border-top: 1px solid #d8d8d8;
  padding: 5px;
}

.send-img-box {
  margin: 6px;
}

.send-img-text {
  color: blue;
  cursor: default;
}

.send-img-text:hover + .send-img-hover {
  display: block;
  color: red;
}

.send-img-hover {
  z-index: 1;
  width: 590px;
  height: 330px;
  object-fit: scale-down;
  position: absolute;
  top: 0;
  left: 0;
  display: none;
}

.send-img {
  padding: 5px 8px;
  background-color: #409eff;
  border: none;
  border-radius: 5px;
  color: white;
  cursor: pointer;
}

.send-img:hover {
  background-color: #79bbff;
}

.send-btn-box {
  display: flex;
  justify-content: right;
}

.send-btn {
  color: white;
  margin-top: 5px;
  height: 25px;
}

.new-message {
  position: absolute;
  left: 75%;
  top: calc(100% - 250px);
  background-color: #ffffff;
  padding: 5px 8px;
  display: flex;
  align-items: center;
}

.new-message-text {
  color: #09bb07;
  font-size: 13px;
}

.drop-down-icon {
  margin-right: 7px;
}

.drop-down {
  cursor: pointer;
}

.cancel-drop-down {
  cursor: pointer;
}
</style>