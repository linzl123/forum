<template>
  <div class="img">
    <input type="file" accept="image/jpeg,image/png" id="img" @input="upload" style="width: 0" ref="inputRef"/>
    <label for="img" class="send-img">
      添加图片
    </label>
    &ensp;<span class="img-name">{{ imgName }}</span>
    <img :src="imgSrc" class="send-img-hover"/>
    <span v-show="imgName!==''" class="delete-speak" @click="removeImg">✖</span>
  </div>
</template>

<script setup>
import {onUnmounted, ref, toRefs, watch} from "vue"
import store from "@/store"


const props = defineProps({
  remove: {
    type: Boolean,
    required: true,
  },
})
const emits = defineEmits(["uploadImg", "removeImg"])
const {remove} = toRefs(props)
const imgSrc = ref("")
const inputRef = ref()
const imgName = ref("")

const removeImg = () => {
  imgSrc.value = ""
  imgName.value = ""
  inputRef.value.value = ""
  emits("removeImg")
}
watch(remove, () => {
  removeImg()
})
const beforeUpload = (file) => {
  const limitType = file.type === "image/jpeg" || file.type === "image/png"
  const limitSize = file.size / 1024 / 1024 < 10
  if (!limitType) {
    store.commit("alert", {message: "文件格式必须为 JPG 或 PNG", type: "error"})
  } else if (!limitSize) {
    store.commit("alert", {message: "文件大小必须小于 10MB", type: "error"})
  }
  return limitType && limitSize
}
const upload = (e) => {
  const file = e.target.files[0]
  if (!file || !beforeUpload(file)) return
  imgName.value = file.name
  URL.revokeObjectURL(imgSrc.value)
  imgSrc.value = URL.createObjectURL(file)
  emits("uploadImg", file)
}
onUnmounted(() => {
  URL.revokeObjectURL(imgSrc.value)
})
</script>

<style scoped>
.send-img {
  padding: 5px 8px;
  background-color: #409eff;
  border: none;
  border-radius: 5px;
  color: white;
  cursor: pointer;
}

.send-img:hover {
  background-color: #79bbff;
}

.img-name {
  display: inline-block;
  color: blue;
  cursor: default;
}

.img-name:hover + .send-img-hover {
  display: block;
  color: red;
}

.send-img-hover {
  z-index: 3;
  width: 1000px;
  height: 600px;
  object-fit: scale-down;
  position: fixed;
  top: calc(50% - 300px);
  left: calc(50% - 500px);
  display: none;
}
</style>