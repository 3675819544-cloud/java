/**
 * 表单校验规则
 *
 * 每个校验器都是「工厂函数 → 校验函数」的形式：
 *   const rule = minLength(6, '密码至少 6 位')
 *   rule('abc')  // => '密码至少 6 位'
 *   rule('abcdef') // => ''  空字符串代表通过
 *
 * 这样规则可以像数据一样配置，而不是写死成 if/else。
 */

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

/** 必填 */
export function required(message) {
  return (value) => (String(value ?? '').trim() ? '' : message)
}

/** 最小长度 */
export function minLength(length, message) {
  return (value) => (String(value ?? '').length >= length ? '' : message)
}

/**
 * 账号：为空报错；含 @ 时按邮箱严格校验，否则视为游戏用户名
 */
export function account(message = '请输入账号') {
  return (value) => {
    const trimmed = String(value ?? '').trim()
    if (!trimmed) return message
    if (trimmed.includes('@') && !EMAIL_RE.test(trimmed)) return '邮箱格式不正确'
    return ''
  }
}

/**
 * 依次执行规则，返回第一条错误信息；全部通过返回空字符串
 */
export function runRules(value, rules = []) {
  for (const rule of rules) {
    const message = rule(value)
    if (message) return message
  }
  return ''
}
