package com.fenglin.springboottest.common;

/**
 * 登录用户上下文（当前请求线程内可见）。
 *
 * <p>由 {@code AuthInterceptor} 解析 token 后写入，Controller / Service
 * 里用 {@code UserContext.getUserId()} 直接取，不必每个方法都传 userId。</p>
 */
public final class UserContext {

    /** 当前登录用户信息 */
    public record LoginUser(Long userId, String username) {
    }

    private static final ThreadLocal<LoginUser> HOLDER = new ThreadLocal<>();

    private UserContext() {
    }

    public static void set(LoginUser user) {
        HOLDER.set(user);
    }

    public static LoginUser get() {
        return HOLDER.get();
    }

    public static Long getUserId() {
        LoginUser user = HOLDER.get();
        return user == null ? null : user.userId();
    }

    public static String getUsername() {
        LoginUser user = HOLDER.get();
        return user == null ? null : user.username();
    }

    /** 请求结束后务必清理，避免线程池复用导致的串号 */
    public static void clear() {
        HOLDER.remove();
    }
}
