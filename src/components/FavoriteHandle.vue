<template>
  <el-button type="warning" :plain="handle==='收藏'" @click="handleFavorite(pid)">{{ handle }}</el-button>
</template>

<script setup>
import {ref} from "vue"
import {useRoute, useRouter} from "vue-router"
import {debounce} from "@/utils/debounce.js"
import {addFavoriteByPid, isOwnFavorite, removeFavoriteByPid} from "@/api/favorite.js"
import store from "@/store"

const props = defineProps({
  pid: {
    type: Number,
    required: true,
  },
})
const route = useRoute()
const router = useRouter()
const own = ref()
const handle = ref("收藏")
if (route.name === "Favorite") {
  handle.value = "取消收藏"
  own.value = true
} else {
  isOwnFavorite(props.pid).then((ret) => {
    own.value = ret
    ret ? handle.value = "取消收藏" : handle.value = "收藏"
  })
}
const handleFavorite = debounce(async (pid) => {
  if (own.value) {
    let res = await removeFavoriteByPid(pid)
    if (res.state === 100) {
      handle.value = "收藏"
      store.commit("alert", {message: "取消收藏成功", type: "success"})
    } else {
      store.commit("alert", {message: res.state_message, type: "error"})
    }
  } else {
    let res = await addFavoriteByPid(pid)
    if (res.state === 100) {
      handle.value = "取消收藏"
      store.commit("alert", {message: "收藏成功", type: "success"})
    } else {
      store.commit("alert", {message: res.state_message, type: "error"})
    }
  }
  own.value = !own.value
})
</script>

<style scoped>

</style>