import axios from "axios"
import store from "@/store"
import router from "@/router"
import {aw} from "../../dist/assets/index.bc12b408.js"
import {clearUserState} from "@/api/user.js"

const request = axios.create({
  // baseURL: "http://101.33.218.141:15656",
  baseURL: import.meta.env.VITE_BASE_URL,
  headers: {
    "content-type": "application/json; charset=utf-8",
  },
  timeout: 10000,
  withCredentials: true, // 跨域请求是否提供凭据信息（cookie、HTTP认证及客户端SSL证明等）
})

request.interceptors.request.use((config) => {
    return config
  }, (err) => {
    console.warn(err)
  },
)

request.interceptors.response.use((res) => {
    return res.data
  }, async (err) => {
    if (err.response == null) {
      store.commit("alert", {message: "请求超时", type: "error"})
      // location.reload()
    } else {
      if (err.response.status === 401) {
        return err.response.data
      } else if (err.response.status === 400) {
        store.commit("alert", {message: "请求参数错误", type: "error"})
      } else if (err.response.status === 403) {
        store.commit('clearOwnInfo')
        store.commit('clearMessage')
        store.commit("alert", {message: "帐号或IP被封禁，请联系管理员", type: "error"})
        await router.push("/login")
        return err.response.data
      } else if (err.response.status === 404) {
        store.commit("alert", {message: "404 (Not Found)", type: "error"})
      } else {
        console.log(err.response)
      }
    }
  },
)

export default request
