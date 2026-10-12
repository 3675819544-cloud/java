package com.fenglin.springboottest.common;

/**
 * 统一的业务状态码。
 *
 * <p>前端 {@code src/api/request.js} 里会读取 {@code code} 字段来决定
 * 是把错误显示在对应输入框下面，还是用顶部提示条弹出来。</p>
 *
 * <p>约定：2xx / 4xx / 5xx 沿用 HTTP 语义，1xxx 为业务自定义码。</p>
 */
public enum ResultCode {

    /* ---------------- 通用 ---------------- */
    SUCCESS(200, "操作成功"),
    PARAM_ERROR(400, "请求参数有误"),
    UNAUTHORIZED(401, "登录状态已失效，请重新登录"),
    FORBIDDEN(403, "没有访问权限"),
    NOT_FOUND(404, "请求的资源不存在"),
    ERROR(500, "服务器开小差了，请稍后再试"),

    /* ---------------- 用户相关 ---------------- */
    USERNAME_EXISTS(1001, "该用户名已被注册，换一个试试"),
    USER_NOT_FOUND(1002, "该账号不存在，请先注册"),
    PASSWORD_ERROR(1003, "密码错误，请重新输入"),
    USER_DISABLED(1004, "账号已被禁用，请联系管理员"),
    CAPTCHA_ERROR(1005, "验证码不正确"),
    CAPTCHA_EXPIRED(1006, "验证码已过期，请点击图片刷新"),
    PASSWORD_NOT_MATCH(1007, "两次输入的密码不一致");

    private final int code;
    private final String message;

    ResultCode(int code, String message) {
        this.code = code;
        this.message = message;
    }

    public int getCode() {
        return code;
    }

    public String getMessage() {
        return message;
    }
}
