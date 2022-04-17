interface State {
  alert:any
  postImage: string
  commentImage: string
}

interface Alert {
  message: string
  type: "success" | "warning" | "info" | "error"
}
