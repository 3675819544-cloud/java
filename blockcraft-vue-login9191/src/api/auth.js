import { http } from '@/api/request'

/**
 * 认证相关接口
 *
 * 与后端 com.fenglin.springboottest.controller.AuthController 一一对应。
 */

export const authApi = {
  /**
   * 获取图片验证码
   * @returns {Promise<{ captchaId: string, image: string, expireSeconds: number }>}
   */
  captcha() {
    return http.get('/auth/captcha')
  },

  /**
   * 用户名是否可用
   * @returns {Promise<{ available: boolean }>}
   */
  checkUsername(username) {
    return http.get('/auth/check-username', { username })
  },

  /**
   * 注册
   * @param {{ username: string, password: string, confirmPassword?: string,
   *           captchaId: string, captchaCode: string }} payload
   */
  register(payload) {
    return http.post('/auth/register', payload)
  },

  /**
   * 登录
   * @param {{ username: string, password: string }} payload
   * @returns {Promise<{ token: string, tokenType: string, expiresIn: number, user: object }>}
   */
  login(payload) {
    return http.post('/auth/login', payload)
  },

  /** 退出登录 */
  logout() {
    return http.post('/auth/logout')
  },

  /** 连通性探测 */
  ping() {
    return http.get('/auth/ping')
  },
}

/** 需要登录态才能访问的接口 */
export const userApi = {
  /** 当前登录用户资料（后端会从 token 里解析用户） */
  info() {
    return http.get('/user/info')
  },
}
