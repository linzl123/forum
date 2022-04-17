<template>
  <send-editor mode="comment" :pid="pid" @sendSuccess="sendSuccess" ref="sendEditorRef"></send-editor>
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
const emits = defineEmits(["sendSuccess"])
const sendSuccess = () => {
  emits("sendSuccess")
}

const sendEditorRef = ref()
defineExpose({sendEditorRef})
</script>

<style scoped>
</style>