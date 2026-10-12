package com.fenglin.springboottest.util;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fenglin.springboottest.common.BusinessException;
import com.fenglin.springboottest.common.ResultCode;
import com.fenglin.springboottest.common.UserContext;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.security.MessageDigest;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * 轻量 JWT 工具（HS256）。
 *
 * <p>不引第三方库，只用 JDK 的 {@link Mac} + Jackson 实现，token 结构就是标准
 * 的 {@code header.payload.signature} 三段式：</p>
 *
 * <pre>
 *  header    : {"alg":"HS256","typ":"JWT"}
 *  payload   : {"uid":1,"username":"Steve","iat":...,"exp":...}
 *  signature : Base64Url( HMAC-SHA256(header + "." + payload, secret) )
 * </pre>
 *
 * <p>为什么需要它：HTTP 本身是无状态的，登录成功后服务器发一个带签名的 token，
 * 前端每次请求带上，服务端验签即可知道「你是谁」，不用在服务器上存 session。</p>
 */
@Component
public class JwtUtil {

    private static final String HEADER_JSON = "{\"alg\":\"HS256\",\"typ\":\"JWT\"}";
    private static final String HMAC_ALGORITHM = "HmacSHA256";
    private static final Base64.Encoder ENCODER = Base64.getUrlEncoder().withoutPadding();
    private static final Base64.Decoder DECODER = Base64.getUrlDecoder();
    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    /** 前端约定：Authorization: Bearer <token> */
    private static final String TOKEN_PREFIX = "Bearer ";

    private final byte[] secret;
    private final long expireSeconds;

    public JwtUtil(@Value("${blockcraft.jwt.secret}") String secret,
                   @Value("${blockcraft.jwt.expire-seconds:604800}") long expireSeconds) {
        this.secret = secret.getBytes(StandardCharsets.UTF_8);
        this.expireSeconds = expireSeconds;
    }

    public long getExpireSeconds() {
        return expireSeconds;
    }

    /** 签发 token */
    public String createToken(Long userId, String username) {
        long now = System.currentTimeMillis() / 1000;
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("uid", userId);
        payload.put("username", username);
        payload.put("iat", now);
        payload.put("exp", now + expireSeconds);

        try {
            String header = encode(HEADER_JSON.getBytes(StandardCharsets.UTF_8));
            String body = encode(OBJECT_MAPPER.writeValueAsBytes(payload));
            String signingInput = header + "." + body;
            return signingInput + "." + sign(signingInput);
        } catch (Exception e) {
            throw new IllegalStateException("生成 token 失败", e);
        }
    }

    /**
     * 校验并解析 token。
     *
     * @return 登录用户信息
     * @throws BusinessException token 缺失 / 被篡改 / 已过期
     */
    public UserContext.LoginUser parseToken(String token) {
        if (!StringUtils.hasText(token)) {
            throw new BusinessException(ResultCode.UNAUTHORIZED);
        }
        String[] parts = token.split("\\.");
        if (parts.length != 3) {
            throw new BusinessException(ResultCode.UNAUTHORIZED);
        }

        // 1. 验签：签名对不上说明 token 被改过（比如把 uid 改成别人）
        String signingInput = parts[0] + "." + parts[1];
        byte[] expected = sign(signingInput).getBytes(StandardCharsets.UTF_8);
        byte[] actual = parts[2].getBytes(StandardCharsets.UTF_8);
        if (!MessageDigest.isEqual(expected, actual)) {
            throw new BusinessException(ResultCode.UNAUTHORIZED);
        }

        // 2. 解析载荷并检查过期时间
        try {
            JsonNode payload = OBJECT_MAPPER.readTree(DECODER.decode(parts[1]));
            long expireAt = payload.path("exp").asLong();
            if (expireAt > 0 && expireAt * 1000 < System.currentTimeMillis()) {
                throw new BusinessException(ResultCode.UNAUTHORIZED, "登录已过期，请重新登录");
            }
            return new UserContext.LoginUser(payload.path("uid").asLong(), payload.path("username").asText());
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            throw new BusinessException(ResultCode.UNAUTHORIZED);
        }
    }

    /**
     * 从请求中取出 token：优先读 {@code Authorization} 头，其次兼容
     * 自定义头 {@code X-Token} 与查询参数 {@code ?token=}（方便本地调试）。
     */
    public String resolveToken(HttpServletRequest request) {
        String authorization = request.getHeader("Authorization");
        if (StringUtils.hasText(authorization)) {
            if (authorization.regionMatches(true, 0, TOKEN_PREFIX, 0, TOKEN_PREFIX.length())) {
                return authorization.substring(TOKEN_PREFIX.length()).trim();
            }
            return authorization.trim();
        }
        String xToken = request.getHeader("X-Token");
        if (StringUtils.hasText(xToken)) {
            return xToken.trim();
        }
        return request.getParameter("token");
    }

    /* ---------------- 内部方法 ---------------- */

    private String sign(String signingInput) {
        try {
            Mac mac = Mac.getInstance(HMAC_ALGORITHM);
            mac.init(new SecretKeySpec(secret, HMAC_ALGORITHM));
            return encode(mac.doFinal(signingInput.getBytes(StandardCharsets.UTF_8)));
        } catch (GeneralSecurityException e) {
            throw new IllegalStateException("签名失败", e);
        }
    }

    private static String encode(byte[] bytes) {
        return ENCODER.encodeToString(bytes);
    }
}
