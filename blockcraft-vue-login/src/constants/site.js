/**
 * 站点文案与配置
 * 原来硬编码在 HTML / JS 里的字符串统一收敛到这里，
 * 改文案不用翻组件。
 */

export const SITE = {
  brand: 'BlockCraft',
  splash: '欢迎回来，冒险家!',
  subtitle: '输入账号密码，重新进入你的世界',
  panelTitle: '登 录 / LOGIN',

  hudLeft: 'BlockCraft 1.21.4 (Java Edition)',
  hudRight: '非官方粉丝作品 · 与 Mojang 无关',

  footerTip: '还没有账号？',
  footerAction: '注册新角色',

  dividerText: '或',
  forgotPassword: '忘记密码？',
  rememberLabel: '记住我',

  submitLabel: '开始游戏',

  /** 登录成功提示 */
  successMessage: '登录成功！正在生成你的世界…',

  /** localStorage 中「记住我」的键名 */
  rememberKey: 'blockcraft.rememberedUser',

  /** 模拟「加载世界中」进度条的时长（毫秒） */
  loginDuration: 1400,
}

/** 第三方快捷登录渠道 */
export const PROVIDERS = ['微软账号', '微信', 'GitHub']

/** 进度条文案模板 */
export const PROGRESS_TEXT = {
  loading: (percent) => `加载世界中… ${percent}%`,
  done: '正在进入服务器…',
}
