<template>
  <el-button type="primary" plain @click="handleSubscribe">{{ ownText }}</el-button>
</template>

<script setup>
import {ref} from "vue"
import {debounce} from "@/utils/debounce.js"
import {addSubscribeByUid, isOwnSubscribe, removeSubscribeByUid} from "@/api/subscribe.js"
import store from "@/store"

const props = defineProps({
  uid: {
    type: Number,
    required: true,
  },
})
const own = ref(false)
const ownText = ref("关注")
isOwnSubscribe(props.uid).then((ret) => {
  own.value = ret
  ret ? ownText.value = "取消关注" : ownText.value = "关注"
})
const handleSubscribe = debounce(async () => {
  let message, type
  if (!own.value) {
    let res = await addSubscribeByUid(props.uid)
    if (res.state === 100) {
      message = "关注成功"
      type = "success"
      ownText.value = "取消关注"
    } else {
      message = res.state_message
      type = "error"
    }
  } else {
    let res = await removeSubscribeByUid(props.uid)
    if (res.state === 100) {
      message = "取消关注成功"
      type = "success"
      ownText.value = "关注"
    } else {
      message = res.state_message
      type = "error"
    }
  }
  store.commit("alert", {message, type})
  own.value = !own.value
})
</script>

<style scoped>

</style>