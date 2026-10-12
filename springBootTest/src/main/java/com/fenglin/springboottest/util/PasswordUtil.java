package com.fenglin.springboottest.util;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;

/**
 * 密码工具：加盐 SHA-256。
 *
 * <p>存储格式：{@code password = SHA-256(明文密码 + salt)}，十六进制小写；
 * salt 为随机 32 位十六进制串，与 password 一起存在 t_user 表两列里。</p>
 *
 * <p>之所以不直接存明文，是为了防止数据库被拖库后密码立刻泄露；
 * 之所以加盐，是为了防止相同密码算出相同哈希被彩虹表反查。</p>
 *
 * <p>注意：Java 的十六进制实现与 MySQL 的 {@code SHA2(CONCAT(pwd, salt), 256)}
 * 输出完全一致，所以 SQL 脚本里可以直接用 SHA2 造测试数据。</p>
 */
public final class PasswordUtil {

    private static final char[] HEX_DIGITS = "0123456789abcdef".toCharArray();
    private static final SecureRandom RANDOM = new SecureRandom();
    private static final int SALT_BYTES = 16;

    private PasswordUtil() {
    }

    /** 生成随机盐值（32 位十六进制小写字符串） */
    public static String randomSalt() {
        byte[] bytes = new byte[SALT_BYTES];
        RANDOM.nextBytes(bytes);
        return toHex(bytes);
    }

    /** 加密：SHA-256(明文 + 盐) */
    public static String encrypt(String rawPassword, String salt) {
        if (rawPassword == null || salt == null) {
            throw new IllegalArgumentException("密码与盐值不能为空");
        }
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            digest.update(rawPassword.getBytes(StandardCharsets.UTF_8));
            digest.update(salt.getBytes(StandardCharsets.UTF_8));
            return toHex(digest.digest());
        } catch (NoSuchAlgorithmException e) {
            // JDK 必然支持 SHA-256，走到这里说明运行环境异常
            throw new IllegalStateException("当前 JVM 不支持 SHA-256 算法", e);
        }
    }

    /** 校验明文密码是否与库中密文匹配（使用恒定时间比较，避免时序攻击） */
    public static boolean matches(String rawPassword, String salt, String encryptedPassword) {
        if (rawPassword == null || salt == null || encryptedPassword == null) {
            return false;
        }
        byte[] expected = encryptedPassword.getBytes(StandardCharsets.UTF_8);
        byte[] actual = encrypt(rawPassword, salt).getBytes(StandardCharsets.UTF_8);
        return MessageDigest.isEqual(expected, actual);
    }

    private static String toHex(byte[] bytes) {
        char[] chars = new char[bytes.length * 2];
        for (int i = 0; i < bytes.length; i++) {
            int value = bytes[i] & 0xFF;
            chars[i * 2] = HEX_DIGITS[value >>> 4];
            chars[i * 2 + 1] = HEX_DIGITS[value & 0x0F];
        }
        return new String(chars);
    }
}
