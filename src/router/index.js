import {createRouter, createWebHistory} from "vue-router"
import store from "@/store"
import {getUserByUid, getUserState} from "@/api/user.js"

const routes = [
  {
    path: "/",
    component: () => import("@/views/Navigation.vue"),
    children: [
      {
        path: "",
        component: () => import("@/views/Home.vue"),
      },
      {
        path: "",
        component: () => import("@/views/ZonePost.vue"),
      },
      {
        path: "/zone/:idx",
        component: () => import("@/views/ZonePost.vue"),
      },
      {
        path: "/post/:id",
        component: () => import("@/views/PostDetail.vue"),
      },
      {
        path: "/message",
        component: () => import("@/views/Message.vue"),
        redirect: "/message/comment",
        children: [
          {
            path: "comment",
            component: () => import("@/components/Message/Comment.vue"),
          },
          {
            path: "reply",
            component: () => import("@/components/Message/Reply.vue"),
          },
          {
            path: "at",
            component: () => import("@/components/Message/At.vue"),
          },
          {
            path: "letter",
            component: () => import("@/components/Message/Letter.vue"),
          },
        ],
      },
      {
        path: "/profile/:id",
        component: () => import("@/views/Profile.vue"),
        redirect: {name: "Post"},
        children: [
          {
            path: "post",
            name: "Post",
            component: () => import("@/components/Profile/Post.vue"),
          },
          {
            path: "comment",
            name: "Comment",
            component: () => import("@/components/Profile/Comment.vue"),
          },
          {
            path: "reply",
            name: "Reply",
            component: () => import("@/components/Profile/Reply.vue"),
          },
          {
            path: "favorite",
            name: "Favorite",
            component: () => import("@/components/Profile/Favorite.vue"),
          },
          {
            path: "subscribe",
            name: "Subscribe",
            component: () => import("@/components/Profile/Subscribe.vue"),
          },
          {
            path: "setting",
            name: "Setting",
            component: () => import("@/components/Profile/Setting.vue"),
          },

        ],
      },
    ],
  },
  {
    path: "/login",
    component: () => import("@/views/Login.vue"),
  },
  {
    path: "/register",
    component: () => import("@/views/Register.vue"),
  },
  {
    path: "/404",
    component: () => import("@/views/404.vue"),
  },
  {
    path: "/:pathMatch(.*)*",
    redirect: "/404",
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach(async (to, from, next) => {
  if (to.matched[0].path === "/login" || to.matched[0].path === "/register" || to.matched[0].path === "/404") {
    next()
  } else if (store.state.ownId === 0) {
    let res = await getUserState()
    if (res.state === 100) {
      await getUserByUid(res.my_user_id)
      store.commit("setOwnId", res.my_user_id)
      store.commit("setOwnName", res.my_u_name)
      store.commit("setOwnSilence", res.disable_send_msg_time)
      store.commit("addMessage", [1, res.unread_comment_number])
      store.commit("addMessage", [2, res.unread_reply_number])
      store.commit("addMessage", [3, res.unread_chat_number])
      store.commit("addMessage", [4, res.unread_at_number])
      next()
    } else {
      next(`/login?to=${to.fullPath}`)
    }
  } else {
    next()
  }
})

export default router
