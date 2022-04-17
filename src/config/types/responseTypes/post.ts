declare namespace API {
  interface GetAllPostIdsByzone extends Common {
    postids: number[]
  }

  interface GetAllPostIdsByUid extends Common {
    postids: Array<number>
  }

  interface GetPostById extends Common {
    u_id: number
    post_name: string
    post_txt: string
    post_time: Date
    post_txt_html: string
    img_id: string
  }

  interface DeletePostById extends Common {

  }
  interface GetHotPosts extends Common{
    hot_desc:HotPostDesc[]
  }
}

interface HotPostDesc{
  post_id:number
  post_hot:number
}