<template>
  <div class="register-bg">
    <div class="register-card">
      <div class="register-header">用户注册</div>
      <div class="register-body">
        <el-form ref="formRef" :model="registerForm" :rules="rules" label-width="6em">
          <el-form-item label="帐号" prop="username">
            <el-input v-model="registerForm.username" type="text" autocomplete="on" ref="accountInput"></el-input>
          </el-form-item>
          <el-form-item label="昵称" prop="nickname">
            <el-input v-model="registerForm.nickname" type="text" autocomplete="on"></el-input>
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input v-model="registerForm.password" type="password" show-password autocomplete="off"></el-input>
          </el-form-item>
          <el-form-item label="密保问题" prop="question">
            <el-input v-model="registerForm.question" type="text"></el-input>
          </el-form-item>
          <el-form-item label="密保答案" prop="answer">
            <el-input v-model="registerForm.answer" type="text"></el-input>
          </el-form-item>
          <div class="btn-card">
            <el-button type="primary" :loading="loading" @click="signup">
              注册
            </el-button>
            <el-button type="primary" @click="router.push('/login')">返回</el-button>
          </div>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup>
import {onMounted, reactive, ref} from "vue"
import {useRoute, useRouter} from "vue-router"
import {register} from "@/api/user"
import store from "@/store"
import {validateNickname, validatePassword, validateUsername} from "@/utils/validate"

const registerForm = reactive({
  username: "",
  password: "",
  nickname: "",
  question: "",
  answer: "",
})
const accountInput = ref() //帐号框
const router = useRouter()
const route = useRoute()

const formRef = ref()
const rules = reactive({
  username: [{required: true, validator: validateUsername}],
  password: [{required: true, validator: validatePassword}],
  nickname: [{required: true, validator: validateNickname}],
  question: [{required: true, message: "请输入密保问题"}],
  answer: [{required: true, message: "请输入密保答案"}],
})

onMounted(() => {
  accountInput.value.focus()
})

const loading = ref(false)
const signup = () => {
  loading.value = true
  formRef.value.validate(async (success) => {
    if (success) {
      let res = await register(registerForm.username, registerForm.password, registerForm.nickname, registerForm.question, registerForm.answer)
      if (res.state === 100) {
        store.commit("alert", {message: "注册成功", type: "success"})
        router.push("/login")
      } else {
        store.commit("alert", {message: res.state_message, type: "error"})
      }
    }
  })
  loading.value = false
}
</script>

<style scoped>
.register-bg {
  width: 100vw;
  height: 100vh;
  background: url("/image/login-bg.jpg");
}

.register-card {
  display: block;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 400px;
}

.register-header {
  padding: 30px;
  background-color: #d9ebf8;
  text-align: center;
  font-size: 28px;
  color: #1890ff;
  border-radius: 5px 5px 0 0;
}

.register-body {
  border-radius: 0 0 5px 5px;
  padding: 20px;
  background: #ffffff;
}

.btn-card {
  display: flex;
  justify-content: space-evenly;
  margin-top: 1.2rem;
}
</style>