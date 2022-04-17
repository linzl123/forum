<template>
  <div class="send-item">
    <send-editor mode="post" :zone="zoneSelect" v-model:title="title"
                 @sendSuccess="sendSuccess" ref="contentInputRef">
      <div class="send-item">
        <el-input class="sendTitle" v-model="title" placeholder="标题" maxlength="50" show-word-limit
                  @keyup.enter.exact="contentInputRef.inputRef.focus()" ref="titleInputRef"/>
        <el-select class="sendSelect" v-model="zoneSelect">
          <el-option v-for="(item,idx) in zoneList" :key="idx" :label="item" :value="idx+1"></el-option>
        </el-select>
      </div>
    </send-editor>
  </div>
</template>

<script setup>
import {ref} from "vue"
import SendEditor from "@/components/SendEditor.vue"

const props = defineProps({
    zone: {
      type: Number,
      required: true,
    },
  },
)

const emits = defineEmits(["sendSuccess"])
const title = ref("")
const zoneList = [
  "闲聊",
  "学习",
  "交易",
]
const zoneSelect = ref(props.zone)
const sendSuccess = () => {
  title.value = ""
  emits("sendSuccess")
}

const titleInputRef = ref()
const contentInputRef = ref()
defineExpose({titleInputRef, contentInputRef})
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