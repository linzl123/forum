<template>
  <div class="login-bg">
    <div class="login-card">
      <div class="login-header">欢迎回来</div>
      <div class="login-body">
        <el-form ref="formRef" :model="loginForm" :rules="rules" label-width="4em">
          <el-form-item label="帐号" prop="username">
            <el-input v-model="loginForm.username" type="text" autocomplete="on" ref="accountInput"></el-input>
          </el-form-item>
          <el-form-item label="密码" prop="password" @keyup.exact.enter="signin">
            <el-input v-model="loginForm.password" type="password" show-password autocomplete="off"></el-input>
          </el-form-item>
          <el-button type="primary" size="large" style="width: 100%;" :loading="loading" @click="signin">
            登录
          </el-button>
          <div class="forget-register">
            <span class="forget-register-item" @click="changePwd">忘记密码</span>
            <span class="forget-register-item" @click="router.push('/register')">新用户</span>
          </div>
        </el-form>
      </div>
    </div>
    <div v-if="pwdDialog">
      <modify-password :question="question" :uname="loginForm.username" @close="pwdDialog = false"></modify-password>
    </div>
  </div>
</template>

<script setup>
import {onMounted, reactive, ref} from "vue"
import {useRoute, useRouter} from "vue-router"
import {fetchPasswordQuestion, login} from "@/api/user"
import store from "@/store"
import {checkNickname, validatePassword, validateUsername} from "@/utils/validate"
import ModifyPassword from "@/components/ModifyPassword.vue"

const router = useRouter()
if (store.state.ownId !== 0) {
  router.push("/")
}

const loginForm = reactive({
  username: "123",
  password: "123",
})
const accountInput = ref()
const route = useRoute()

const formRef = ref()
const rules = reactive({
  username: [{required: true, validator: validateUsername}],
  password: [{required: true, validator: validatePassword}],
})

onMounted(() => {
  accountInput.value.focus()
})

const loading = ref(false)
const signin = () => {
  loading.value = true
  formRef.value.validate(async (success) => {
    if (success) {
      let res = await login(loginForm.username, loginForm.password)
      if (res.state === 100) {
        store.commit("alert", {message: "登录成功", type: "success"})
        localStorage.setItem("uname", loginForm.username)
        if (route.query.to) await router.push(route.query.to)
        else await router.push("/")
      } else {
        store.commit("alert", {message: res.state_message, type: "error"})
      }
    }
    loading.value = false
  })
}
// 忘记密码
const pwdDialog = ref(false)
const changePwdLoading = ref(false)
const question = ref("")
const changePwd = async () => {
  if (checkNickname(loginForm.username)) {
    changePwdLoading.value = true
    let res = await fetchPasswordQuestion(loginForm.username)
    if (res.state === 100) {
      question.value = res.password_question
      pwdDialog.value = true
    } else if (res.state === 101) {
      store.commit("alert", {message: "该用户不存在", type: "warning"})
    } else {
      store.commit("alert", {message: "服务器出错", type: "error"})
    }
    changePwdLoading.value = false
  } else {
    store.commit("alert", {message: "请输入合法的帐号", type: "warning"})
  }
}
</script>

<style scoped>
.login-bg {
  width: 100vw;
  height: 100vh;
  background: url("/image/login-bg.webp");
}

.login-card {
  display: block;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 350px;
}

.login-header {
  padding: 30px;
  background-color: #d9ebf8;
  text-align: center;
  font-size: 28px;
  color: #1890ff;
  border-radius: 5px 5px 0 0;
}

.login-body {
  border-radius: 0 0 5px 5px;
  padding: 20px;
  background: #ffffff;
}

.forget-register {
  display: flex;
  justify-content: space-around;
  margin-top: 12px;
  font-size: 12px;
  color: #909399;
}

.forget-register-item {
  cursor: pointer;
}

.forget-register-item:hover {
  color: #000000;
}
</style>
