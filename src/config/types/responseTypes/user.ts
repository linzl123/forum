declare namespace API {
  interface Login extends Common {
    u_nickname: string
    u_id: number
  }

  interface Register extends Common {}

  interface GetUserById extends Common {
    u_nickname: string
    img_id: string
  }
}
