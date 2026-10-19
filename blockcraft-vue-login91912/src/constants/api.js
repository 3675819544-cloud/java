/**
 * 后端接口相关常量
 *
 * RESULT_CODE 必须与后端 com.fenglin.springboottest.common.ResultCode 保持一致，
 * 否则前端无法把错误精确地落到对应输入框上。
 */

/** 接口前缀：开发环境走 Vite 代理（见 vite.config.js） */
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

/** 请求超时（毫秒） */
export const API_TIMEOUT = 15000

/** 与后端 ResultCode 枚举一一对应 */
export const RESULT_CODE = {
  SUCCESS: 200,
  PARAM_ERROR: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  ERROR: 500,

  USERNAME_EXISTS: 1001,
  USER_NOT_FOUND: 1002,
  PASSWORD_ERROR: 1003,
  USER_DISABLED: 1004,
  CAPTCHA_ERROR: 1005,
  CAPTCHA_EXPIRED: 1006,
  PASSWORD_NOT_MATCH: 1007,
}

/** 后端未启动 / 网络不通时的提示 */
export const NETWORK_ERROR_MESSAGE =
  '无法连接后端服务，请确认后端已在 http://localhost:8081 启动'
