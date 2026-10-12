package com.fenglin.springboottest.util;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.util.StringUtils;

/**
 * 获取客户端真实 IP。
 *
 * <p>经过 Nginx / 网关转发后 {@code request.getRemoteAddr()} 拿到的是代理 IP，
 * 真实地址在这些请求头里，按优先级依次尝试。</p>
 */
public final class IpUtil {

    private static final String UNKNOWN = "unknown";
    private static final String[] HEADERS = {
            "X-Forwarded-For",
            "X-Real-IP",
            "Proxy-Client-IP",
            "WL-Proxy-Client-IP",
            "HTTP_CLIENT_IP",
            "HTTP_X_FORWARDED_FOR"
    };

    private IpUtil() {
    }

    public static String getClientIp(HttpServletRequest request) {
        if (request == null) {
            return UNKNOWN;
        }
        for (String header : HEADERS) {
            String ip = request.getHeader(header);
            if (StringUtils.hasText(ip) && !UNKNOWN.equalsIgnoreCase(ip)) {
                // X-Forwarded-For 可能是 "客户端IP, 代理1, 代理2"，取第一个
                int comma = ip.indexOf(',');
                return comma > 0 ? ip.substring(0, comma).trim() : ip.trim();
            }
        }
        String remoteAddr = request.getRemoteAddr();
        // 本地访问时 IPv6 回环地址转成更好读的形式
        return "0:0:0:0:0:0:0:1".equals(remoteAddr) ? "127.0.0.1" : remoteAddr;
    }
}
