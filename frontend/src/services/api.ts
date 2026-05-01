import axios from 'axios'

// 實體手機用區網 IP（e.g. http://192.168.x.x:8000）
// iOS Simulator 可用 http://localhost:8000
export const API_BASE_URL = 'http://localhost:8000'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
})

export default api
