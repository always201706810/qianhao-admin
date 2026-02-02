// src/utils/request.ts
import axios from 'axios'
import { ElMessage } from 'element-plus'

const service = axios.create({
  baseURL: '/api/v1', // 配合 vite 代理使用
  timeout: 5000
})

// 请求拦截器：每次请求都带上 Token
service.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

service.interceptors.response.use(
  (response) => {
    const res = response.data

    // 假设后端成功的标准是没有 code 字段（go-zero 默认）
    // 或者 code === 0 / 200 (httpx 包装后)
    
    // 判断逻辑：如果存在 code 且不等于 200，说明是业务错误
    if (res.code !== undefined && res.code !== 200 && res.code !== 0) {
      // 1. 弹出错误提示
      ElMessage.error(res.msg || '系统错误')
      
      // 2. 抛出 Promise 异常，中断后续操作
      return Promise.reject(new Error(res.msg || 'Error'))
    }

    // 验证码接口直接返回数据结构，可能没有 code，直接通过
    // 或者登录成功返回 { token: "..." } 也没有 code，直接通过
    return res
  },
  (error) => {
    // 这里处理 HTTP 状态码错误 (如 404, 502)
    ElMessage.error(error.message || '网络异常')
    return Promise.reject(error)
  }
)

export default service