<template>
  <div>
    <div class="setting-profile-title">
      <h4>个人资料</h4>
      <el-button type="primary" @click="saveProfile">保存</el-button>
    </div>
    <div class="setting-profile-item">
      <span class="setting-profile-name">昵称：</span>
      <el-input class="setting-profile-input" v-model="inputNickname"></el-input>
    </div>
    <div class="setting-profile-item">
      <span class="setting-profile-name">用户名：</span>
      <span class="name-text">{{ name }}</span>
    </div>
  </div>
  <el-divider></el-divider>
  <div>
    <h4>隐私设置</h4>
    <div v-for="(privacy,idx) in privacyList" :key="idx">
      <span class="setting-privacy-name">{{ privacy }}</span>
      <el-switch v-model="privacySwitchList[idx].model" :loading="privacySwitchList[idx].loading"
                 @click="toggle(privacySwitchList[idx],idx)">
      </el-switch>
    </div>
  </div>
</template>

<script setup>
import {onUnmounted, ref} from "vue"
import {getPrivacySetting, getUserByUid, setPrivacySetting} from "@/api/user.js"
import store from "@/store"
import {getImg, uploadImg} from "@/api/image.js"

// 隐私
const privacyList = [
  "隐藏我的帖子",
  "隐藏我的评论和回复",
  "隐藏我的收藏",
  "隐藏我的关注",
]
const privacySwitchList = ref(Array(privacyList.length).fill(null).map(() => ({loading: false, model: null})))
getPrivacySetting().then((ret) => {
  privacySwitchList.value[0].model = ret.post_is_private
  privacySwitchList.value[1].model = ret.comment_and_reply_is_private
  privacySwitchList.value[2].model = ret.saved_post_is_private
  privacySwitchList.value[3].model = ret.subscribed_is_private
})
const toggle = async (privacySwitch, idx) => {
  privacySwitch.loading = true
  await setPrivacySetting(idx, privacySwitch.model)
  privacySwitch.loading = false
}
// 个人资料
const uid = store.state.ownId
const nickname = store.state.userMap.get(uid).nickname
const avatar = store.state.userMap.get(uid).avatar
const inputNickname = ref(nickname)
const name = localStorage.getItem("uname")

const saveProfile = () => {
  if (nickname !== inputNickname.value) {
    //todo modify nickname
  }
}
</script>

<style scoped>
.setting-privacy-name {
  display: inline-block;
  width: 200px;
}

.setting-profile-title {
  width: 60%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.setting-profile-item {
  display: flex;
  align-items: center;
  margin-bottom: 1em;
}

.setting-profile-name {
  width: 5em;
  text-align: right;
}

.setting-profile-input {
  width: 50%;
}

.name-text {
  color: #898989;
  font-size: 14px;
}
</style>