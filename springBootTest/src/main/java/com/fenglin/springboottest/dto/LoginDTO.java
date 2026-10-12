package com.fenglin.springboottest.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * 登录请求参数（对应前端 {@code useLoginForm} 的表单）。
 */
@Data
public class LoginDTO {

    /** 账号：允许用户名，也允许邮箱 */
    @NotBlank(message = "请输入账号")
    @Size(max = 64, message = "账号长度不能超过 64 位")
    private String username;

    @NotBlank(message = "请输入密码")
    @Size(min = 6, max = 64, message = "密码长度需在 6-64 位之间")
    private String password;
}
