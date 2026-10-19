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

  /** 登录页副标题（移到视图层后由 site 提供文案） */
  loginSubtitle: '输入账号密码，重新进入你的世界',
  /** 注册页副标题 */
  registerSubtitle: '创建你的角色，开启新的世界',
  /** 登录 / 注册面板标题条 */
  loginPanelTitle: '登 录 / LOGIN',
  registerPanelTitle: '注 册 / REGISTER',

  hudLeft: 'BlockCraft 1.21.4 (Java Edition)',
  hudRight: '非官方粉丝作品 · 与 Mojang 无关',

  /** 登录页底部：去注册 */
  footerTip: '还没有账号？',
  footerAction: '注册新角色',

  /** 注册页底部：回登录 */
  registerFooterTip: '已经有账号了？',
  registerFooterAction: '返回登录',

  dividerText: '或',
  forgotPassword: '忘记密码？',
  rememberLabel: '记住我',

  /** 同意协议文案 */
  agreeLabel: '我已阅读并同意《方块用户协议》',

  submitLabel: '开始游戏',
  registerSubmitLabel: '创建角色',

  /** 登录成功提示 */
  successMessage: '登录成功！正在生成你的世界…',
  /** 注册成功提示 */
  registerSuccessMessage: '角色创建成功！正在传送至登录界面…',

  /** localStorage 中「记住我」的键名 */
  rememberKey: 'blockcraft.rememberedUser',

  /** 模拟「加载世界中」进度条的时长（毫秒） */
  loginDuration: 1400,
  registerDuration: 1600,
}

/** 第三方快捷登录渠道 */
export const PROVIDERS = ['微软账号', '微信', 'GitHub']

/** 进度条文案模板 */
export const PROGRESS_TEXT = {
  loading: (percent) => `加载世界中… ${percent}%`,
  done: '正在进入服务器…',
}
