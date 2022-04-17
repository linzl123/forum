<template>
  <div v-loading="isLoading" style="min-height: 40px"></div>
  <div v-if="!isLoading" style="margin-top: -40px">
    <template v-if="useridList!=null">
      <el-row v-for="(uid,idx) in useridList" :key="uid">
        <el-col :span="20">
          <el-row style="align-items: center">
            <el-avatar class="avatar" :src="userList[idx].avatar"/>
            <div class="user-nickname" @click="router.push('/profile/'+uid)">{{ userList[idx].nickname }}</div>
          </el-row>
        </el-col>
        <el-col :span='4' v-if="store.state.ownId===Number(route.params.id)">
          <subscribe-handle :uid="uid"></subscribe-handle>
        </el-col>
        <el-divider></el-divider>
      </el-row>
    </template>
    <div v-else>
      <el-empty :description="description"></el-empty>
    </div>
  </div>
</template>

<script setup>
import {ref} from "vue"
import {getSubscribeByUid} from "@/api/subscribe.js"
import {useRoute, useRouter} from "vue-router"
import {getUserByUid} from "@/api/user.js"
import store from "@/store"
import SubscribeHandle from "@/components/SubscribeHandle.vue"

const route = useRoute()
const router = useRouter()
const isLoading = ref(true)
const useridList = ref(null)
const userList = ref([])
const description = ref("啊 哦，什么都没有呢")
const getSubscribeUser = async () => {
  let res = await getSubscribeByUid(route.params.id)
  if (res.state === 100) {
    if (res.user_ids) {
      useridList.value = res.user_ids
      let reqUser = Array(useridList.value.length)
      useridList.value.forEach((v, i) => {
        reqUser[i] = getUserByUid(v)
      })
      userList.value = await Promise.all(reqUser)
    }
  } else if (res.state === 103) {
    description.value = "暂无权限访问"
    return Promise.reject()
  } else {
    return Promise.reject()
  }
}
getSubscribeUser().then(() => {
  isLoading.value = false
}).catch(() => {
  isLoading.value = false
})
</script>

<style scoped>
.avatar {
  margin-right: 1em;
}
</style>