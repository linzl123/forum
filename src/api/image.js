import request from "@/api/request"

export function getImg(img_id) {
  if (img_id === "") return ""
  return import.meta.env.VITE_BASE_URL + `/getimg/${img_id}`
}

export function uploadImg(data){
  return request.post("/uploadimg", data, {
    headers: {"content-type": "multipart/form-data"},
  })
}
