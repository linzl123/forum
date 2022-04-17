<template>
  <el-card class="box-card">
    <el-form ref="formRef" :model="loginForm" :rules="rules">
      <el-form-item label="帐号" prop="username">
        <el-input v-model="loginForm.username" type="text" autocomplete="on" ref="accountInput"></el-input>
      </el-form-item>
      <el-form-item label="昵称" prop="nickname">
        <el-input v-model="loginForm.nickname" type="text" autocomplete="on"></el-input>
      </el-form-item>
      <el-form-item label="密码" prop="password">
        <el-input v-model="loginForm.password" type="password" show-password autocomplete="off"></el-input>
      </el-form-item>
      <div class="btn-card">
        <el-button type="primary" :loading="loading" @click="signup">
          注册
        </el-button>
        <el-button type="primary" @click="router.push('/login')">返回</el-button>
      </div>
    </el-form>
  </el-card>
</template>

<script setup>
import {onMounted, reactive, ref} from "vue"
import {useRoute, useRouter} from "vue-router"
import {register} from "@/api/user"
import store from "@/store"
import {debounce} from "@/utils/debounce.js"
import {validateNickname, validatePassword, validateUsername} from "@/utils/validate"

const loginForm = reactive({
  username: "",
  password: "",
  nickname: "",
})
const accountInput = ref() //帐号框
const router = useRouter()
const route = useRoute()

const formRef = ref()
const rules = reactive({
  username: [{validator: validateUsername, trigger: "change"}],
  password: [{validator: validatePassword, trigger: "change"}],
  nickname: [{validator: validateNickname, trigger: "change"}],
})

onMounted(() => {
  accountInput.value.focus()
})

const loading = ref(false)
const signup = () => {
  loading.value = true
  formRef.value.validate(async (success) => {
    if (success) {
      let res = await register(loginForm.username, loginForm.password, loginForm.nickname)
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