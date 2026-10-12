import { API_BASE_URL, API_TIMEOUT, NETWORK_ERROR_MESSAGE, RESULT_CODE } from '@/constants/api'
import { getToken } from '@/utils/auth'

/**
 * 统一的 fetch 封装
 *
 * 后端所有接口都返回同一个结构：
 *   { code: 200, message: '操作成功', data: {...}, timestamp: 1760000000000 }
 *
 * 所以这里的职责很明确：
 *   1. 拼 URL、带 token、序列化 body；
 *   2. 超时中断（AbortController）；
 *   3. code === 200 直接 resolve 出 data，业务错误统一 reject 成 ApiError；
 *   4. 网络不通（后端没启动）时给出人话提示。
 *
 * 组件里只需要 try/catch，拿到 error.code / error.message 就能做精确的错误提示。
 */

/** 业务错误对象：带 code，方便调用方按错误码分流 */
export class ApiError extends Error {
  constructor(message, code, payload) {
    super(message)
    this.name = 'ApiError'
    this.code = code
    this.payload = payload
  }
}

/** 401 时的全局回调（比如自动跳登录页），由 main.js 注册 */
let unauthorizedHandler = null

export function setUnauthorizedHandler(handler) {
  unauthorizedHandler = handler
}

function buildUrl(path, params) {
  const base = API_BASE_URL.replace(/\/$/, '')
  const url = `${base}${path.startsWith('/') ? path : `/${path}`}`
  if (!params) return url

  const search = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      search.append(key, value)
    }
  })
  const query = search.toString()
  return query ? `${url}?${query}` : url
}

/**
 * 发起请求
 * @param {string} path 以 / 开头的接口路径，例如 '/auth/login'
 * @param {{ method?: string, body?: object, params?: object, headers?: object, timeout?: number }} [options]
 * @returns {Promise<any>} 直接返回后端 Result.data
 */
export async function request(path, options = {}) {
  const {
    method = 'GET',
    body,
    params,
    headers = {},
    timeout = API_TIMEOUT,
  } = options

  const controller = new AbortController()
  const timer = window.setTimeout(() => controller.abort(), timeout)

  const token = getToken()

  let response
  try {
    response = await fetch(buildUrl(path, params), {
      method,
      headers: {
        Accept: 'application/json',
        ...(body === undefined ? {} : { 'Content-Type': 'application/json;charset=utf-8' }),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: controller.signal,
    })
  } catch (error) {
    // 后端没启动 / 断网 / 超时都会走到这里
    const message = error?.name === 'AbortError' ? '请求超时，请稍后重试' : NETWORK_ERROR_MESSAGE
    throw new ApiError(message, RESULT_CODE.ERROR, error)
  } finally {
    window.clearTimeout(timer)
  }

  // 后端异常时（比如 500 页面）可能返回非 JSON，这里兜一下
  let payload
  try {
    payload = await response.json()
  } catch {
    throw new ApiError(`服务器返回了非预期的内容（HTTP ${response.status}）`, RESULT_CODE.ERROR)
  }

  if (payload.code === RESULT_CODE.SUCCESS) {
    return payload.data
  }

  if (payload.code === RESULT_CODE.UNAUTHORIZED) {
    unauthorizedHandler?.()
  }

  throw new ApiError(payload.message || '请求失败', payload.code, payload)
}

export const http = {
  get: (path, params, options) => request(path, { ...options, method: 'GET', params }),
  post: (path, body, options) => request(path, { ...options, method: 'POST', body }),
  put: (path, body, options) => request(path, { ...options, method: 'PUT', body }),
  delete: (path, params, options) => request(path, { ...options, method: 'DELETE', params }),
}
