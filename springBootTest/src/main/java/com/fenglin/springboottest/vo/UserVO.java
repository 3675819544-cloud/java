package com.fenglin.springboottest.vo;

import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * 返回给前端的用户信息（**不含** password / salt / deleted 等敏感字段）。
 */
@Data
public class UserVO implements Serializable {

    private Long id;

    private String username;

    private String nickname;

    private String avatar;

    private String email;

    /** 状态：1 正常 / 0 禁用 */
    private Integer status;

    private LocalDateTime lastLoginTime;

    private LocalDateTime createTime;
}
