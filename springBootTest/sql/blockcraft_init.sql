-- ============================================================================
--  BlockCraft 用户中心 · 数据库初始化脚本
--  配合 springBootTest 后端项目使用（Spring Boot 3.4.5 + MyBatis-Plus 3.5.9）
--
--  执行方式（任选其一）：
--    1) 命令行： mysql -uroot -p123456 < blockcraft_init.sql
--    2) IDEA 内置 Database 工具 / Navicat：打开本文件全选执行
--    3) MySQL Workbench：File -> Open SQL Script 后执行
--
--  ⚠ 字符集说明：脚本内含中文演示数据（史蒂夫 / 露西）。中文 Windows 的
--    mysql 客户端默认以 GBK 连接，直接 `mysql < file` 会把 UTF-8 的中文
--    当成 GBK 解析导致写入失败。本脚本已通过 `SET NAMES utf8mb4;` 强制
--    连接字符集，三种方式均可正确写入中文，无需额外加 --default-character-set。
--
--  脚本可重复执行（CREATE ... IF NOT EXISTS），不会删除已有数据。
--  如需彻底重来：先手动执行 DROP DATABASE blockcraft; 再跑本脚本。
-- ============================================================================

-- 强制连接字符集为 utf8mb4，保证中文演示账号在任何客户端都能正确写入
SET NAMES utf8mb4;

-- ---------------------------------------------------------------------------
-- 1. 创建数据库
-- ---------------------------------------------------------------------------
CREATE DATABASE IF NOT EXISTS `blockcraft`
    DEFAULT CHARACTER SET utf8mb4
    DEFAULT COLLATE utf8mb4_general_ci;

USE `blockcraft`;

-- ---------------------------------------------------------------------------
-- 2. 用户表 t_user
--    密码存储规则：password = SHA-256(明文密码 + salt)，十六进制小写
--    对应 Java 侧 com.fenglin.springboottest.util.PasswordUtil#encrypt
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `t_user`
(
    `id`              BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键 ID',
    `username`        VARCHAR(32)  NOT NULL COMMENT '登录账号（唯一）',
    `password`        VARCHAR(128) NOT NULL COMMENT '密码：SHA-256(明文 + salt) 十六进制',
    `salt`            VARCHAR(64)  NOT NULL COMMENT '密码盐值（随机 32 位十六进制）',
    `nickname`        VARCHAR(32)           DEFAULT NULL COMMENT '昵称',
    `avatar`          VARCHAR(255)          DEFAULT NULL COMMENT '头像地址',
    `email`           VARCHAR(64)           DEFAULT NULL COMMENT '邮箱',
    `status`          TINYINT      NOT NULL DEFAULT 1 COMMENT '账号状态：1 正常 / 0 禁用',
    `last_login_ip`   VARCHAR(64)           DEFAULT NULL COMMENT '最后登录 IP',
    `last_login_time` DATETIME              DEFAULT NULL COMMENT '最后登录时间',
    `create_time`     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time`     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted`         TINYINT      NOT NULL DEFAULT 0 COMMENT '逻辑删除：0 未删除 / 1 已删除',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_username` (`username`),
    KEY `idx_status` (`status`)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_general_ci COMMENT ='用户表';

-- ---------------------------------------------------------------------------
-- 3. 演示账号
--    Steve  / 123456
--    Lucy   / 123456
--    salt 固定，password 由 MySQL 的 SHA2() 直接算出，与 Java 实现保持一致，
--    方便对照验证密码算法是否正确。
-- ---------------------------------------------------------------------------
INSERT INTO `t_user` (`username`, `password`, `salt`, `nickname`, `email`, `status`)
SELECT 'Steve',
       SHA2(CONCAT('123456', 'a1b2c3d4e5f60718293a4b5c6d7e8f90'), 256),
       'a1b2c3d4e5f60718293a4b5c6d7e8f90',
       '史蒂夫',
       'steve@blockcraft.local',
       1
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `t_user` WHERE `username` = 'Steve');

INSERT INTO `t_user` (`username`, `password`, `salt`, `nickname`, `email`, `status`)
SELECT 'Lucy',
       SHA2(CONCAT('123456', 'b2c3d4e5f60718293a4b5c6d7e8f90a1'), 256),
       'b2c3d4e5f60718293a4b5c6d7e8f90a1',
       '露西',
       'lucy@blockcraft.local',
       1
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `t_user` WHERE `username` = 'Lucy');

-- ---------------------------------------------------------------------------
-- 4. 自检：查看初始化结果
--    预期：id=1 Steve / id=2 Lucy，password 为 64 位十六进制字符串
-- ---------------------------------------------------------------------------
SELECT `id`, `username`, `nickname`, `status`, `create_time`
FROM `t_user`
ORDER BY `id`;
