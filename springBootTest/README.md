# springBootTest · BlockCraft 用户中心后端

配合前端项目 **`blockcraft-vue-login9191`**（Vue 3 + Vite 的像素风登录页）使用的
Spring Boot 后端，已改造为 **Spring Boot 3.4.5 + MyBatis-Plus 3.5.9 + MySQL 8** 架构。

---

## 一、技术栈

| 层次 | 选型 | 说明 |
| --- | --- | --- |
| 框架 | Spring Boot 3.4.5 / Java 17 | 要求 JDK 17+（本地 JDK 21 也可） |
| Web | spring-boot-starter-web | RESTful JSON 接口 |
| 校验 | spring-boot-starter-validation | `@Valid` + `@NotBlank` 注解式校验 |
| 持久层 | **MyBatis-Plus 3.5.9**（`mybatis-plus-spring-boot3-starter`） | 单表零 SQL，逻辑删除、自动填充 |
| 数据库 | MySQL 8.0 | 库名 `blockcraft`，账号 `root / 123456` |
| 连接池 | HikariCP（Spring Boot 默认） | —— |
| 鉴权 | 自实现 JWT（HS256，无第三方依赖） | 登录发 token，接口带 `Authorization` |
| 验证码 | Java2D 生成的图片验证码 | 答案存服务端内存，一次性、5 分钟过期 |
| 工具 | Lombok | IDEA 需启用注解处理（通常会自动提示） |

> **为什么是 `mybatis-plus-spring-boot3-starter`**：Spring Boot 3 用 Jakarta EE 9+，
> 老的 `mybatis-plus-boot-starter`（3.5.1 及更早）只适配 Spring Boot 2，会启动失败。

---

## 二、目录结构

```
springBootTest/
├─ pom.xml
├─ sql/
│  └─ blockcraft_init.sql              ← 建库建表脚本（含演示账号）
└─ src/main/
   ├─ java/com/fenglin/springboottest/
   │  ├─ SpringBootTestApplication.java      启动类（@MapperScan 扫描 Mapper）
   │  ├─ UserController.java                 项目原有 Thymeleaf 演示控制器（保留未动）
   │  │
   │  ├─ common/                             通用层
   │  │  ├─ Result.java                      统一响应体 { code, message, data, timestamp }
   │  │  ├─ ResultCode.java                  状态码枚举（与前端 constants/api.js 对应）
   │  │  ├─ BusinessException.java           业务异常
   │  │  ├─ GlobalExceptionHandler.java      全局异常处理 @RestControllerAdvice
   │  │  └─ UserContext.java                 当前登录用户（ThreadLocal）
   │  │
   │  ├─ config/
   │  │  ├─ MybatisPlusConfig.java           字段自动填充（create_time / update_time）
   │  │  └─ WebMvcConfig.java                跨域配置 + 登录拦截器注册
   │  │
   │  ├─ interceptor/
   │  │  └─ AuthInterceptor.java             校验 token，注入 UserContext
   │  │
   │  ├─ controller/
   │  │  ├─ AuthController.java              /api/auth/**  登录 / 注册 / 验证码
   │  │  └─ UserProfileController.java       /api/user/**  需登录的接口
   │  │
   │  ├─ service/
   │  │  ├─ UserService.java                 extends IService<User>
   │  │  ├─ CaptchaService.java
   │  │  └─ impl/
   │  │     ├─ UserServiceImpl.java          extends ServiceImpl<UserMapper, User>
   │  │     └─ CaptchaServiceImpl.java
   │  │
   │  ├─ mapper/
   │  │  └─ UserMapper.java                  extends BaseMapper<User>
   │  │
   │  ├─ entity/User.java                    @TableName("t_user")
   │  ├─ dto/{LoginDTO, RegisterDTO}.java    入参
   │  ├─ vo/{UserVO, LoginVO, CaptchaVO}.java 出参
   │  └─ util/{JwtUtil, PasswordUtil, IpUtil}.java
   └─ resources/
      ├─ application.properties              公共配置（含 profile 切换、日志、JWT 密钥）
      ├─ application-dev.properties          开发环境：8081 + MySQL 连接
      ├─ application-test.properties         测试环境：8080
      └─ application-prob.properties         生产环境：8082
```

---

## 三、跑起来（4 步）

### 1. 建库建表

```bash
mysql -uroot -p123456 < sql/blockcraft_init.sql
```

或者在 IDEA 里打开 `sql/blockcraft_init.sql` 全选执行。
脚本是幂等的（`CREATE ... IF NOT EXISTS`），重复执行不会报错、不会清数据。

执行完会有两个演示账号：

| 账号 | 密码 |
| --- | --- |
| `Steve` | `123456` |
| `Lucy` | `123456` |

### 2. 修改数据库密码（如果你本机不是 123456）

改 `src/main/resources/application-dev.properties`：

```properties
spring.datasource.username=root
spring.datasource.password=123456
```

### 3. 启动后端

IDEA 里直接运行 `SpringBootTestApplication`，或命令行：

```bash
mvn spring-boot:run
```

启动成功控制台会打印：

```
----------------------------------------------------------
  BlockCraft 后端启动成功！
  环境      : dev
  本地地址  : http://localhost:8081
  登录接口  : http://localhost:8081/api/auth/login
----------------------------------------------------------
```

自测一下：浏览器打开 <http://localhost:8081/api/auth/ping>，看到 `{"code":200,...}` 就通了。

