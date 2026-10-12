package com.fenglin.springboottest.interceptor;

import com.fenglin.springboottest.common.UserContext;
import com.fenglin.springboottest.util.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpMethod;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

/**
 * 登录拦截器：为需要登录的接口校验 token，并把用户信息塞进 {@link UserContext}。
 *
 * <p>校验失败直接抛 {@code BusinessException}，交给全局异常处理器返回 401 结构，
 * Controller 里就完全不用写鉴权代码了。</p>
 */
public class AuthInterceptor implements HandlerInterceptor {

    private final JwtUtil jwtUtil;

    public AuthInterceptor(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        // 放行 CORS 预检请求
        if (HttpMethod.OPTIONS.matches(request.getMethod())) {
            return true;
        }
        // 放行静态资源等非 Controller 请求
        if (!(handler instanceof HandlerMethod)) {
            return true;
        }

        UserContext.set(jwtUtil.parseToken(jwtUtil.resolveToken(request)));
        return true;
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response,
                                Object handler, Exception ex) {
        // 线程池复用线程，必须清理，否则下一个请求可能读到上一个用户
        UserContext.clear();
    }
}
