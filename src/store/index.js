import {createStore} from "vuex"
import {MESSAGE_DURATION} from "@/config/constVal"

export default createStore({
  state: {
    alert: null,
    userMap: new Map(),
    ownId: 0,
    ownName: "",
    ownSilence: "",
    ownFavorite: [],
    ownSubscribe: [],
    gotoElement: "",
    gotoLetter: "",
    message: [0, 0, 0, 0, 0],
  },
  getters: {
    allMessage: (state) => state.message.reduce((p, c) => p + c, 0),
  },
  mutations: {
    setMessage(state, payload) {
      state.message[payload[0]] += payload[1]
    },
    addMessage(state, payload) {
      state.message[payload]++
    },
    delMessage(state, payload) {
      state.message[payload] = 0
    },
    setGotoElement(state, payload) {
      state.gotoElement = payload
    },
    setGotoLetter(state, payload) {
      state.gotoLetter = payload
    },
    setAlert(state, payload) {
      state.alert = payload
    },
    alert(state, payload) {
      Object.assign(payload, {duration: MESSAGE_DURATION})
      state.alert(payload)
    },
    setUserMap(state, payload) {
      state.userMap.set(payload[0], payload[1])
    },
    setOwnId(state, uid) {
      state.ownId = uid
    },
    setOwnName(state, uname) {
      state.ownName = uname
    },
    setOwnSilence(state, silence) {
      state.ownSilence = silence
    },
    setOwnFavorite(state, payload) {
      state.ownFavorite = (payload)
    },
    addOwnFavorite(state, payload) {
      state.ownFavorite.push(payload)
    },
    rmOwnFavorite(state, payload) {
      state.ownFavorite.splice(state.ownFavorite.indexOf(payload))
    },
    setOwnSubscribe(state, payload) {
      state.ownSubscribe = (payload)
    },
    addOwnSubscribe(state, payload) {
      state.ownSubscribe.push(payload)
    },
    rmOwnSubscribe(state, payload) {
      state.ownSubscribe.splice(state.ownSubscribe.indexOf(payload))
    },
    clearOwnInfo(state) {
      state.ownId = 0
      state.ownFavorite = []
      state.ownSubscribe = []
    },
    clearMessage(state) {
      state.message = [0, 0, 0, 0, 0]
    },
  },
  actions: {},
  modules: {},
})
