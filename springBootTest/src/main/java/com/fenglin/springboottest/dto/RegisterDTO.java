package com.fenglin.springboottest.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * 注册请求参数（对应前端 {@code useRegisterForm} 的表单）。
 *
 * <p>校验规则与前端 {@code src/utils/validators.js} 保持一致：
 * 用户名 3-16 位字母/数字/下划线，密码至少 6 位。</p>
 */
@Data
public class RegisterDTO {

    @NotBlank(message = "请输入用户名")
    @Pattern(regexp = "^[A-Za-z0-9_]{3,16}$",
            message = "用户名仅限字母、数字、下划线，长度 3-16 位")
    private String username;

    @NotBlank(message = "请输入密码")
    @Size(min = 6, max = 64, message = "密码长度需在 6-64 位之间")
    private String password;

    /** 确认密码，前端已校验过，后端再验一次防止绕过 */
    private String confirmPassword;

    /** 验证码的领取凭证，来自 GET /api/auth/captcha */
    @NotBlank(message = "验证码已失效，请点击图片刷新")
    private String captchaId;

    /** 用户输入的验证码 */
    @NotBlank(message = "请输入验证码")
    private String captchaCode;
}
