<template>
  <post-list :post-ids="postIds" :description="description">
    <template v-if="store.state.ownId===Number(route.params.id)" #default="{post}">
      <post-handle :post="post"></post-handle>
    </template>
  </post-list>
</template>

<script setup>
import {ref} from "vue"
import PostList from "@/components/PostList.vue"
import {getAllPostIdsByUid} from "@/api/post.js"
import {POST_PER_PAGE} from "@/config/constVal.js"
import {useRoute} from "vue-router"
import {chunk} from "@/utils/array.js"
import PostHandle from "@/components/Profile/PostHandle.vue"
import store from "@/store"

const route = useRoute()
const postIds = ref([])
const description = ref("啊 哦，什么都没有呢")
const getPostIds = async () => {
  let res = await getAllPostIdsByUid(route.params.id)
  if (res.state === 100) {
    if (res.post_ids) {
      postIds.value = chunk(res.post_ids, POST_PER_PAGE)
    } else {
      postIds.value = []
    }
  } else if (res.state === 103) {
    description.value = "暂无权限访问"
    postIds.value = []
  } else {
    store.commit("alert", {message: "未处理的响应", type: "type"})
  }
}
getPostIds()
</script>

<style scoped>

</style>