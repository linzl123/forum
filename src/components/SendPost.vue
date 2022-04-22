<template>
  <el-dialog v-model="dialog" width="1000px" title="发送帖子" @close="emits('close')">
    <send-editor mode="post" :zone="zoneSelect" v-model:title="title"
                 @sendSuccess="sendSuccess">
      <div class="send-item">
        <el-input class="sendTitle" v-model="title" placeholder="标题" maxlength="50" show-word-limit/>
        <el-select class="sendSelect" v-model="zoneSelect">
          <el-option v-for="(item,idx) in zoneList" :key="'z'+idx" :label="item" :value="idx+1"></el-option>
        </el-select>
      </div>
    </send-editor>
  </el-dialog>
</template>

<script setup>
import {ref} from "vue"
import SendEditor from "@/components/SendEditor.vue"

const props = defineProps({
  zone: {
    type: Number,
    required: true,
  },
})
const emits = defineEmits(["close"])
const dialog = ref(true)
const title = ref("")
const zoneList = [
  "闲聊",
  "学习",
  "交易",
]
const zoneSelect = ref(props.zone)
const sendSuccess = () => {
  title.value = ""
  emits("close")
}
</script>

<style scoped>
.sendTitle {
  width: 90%;
  margin-right: 1rem;
}

.sendSelect {
  width: 8%;
}
</style>