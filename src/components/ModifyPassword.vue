<template>
  <el-dialog v-model="dialog" width="500px" @close="closePwdDialog">
    <template #title>
      <strong>修改密码</strong>
    </template>
    <div class="question-inline">
      <div class="question-left">密保问题</div>
      <div class="question-right">{{ question }}</div>
    </div>
    <el-form ref="pwdFormRef" :model="pwdForm" :rules="pwdRules" label-width="6em">
      <el-form-item label="密保答案" prop="answer">
        <el-input v-model="pwdForm.answer"></el-input>
      </el-form-item>
      <el-form-item label="新密码" prop="newPwd">
        <el-input v-model="pwdForm.newPwd" type="password" show-password></el-input>
      </el-form-item>
      <el-form-item label="确认密码" prop="checkPwd" @keyup.enter.exact="savePwd">
        <el-input v-model="pwdForm.checkPwd" type="password" show-password></el-input>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button type="primary" @click="savePwd" :loading="savePwdLoading">确认</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import {reactive, ref} from "vue"
import {validatePassword} from "@/utils/validate.js"
import {fetchResetPassword} from "@/api/user.js"
import store from "@/store"

const props = defineProps({
  question: {
    type: String,
    required: true,
  },
  uname: {
    type: String,
    required: true,
  },
})
const emits = defineEmits(["close"])
const dialog = ref(true)
const pwdFormRef = ref()
const pwdForm = reactive({
  answer: "",
  newPwd: "",
  checkPwd: "",
})
const validatePassword2 = (rule, value, callback) => {
  if (value === "") {
    callback(new Error("请再次输入密码"))
  } else if (value !== pwdForm.newPwd) {
    callback(new Error("两次密码不一致"))
  } else {
    callback()
  }
}
const pwdRules = reactive({
  answer: [{required: true, message: "请输入密保答案"}],
  newPwd: [{required: true, validator: validatePassword}],
  checkPwd: [{required: true, validator: validatePassword2}],
})
const savePwdLoading = ref(false)
const savePwd = async () => {
  savePwdLoading.value = true
  pwdFormRef.value.validate(async (success) => {
    if (success) {
      let res = await fetchResetPassword(props.uname, pwdForm.newPwd, pwdForm.answer)
      if (res.state === 100) {
        emits("close")
        store.commit("alert", {message: "修改密码成功", type: "success"})
      } else if (res.state === 101) {
        store.commit("alert", {message: "密保答案错误", type: "error"})
      } else {
        store.commit("alert", {message: "服务器出错", type: "error"})
      }
    }
    savePwdLoading.value = false
  })
}
const closePwdDialog = () => {
  emits("close")
  pwdFormRef.value.resetFields(Object.keys(pwdForm))
}
</script>

<style scoped>
.question-inline {
  display: flex;
  margin-bottom: 18px;
  align-items: center;
}

.question-left {
  width: 6em;
  text-align: right;
  line-height: 32px;
  padding-right: 12px;
  box-sizing: border-box;
}

.question-right {
  padding-left: 11px;
}
</style>