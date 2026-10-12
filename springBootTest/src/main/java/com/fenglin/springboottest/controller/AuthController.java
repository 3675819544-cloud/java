package com.fenglin.springboottest.controller;

import com.fenglin.springboottest.common.Result;
import com.fenglin.springboottest.dto.LoginDTO;
import com.fenglin.springboottest.dto.RegisterDTO;
import com.fenglin.springboottest.service.CaptchaService;
import com.fenglin.springboottest.service.UserService;
import com.fenglin.springboottest.util.IpUtil;
import com.fenglin.springboottest.vo.CaptchaVO;
import com.fenglin.springboottest.vo.LoginVO;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * 认证接口：验证码 / 注册 / 登录 / 退出。
 *
 * <p>对应前端 {@code src/api/auth.js}，路径前缀由 Vite 代理转发到 8081 端口。</p>
 *
 * <pre>
 * GET  /api/auth/captcha        获取图片验证码
 * GET  /api/auth/check-username 用户名是否可用
 * POST /api/auth/register       注册
 * POST /api/auth/login          登录
 * POST /api/auth/logout         退出
 * GET  /api/auth/ping           连通性探测
 * </pre>
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final CaptchaService captchaService;
    private final UserService userService;

    /** 获取图片验证码（4 位字符，5 分钟内有效，一次性） */
    @GetMapping("/captcha")
    public Result<CaptchaVO> captcha() {
        return Result.ok(captchaService.generate());
    }

    /** 用户名占用检查，注册页可以做成失焦即时提示 */
    @GetMapping("/check-username")
    public Result<Map<String, Boolean>> checkUsername(@RequestParam("username") String username) {
        boolean available = username != null && !userService.isUsernameTaken(username.trim());
        return Result.ok(Map.of("available", available));
    }

    /** 注册 */
    @PostMapping("/register")
    public Result<Void> register(@Valid @RequestBody RegisterDTO dto) {
        userService.register(dto);
        return Result.ok("角色创建成功", null);
    }

    /** 登录 */
    @PostMapping("/login")
    public Result<LoginVO> login(@Valid @RequestBody LoginDTO dto, HttpServletRequest request) {
        LoginVO loginVO = userService.login(dto, IpUtil.getClientIp(request));
        return Result.ok("登录成功", loginVO);
    }

    /**
     * 退出登录。
     * token 是无状态的 JWT，服务端不保存会话，前端把本地 token 删掉即可。
     */
    @PostMapping("/logout")
    public Result<Void> logout() {
        return Result.ok("已退出登录", null);
    }

    /** 连通性探测：前端启动时可用它判断后端是否已就绪 */
    @GetMapping("/ping")
    public Result<String> ping() {
        return Result.ok("pong");
    }
}
