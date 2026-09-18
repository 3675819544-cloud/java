/**
 * localStorage 安全封装
 * 隐私模式 / 禁用存储时 localStorage 会直接抛异常，
 * 原先散落在 script.js 里的 try...catch 统一收在这里。
 */

export function readStored(key) {
  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}

export function writeStored(key, value) {
  try {
    window.localStorage.setItem(key, value)
    return true
  } catch {
    return false
  }
}

export function removeStored(key) {
  try {
    window.localStorage.removeItem(key)
    return true
  } catch {
    return false
  }
}
