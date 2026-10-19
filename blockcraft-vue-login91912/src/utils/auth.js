import { readStored, removeStored, writeStored } from '@/utils/storage'

/**
 * 登录态存储
 *
 * token 与用户信息分开存：
 *  - token 放 sessionStorage：关掉标签页就失效，安全性稍好
 *  - 用户信息放 localStorage：刷新页面能马上渲染出昵称/头像
 *
 * 所有读写都走 utils/storage 的安全封装，隐私模式下不会抛异常。
 */

const TOKEN_KEY = 'blockcraft.token'
const USER_KEY = 'blockcraft.user'

/** 读取 token */
export function getToken() {
  try {
    return window.sessionStorage.getItem(TOKEN_KEY)
  } catch {
    return readStored(TOKEN_KEY)
  }
}

/** 读取当前登录用户 */
export function getUser() {
  const raw = readStored(USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

/** 保存登录态 */
export function saveSession({ token, user }) {
  try {
    window.sessionStorage.setItem(TOKEN_KEY, token)
  } catch {
    writeStored(TOKEN_KEY, token)
  }
  writeStored(USER_KEY, JSON.stringify(user ?? null))
}

/** 清除登录态 */
export function clearSession() {
  try {
    window.sessionStorage.removeItem(TOKEN_KEY)
  } catch {
    removeStored(TOKEN_KEY)
  }
  removeStored(USER_KEY)
}

/** 是否已登录（仅判断本地是否有 token，真正有效性由后端校验） */
export function isLoggedIn() {
  return Boolean(getToken())
}
