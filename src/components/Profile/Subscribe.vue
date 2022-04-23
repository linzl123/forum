<template>
  <div>
    <div v-for="(users,idx) in usersList" :key="'u'+idx" class="users-item">
      <el-row v-for="user in users" :key="user.uid">
        <el-col :span="20">
          <el-row class="test">
            <el-avatar class="avatar" :src="user.avatar" @click="router.push('/profile/'+user.uid)"/>
            <div class="user-nickname" @click="router.push('/profile/'+user.uid)">{{ user.nickname }}</div>
          </el-row>
        </el-col>
        <el-col :span='4' v-if="store.state.ownId===Number(route.params.id)">
          <subscribe-handle :uid="user.uid"></subscribe-handle>
        </el-col>
        <el-divider></el-divider>
      </el-row>
    </div>
    <div v-if="noData" class="no-data">{{ description }}</div>
    <div v-loading="isLoading" style="margin-top: 18px"></div>
  </div>
</template>

<script setup>
import {nextTick, ref} from "vue"
import {getSubscribeByUid} from "@/api/subscribe.js"
import {useRoute, useRouter} from "vue-router"
import {getUserByUid} from "@/api/user.js"
import store from "@/store"
import SubscribeHandle from "@/components/SubscribeHandle.vue"
import {chunk} from "@/utils/array.js"
import {POST_PER_PAGE} from "@/config/constVal.js"

const route = useRoute()
const router = useRouter()
const description = ref("暂无更多关注")
//
let userIds = []
const getUserIds = async () => {
  let res = await getSubscribeByUid(route.params.id)
  if (res.state === 100) {
    if (res.user_ids) {
      userIds = chunk(res.user_ids, POST_PER_PAGE)
    }
  } else if (res.state === 103) {
    description.value = "暂无权限访问"
  } else {
    store.commit("alert", {message: "未经处理的响应", type: "type"})
  }
}
const usersList = ref([])
let activePage = -1, activePageIds = null
const isLoading = ref(true)
const noData = ref(false)
const getUsers = async () => {
  isLoading.value = true
  activePageIds = userIds[++activePage]
  if (activePageIds == null) {
    isLoading.value = false
    noData.value = true
    return
  }
  let reqUsers = Array(activePageIds.length)
  activePageIds.forEach((v, i) => {
    reqUsers[i] = getUserByUid(v)
  })
  let resUsers = await Promise.all(reqUsers)
  resUsers.forEach((v, i) => {
    v.uid = activePageIds[i]
  })
  usersList.value.push(resUsers)
  isLoading.value = false
  if (activePageIds.length === POST_PER_PAGE) {
    nextTick(() => {
      getPostsObserver.observe(elementList[elementList.length - 1])
    })
  } else {
    noData.value = true
  }
}
getUserIds().then(() => {
  getUsers()
})
// 监听最后第X个元素
const getPostsObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        observer.unobserve(entry.target)
        getUsers()
      }
    })
  },
  {
    threshold: 0,
  },
)
let elementList = null
nextTick(() => {
  elementList = document.getElementsByClassName("users-item")
})
</script>

<style scoped>
.avatar {
  margin-right: 1em;
  cursor: pointer;
}

.test {
  align-items: center;
}
</style>