### 4. 启动前端

```bash
cd 到 blockcraft-vue-login9191
npm install
npm run dev
```

打开 <http://localhost:5173>，用 `Steve / 123456` 登录即可。

---

## 四、接口文档

**统一响应结构**（所有接口一致，HTTP 状态码恒为 200，业务结果看 `code`）：

```json
{
  "code": 200,
  "message": "操作成功",
  "data": { },
  "timestamp": 1760000000000
}
```

**状态码表**（`com.fenglin.springboottest.common.ResultCode`）：

| code | 含义 | 前端处理 |
| --- | --- | --- |
| 200 | 成功 | —— |
| 400 | 参数校验失败 | 顶部提示条 |
| 401 | 未登录 / token 失效 | 清登录态，跳登录页 |
| 500 | 服务器异常 | 顶部提示条 |
| 1001 | 用户名已被注册 | 用户名输入框下方 |
| 1002 | 账号不存在 | 账号输入框下方 |
| 1003 | 密码错误 | 密码输入框下方 |
| 1004 | 账号被禁用 | 账号输入框下方 |
| 1005 | 验证码不正确 | 验证码输入框下方 + 自动换一张 |
| 1006 | 验证码已过期 | 同上 |
| 1007 | 两次密码不一致 | 确认密码框下方 |

### 1) 获取图片验证码

```
GET /api/auth/captcha
```

响应：

```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "captchaId": "9f2c1b7e4a8d4e0f9c3b5a7d1e6f2a4b",
    "image": "data:image/png;base64,iVBORw0KGgo...",
    "expireSeconds": 300
  }
}
```

### 2) 注册

```
POST /api/auth/register
Content-Type: application/json

{
  "username": "Alex",
  "password": "123456",
  "confirmPassword": "123456",
  "captchaId": "9f2c1b7e4a8d4e0f9c3b5a7d1e6f2a4b",
  "captchaCode": "K7QF"
}
```

### 3) 登录

```
POST /api/auth/login
Content-Type: application/json

{ "username": "Steve", "password": "123456" }
```

响应 `data`：

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tokenType": "Bearer",
  "expiresIn": 604800,
  "user": { "id": 1, "username": "Steve", "nickname": "史蒂夫", "status": 1 }
}
```

### 4) 查询当前用户（需要 token）

```
GET /api/user/info
Authorization: Bearer <token>
```

### 5) 其他

| 接口 | 方法 | 说明 |
| --- | --- | --- |
| `/api/auth/check-username?username=xxx` | GET | 用户名是否可用 |
| `/api/auth/logout` | POST | 退出（JWT 无状态，前端删本地 token 即可） |
| `/api/auth/ping` | GET | 连通性探测 |

---

## 五、几个设计说明（面试常问）

**密码为什么不存明文？**
存的是 `SHA-256(明文密码 + 随机盐)`，见 `PasswordUtil`。加盐是为了让相同密码
得到不同哈希，避免彩虹表反查；校验用 `MessageDigest.isEqual` 做恒定时间比较，
避免时序攻击。SQL 脚本里用 `SHA2(CONCAT('123456', salt), 256)` 造测试数据，
和 Java 实现输出完全一致。

**验证码答案为什么要放服务端？**
前端原来用 Canvas 本地画码、本地比对，改一行 JS 就绕过了。现在后端把答案存在
内存 `ConcurrentHashMap` 里，只把 `captchaId` + 图片给前端；校验后立刻
`remove`，保证「一次一用」，防重放。

**JWT 有什么用？**
HTTP 无状态，服务端不存 session。登录成功签发一个 HMAC-SHA256 签名的 token，
前端每次请求带 `Authorization: Bearer xxx`；服务端验签就知道你是谁，
改 payload 会验签失败。密钥配在 `application.properties` 的
`blockcraft.jwt.secret`，**上线前必须换成随机长字符串**。

**逻辑删除怎么做的？**
实体 `User.deleted` 上加了 `@TableLogic`，配合
`mybatis-plus.global-config.db-config.logic-delete-*`，调用
`removeById()` 时 MyBatis-Plus 自动改写为 `UPDATE ... SET deleted = 1`，
查询自动追加 `WHERE deleted = 0`。

---

## 六、常见问题

**启动报 `Access denied for user 'root'@'localhost'`**
→ 数据库密码不是 123456，改 `application-dev.properties`。

**启动报 `Unknown database 'blockcraft'`**
→ 先执行 `sql/blockcraft_init.sql`。

**端口 8081 被占用**
→ 改 `application-dev.properties` 的 `server.port`，同时把前端
`vite.config.js` 里的 `BACKEND_ORIGIN` 改成同一个端口。

**前端请求报「无法连接后端服务」**
→ 后端没启动。先看 <http://localhost:8081/api/auth/ping> 是否返回 JSON。

**IDEA 里 Lombok 报红（找不到 getter/setter）**
→ `Settings → Build → Compiler → Annotation Processors` 勾选
`Enable annotation processing`；并安装 Lombok 插件（新版 IDEA 已内置）。

**以后要用分页**
→ MyBatis-Plus 3.5.9 把 jsqlparser 拆出去了，除了注册
`PaginationInnerInterceptor`，还要额外引入 `mybatis-plus-jsqlparser` 依赖
（`MybatisPlusConfig` 类注释里写了）。
