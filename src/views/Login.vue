<template>
  <el-card class="box-card">
    <el-form ref="formRef" :model="loginForm" :rules="rules">
      <el-form-item label="帐号" prop="username">
        <el-input v-model="loginForm.username" type="text" autocomplete="on" ref="accountInput"></el-input>
      </el-form-item>
      <el-form-item label="密码" prop="password">
        <el-input v-model="loginForm.password" type="password" show-password autocomplete="off"></el-input>
      </el-form-item>
      <div class="btn-card">
        <el-button type="primary" :loading="loading" @click="signin">
          登录
        </el-button>
        <el-button type="primary" @click="router.push('/register')">
          注册
        </el-button>
      </div>
    </el-form>
  </el-card>
</template>

<script setup>
import {onMounted, reactive, ref} from "vue"
import {useRoute, useRouter} from "vue-router"
import {login, register} from "@/api/user"
import store from "@/store"
import {debounce} from "@/utils/debounce.js"
import {validateNickname, validatePassword, validateUsername} from "@/utils/validate"

const loginForm = reactive({
  username: "123",
  password: "123",
})
const accountInput = ref() //帐号框
const router = useRouter()
const route = useRoute()

const formRef = ref()
const rules = reactive({
  username: [{validator: validateUsername, trigger: "change"}],
  password: [{validator: validatePassword, trigger: "change"}],
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
        if (route.query.to) router.push(route.query.to)
        else router.push("/")
      } else {
        store.commit("alert", {message: res.state_message, type: "error"})
      }
    }
  })
  loading.value = false
}
</script>

<style scoped>
.box-card {
  width: 300px;
  margin: 11rem auto;
}

.btn-card {
  display: flex;
  justify-content: space-evenly;
  margin-top: 1.2rem;
}
</style>
