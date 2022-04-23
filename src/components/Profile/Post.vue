<template>
  <post-list :post-ids="postIds" origin="ProfilePost" :description="description" :delPost="delPost">
    <template v-if="store.state.ownId===Number(route.params.id)" #default="{idx,post}">
      <el-button type="danger" plain @click="deletePost(idx,post)">删除</el-button>
    </template>
  </post-list>
</template>

<script setup>
import {ref} from "vue"
import PostList from "@/components/PostList.vue"
import {deletePostByPid, getAllPostIdsByUid} from "@/api/post.js"
import {POST_PER_PAGE} from "@/config/constVal.js"
import {useRoute} from "vue-router"
import {chunk} from "@/utils/array.js"
import store from "@/store"

const route = useRoute()
const postIds = ref([])
const description = ref("暂无更多帖子")
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
const delPost = ref()
const deletePost = async (idx, post) => {
  let res = await deletePostByPid(post.post_id)
  if (res.state === 100) {
    delPost.value = {idx, post}
    store.commit("alert", {message: "删除成功", type: "success"})
  } else {
    store.commit("alert", {message: res.state_message, type: "error"})
  }
}
</script>

<style scoped>

</style>