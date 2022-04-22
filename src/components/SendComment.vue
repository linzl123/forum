<template>
  <el-dialog v-model="dialog" width="1000px" title="发送评论" @close="emits('close')">
    <send-editor mode="comment" :pid="pid" @sendSuccess="sendSuccess"></send-editor>
  </el-dialog>
</template>

<script setup>
import {ref} from "vue"
import SendEditor from "@/components/SendEditor.vue"

const props = defineProps({
  pid: {
    type: Number,
    required: true,
  },
})
const emits = defineEmits(["close"])
const dialog = ref(true)
const sendSuccess = () => {
  emits("close")
}
</script>

<style scoped>
</style>