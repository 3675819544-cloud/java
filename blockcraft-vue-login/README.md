# BlockCraft · 登录服务器（Vue 3 重构版）

把原来的「单文件静态页」（`index.html` + `style.css` + `script.js`）重构成了一个标准的
**Vue 3 + Vite** 工程。视觉效果与原版逐像素一致，交互行为完全对齐，但代码结构从
「查 DOM → 改 class → 写 textContent」变成了「改状态 → 视图自动更新」。

---

## 快速开始

```bash
npm install              # 安装依赖
npm run dev              # 启动开发服务器（默认 http://localhost:5173，会自动打开浏览器）
npm run build            # 生产构建，产物输出到 dist/（需要服务器托管）
npm run preview          # 本地预览构建产物

npm run build:standalone # 可选：打成单个 index.html，双击即可打开（产物在 standalone/）
```

> 需要 Node.js 18 或更高版本。

### 想「双击就能看」？

原版是纯静态页，双击 `index.html` 就能看；Vue 工程的 `dist/` 依赖 ES Module，
浏览器在 `file://` 协议下会拦截模块脚本，**必须用服务器托管**。

如果确实需要脱离服务器，执行 `npm run build:standalone`，
它会把 CSS / JS 全部内联进一个 `standalone/index.html`（约 100 KB），
产物打成经典脚本，**双击即可运行**，也方便直接发给别人。

| 命令 | 产物 | 能否双击打开 |
| --- | --- | --- |
| `npm run build` | `dist/` | ❌ 需要静态服务器 |
| `npm run build:standalone` | `standalone/index.html` | ✅ 双击即可 |

---

## 目录结构

```
blockcraft-vue-login/
├─ index.html                  # Vite 入口 HTML（只保留挂载点与字体预连接）
├─ vite.config.js              # Vite 配置（含 @ → src 别名）
├─ vite.config.standalone.js   # 可选：单文件构建配置
├─ package.json
├─ public/
│  └─ favicon.svg              # 苦力怕图标
└─ src/
   ├─ main.js                  # 应用入口：挂载 #app + 引入全局样式
   ├─ App.vue                  # 页面外壳：背景 + 标题区 + 面板 + HUD + 提示条
   │
   ├─ constants/
   │  └─ site.js               # 所有文案与配置（品牌名、按钮文字、localStorage 键名…）
   │
   ├─ utils/
   │  ├─ validators.js         # 校验规则工厂：required / minLength / account
   │  └─ storage.js            # localStorage 安全封装（隐私模式不报错）
   │
   ├─ composables/
   │  ├─ useLoginForm.js       # 表单状态机：校验、提交、记住我
   │  └─ useProgress.js        # requestAnimationFrame 驱动的进度条
   │
   ├─ styles/
   │  ├─ tokens.css            # 像素风设计令牌（所有颜色/字体/投影的唯一来源）
   │  └─ base.css              # 基础重置 + 全局排版
   │
   └─ components/
      ├─ BackgroundScene.vue   # 背景场景容器
      ├─ PixelCloud.vue        # 像素云（三套造型，数据驱动渲染）
      ├─ FloatingBlock.vue     # 悬浮草方块
      ├─ CreeperLogo.vue       # 苦力怕脸 Logo
      ├─ GuiPanel.vue          # Minecraft GUI 面板（插槽式）
      ├─ PixelField.vue        # 字段容器：标签 + 控件 + 错误提示
      ├─ PixelInput.vue        # 像素输入框（凹陷槽 + 显示/隐藏密码）
      ├─ PixelCheckbox.vue     # 自定义像素复选框
      ├─ PixelButton.vue       # 像素按钮（primary / ghost，内置加载态）
      ├─ PixelProgressBar.vue  # 像素进度条
      ├─ LoginForm.vue         # 登录表单主体
      └─ PixelToast.vue        # 像素风提示条
```

---

## 从原版到 Vue 的改造对照

| 原版实现 | Vue 版实现 | 说明 |
| --- | --- | --- |
| `index.html` 里的大段结构 | `src/App.vue` + 各组件的 `<template>` | 按「职责」拆成 12 个组件 |
| `style.css` 单文件 780 行 | `tokens.css` + `base.css` + 各组件 `<style scoped>` | 样式跟着组件走，设计令牌统一收口 |
| `document.getElementById(...)` 取元素 | `ref` / `reactive` 状态 | 不再手动查询 DOM |
| `classList.add('has-error')` | `:class="{ 'has-error': invalid }"` | 状态驱动样式 |
| `errorEl.textContent = message` | `{{ errors.account }}` | 声明式渲染 |
| `input.addEventListener('blur', ...)` | `@blur="validateField('account')"` | 模板里直接绑定 |
| `barFill.style.width = percent + '%'` | `:style="{ width: percent + '%' }"` | 进度由 `useProgress` 驱动 |
| `alert('登录成功！…')` | `PixelToast` 组件 | 改为像素风浮层提示，不阻塞线程 |
| 手写 `try/catch` 包 localStorage | `utils/storage.js` | 统一封装，隐私模式下静默降级 |
| 校验逻辑写死在 `script.js` | `validators.js` 规则工厂 + `RULES` 配置表 | 加字段只需加一行规则 |

### 保留下来的细节

以下这些原版的「手感」都刻意保留了：

- 提交时 1400ms 的像素进度条动画（`加载世界中… N%` → `正在进入服务器…`）
- 校验失败时的聚焦顺序：账号没问题才把焦点移到密码
- 「记住我」的账号回填，且回填后焦点自动落在密码框
- 切换密码可见性后焦点回到输入框
- 输入任意字符立即清除该字段的错误提示
- 所有 `steps()` 阶梯动画、`crispEdges`、关闭字体抗锯齿的像素风设定
- `prefers-reduced-motion` 下关闭装饰动画

### 有意做的改动

1. **`alert()` 换成 `PixelToast`** —— 原生 alert 会阻塞主线程、且和像素风格不搭。
   桌面端在右上角滑入（类似 Minecraft 成就弹窗），窄屏改为底部居中提示条。
   想恢复原生弹窗，把 `App.vue` 里 `handleSuccess` 的实现换回 `alert(...)` 即可。
2. **背景云朵改为数据驱动** —— 原来三段几乎一样的 `<svg>` 现在由 `PixelCloud` 的
   `SHAPES` 映射表渲染，加一套云造型只要加一个数组。
3. **`#app` 挂载点 + 构建产物** —— 原版直接双击 HTML 就能看；Vue 版常规构建需要服务器托管。
   想保留「双击就能看」的手感，用 `npm run build:standalone`（见上文）。
   `dist/` 是纯静态文件，可直接扔到任意静态托管。

---

## 响应式断点

| 断点 | 变化 |
| --- | --- |
| `> 900px` | 完整场景：三朵云 + 三个悬浮方块 |
| `≤ 900px` | 隐藏左右两侧的悬浮方块 |
| `≤ 640px` | 面板内边距收窄、品牌字号缩小、第三方登录按钮改单列、隐藏右下角 HUD、提示条改为底部居中 |
| `≤ 380px` | 品牌字号与标题条字号进一步缩小 |

---

## 下一步可以做的

- 接入真实登录接口：`useLoginForm.js` 里已标好 `TODO`，把 `startProgress` 换成 `fetch` 即可
- 引入 `vue-router`，给「注册新角色 / 忘记密码」加上真实页面
- 引入 `Pinia` 管理登录态，把用户信息透传到其他页面
- 加单元测试：`validators.js` 是纯函数，非常适合用 Vitest 覆盖

---

## 说明

非官方粉丝作品，与 Mojang 无关。仅用于前端学习与演示。
