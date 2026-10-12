package com.fenglin.springboottest.entity;

import com.baomidou.mybatisplus.annotation.FieldFill;
import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableLogic;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * 用户实体，对应表 {@code t_user}。
 *
 * <p>建表脚本见项目根目录 {@code sql/blockcraft_init.sql}。</p>
 */
@Data
@TableName("t_user")
public class User implements Serializable {

    /** 主键，数据库自增 */
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    /** 登录账号，唯一 */
    private String username;

    /** 密码：SHA-256(明文 + salt)，不存明文 */
    private String password;

    /** 密码盐值 */
    private String salt;

    /** 昵称 */
    private String nickname;

    /** 头像地址 */
    private String avatar;

    /** 邮箱 */
    private String email;

    /** 状态：1 正常 / 0 禁用 */
    private Integer status;

    /** 最后登录 IP */
    private String lastLoginIp;

    /** 最后登录时间 */
    private LocalDateTime lastLoginTime;

    /** 创建时间，插入时由 MetaObjectHandler 自动填充 */
    @TableField(value = "create_time", fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    /** 更新时间，插入与更新时自动填充 */
    @TableField(value = "update_time", fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;

    /** 逻辑删除标记：0 未删除 / 1 已删除 */
    @TableLogic
    @TableField(value = "deleted")
    private Integer deleted;
}
