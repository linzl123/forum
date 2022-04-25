<template>
  <div>
    <template v-if="self">
      <el-row :gutter="12">
        <el-col :span="5">
          <el-card style="text-align: center" shadow="never">
            <template #header>
              <div>
                <el-upload action="" :http-request="upload" accept="image/jpeg,image/png"
                           :before-upload="beforeAvatarUpload" :show-file-list="false">
                  <el-avatar :src="avatarSrc" :size="100" shape="square" alt="头像"></el-avatar>
                </el-upload>
              </div>
            </template>
            <div class="user-info">
              <div>用户名：{{ username }}</div>
              <div>昵称：{{ nickname }}</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="19">
          <el-card shadow="never" class="right-record">
            <template #header>
              <ul class="profile-list">
                <li class="profile-list-item" v-for="item in profileList" :key="item[1]"
                    :class="{active:item[1]===route.name}"
                    @click="router.push({name:item[1]})">
                  {{ item[0] }}
                </li>
                <li class="profile-list-item" :class="{active:'Setting'===route.name}"
                    @click="router.push({name:'Setting'})">
                  设置
                </li>
              </ul>
            </template>
            <div class="record-list">
              <router-view></router-view>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </template>

    <template v-else>
      <template v-if="exist">
        <el-row :gutter="12">
          <el-col :span="5">
            <el-card style="text-align: center" shadow="never">
              <template #header>
                <el-avatar :src="avatarSrc" :size="100" shape="square" alt="头像"></el-avatar>
              </template>
              <div class="user-info">
                <div>昵称：{{ nickname }}</div>
              </div>
              <div class="user-handle">
                <subscribe-handle :uid="tarUid"></subscribe-handle>
                <el-button plain @click="sendLetter">私信</el-button>
              </div>
            </el-card>
          </el-col>
          <el-col :span="19">
            <el-card shadow="never" class="right-record">
              <template #header>
                <ul class="profile-list">
                  <li class="profile-list-item" v-for="item in profileList" :key="item[1]"
                      :class="{active:item[1]===route.name}"
                      @click="router.push({name:item[1]})">
                    {{ item[0] }}
                  </li>
                </ul>
              </template>
              <div class="record-list">
                <router-view></router-view>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </template>
      <template v-else>
        <el-empty description="啊 哦，该用户不存在"></el-empty>
      </template>
    </template>
  </div>
</template>

<script setup>
import {onBeforeMount, onUnmounted, ref} from "vue"
import {getImg, uploadImg} from "@/api/image"
import {getUserByUid} from "@/api/user"
import store from "@/store"
import {useRoute, useRouter} from "vue-router"
import SubscribeHandle from "@/components/SubscribeHandle.vue"

const route = useRoute()
const router = useRouter()
const curUid = store.state.ownId
const tarUid = Number(route.params.id)
const self = curUid === tarUid
const exist = ref(true)
let username
const nickname = ref()
const avatarSrc = ref()
//
console.log(123)
const profileList = [
  ["帖子", "Post"],
  ["评论", "Comment"],
  ["回复", "Reply"],
  ["收藏", "Favorite"],
  ["关注", "Subscribe"],
]
//
if (!self) {
  onBeforeMount(async () => {
    let res = await getUserByUid(tarUid)
    if (res) {
      nickname.value = res.nickname
      avatarSrc.value = res.avatar
    } else {
      exist.value = false
    }
  })
} else {
  nickname.value = store.state.userMap.get(curUid).nickname
  avatarSrc.value = store.state.userMap.get(curUid).avatar
  username = store.state.ownName
}
//
const beforeAvatarUpload = (file) => {
  const limitType = file.type === "image/jpeg" || file.type === "image/png"
  const limitSize = file.size / 1024 / 1024 < 1
  if (!limitType) {
    store.commit("alert", {message: "文件格式必须为 JPG 或 PNG", type: "error"})
  } else if (!limitSize) {
    store.commit("alert", {message: "文件大小必须小于 1MB", type: "error"})
  }
  return limitType && limitSize
}
const upload = async (request) => {
  const file = request.file
  const data = new FormData()
  data.append("object", "user")
  data.append("object_id", curUid)
  data.append("image", file, file.name)
  let message, type
  let resUpload = await uploadImg(data)
  if (resUpload.state === 100) {
    message = "更换头像成功"
    type = "success"
    let resUser = await getUserByUid(curUid)
    resUser.avatar = getImg(resUpload.img_id)
    URL.revokeObjectURL(avatarSrc.value)
    avatarSrc.value = URL.createObjectURL(file)
  } else {
    message = resUpload.state_message
    type = "error"
  }
  store.commit("alert", {message, type})
}
onUnmounted(() => {
  URL.revokeObjectURL(avatarSrc.value)
})
//
const sendLetter = async () => {
  store.commit("setGotoLetter", route.params.id)
  router.push("/message/letter")
}
</script>

<style scoped>
.user-info > div {
  margin-bottom: 0.8rem;
}

.user-handle {
  display: flex;
  justify-content: center;
}

.right-record {
  height: 86vh;
}

.profile-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.profile-list-item {
  display: inline-block;
  margin: 0 1rem;
  cursor: pointer;
}

.profile-list-item:hover {
  color: #2faee3;
}

.record-list {
  height: 74vh;
  overflow-y: auto;
}

.active {
  color: #2faee3;
}
</style>