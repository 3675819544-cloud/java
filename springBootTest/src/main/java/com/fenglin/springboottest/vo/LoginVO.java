package com.fenglin.springboottest.vo;

import lombok.Data;

import java.io.Serializable;

/**
 * 登录成功返回体：token + 用户信息。
 */
@Data
public class LoginVO implements Serializable {

    /** JWT，前端存 sessionStorage / localStorage，后续请求放在 Authorization 头里 */
    private String token;

    /** 固定为 Bearer */
    private String tokenType = "Bearer";

    /** token 有效期（秒） */
    private Long expiresIn;

    /** 登录用户信息 */
    private UserVO user;
}
