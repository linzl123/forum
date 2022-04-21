<template>
  <div>
    <div class="setting-profile-title">
      <h4>个人资料</h4>
      <!--      <el-button type="primary" @click="saveProfile">保存</el-button>-->
    </div>
    <div class="setting-profile-item">
      <span class="setting-profile-name">昵称：</span>
      <span class="name-text">{{ nickname }}</span>
      <!--      <el-input class="setting-profile-input" v-model="inputNickname"></el-input>-->
    </div>
    <div class="setting-profile-item">
      <span class="setting-profile-name">用户名：</span>
      <span class="name-text">{{ uname }}</span>
    </div>
    <div class="setting-profile-item">
      <el-button @click="changePwd" :loading="changePwdLoading">修改密码</el-button>
    </div>
  </div>
  <modify-password :pwd-dialog="pwdDialog" :question="question"
                   :uname="uname" @close="pwdDialog=false"></modify-password>
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
import {reactive, ref} from "vue"
import {fetchPasswordQuestion, fetchResetPassword, getPrivacySetting, setPrivacySetting} from "@/api/user.js"
import store from "@/store"
import ModifyPassword from "@/components/ModifyPassword.vue"
import {validatePassword} from "@/utils/validate.js"

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
const uname = store.state.ownName
const nickname = store.state.userMap.get(uid).nickname
const avatar = store.state.userMap.get(uid).avatar
const inputNickname = ref(nickname)

const saveProfile = () => {
  if (nickname !== inputNickname.value) {
    //todo modify nickname
  }
}
// 修改密码
const pwdDialog = ref(false)
const changePwdLoading = ref(false)
const question = ref("")
const changePwd = async () => {
  changePwdLoading.value = true
  let res = await fetchPasswordQuestion(uname)
  if (res.state === 100) {
    question.value = res.password_question
    pwdDialog.value = true
  } else if (res.state === 101) {
    store.commit("alert", {message: "用户不存在", type: "error"})
  } else {
    store.commit("alert", {message: "服务器出错", type: "error"})
  }
  changePwdLoading.value = false
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