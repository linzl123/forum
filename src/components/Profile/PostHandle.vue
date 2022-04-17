<template>
  <el-button :disabled="!post.exist" type="danger" plain @click="deletePost(post)">{{ handle }}</el-button>
</template>

<script setup>
import {isReactive, isRef, ref, toRefs} from "vue"
import {useRoute} from "vue-router"
import {debounce} from "@/utils/debounce.js"
import store from "@/store"
import {deletePostByPid} from "@/api/post.js"

const props = defineProps({
  post: {
    type: Object,
    required: true,
  },
})

const emits = defineEmits(["delPost"])
const route = useRoute()
const handle = ref("删除")
if (!props.post.exist) {
  handle.value = "已删除"
}
const deletePost = async (post) => {
  let message, type
  let res = await deletePostByPid(post.post_id)
  if (res.state === 100) {
    message = "删除成功"
    type = "success"
    handle.value = "已删除"
    post.exist = false
  } else {
    message = res.state_message
    type = "error"
  }
  store.commit("alert", {message, type})
}

</script>

<style scoped>

</style>