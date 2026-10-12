package com.fenglin.springboottest.config;

import com.fenglin.springboottest.interceptor.AuthInterceptor;
import com.fenglin.springboottest.util.JwtUtil;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Web 层配置：跨域 + 登录拦截器。
 *
 * <p>跨域说明：开发时前端跑在 5173（Vite），后端跑在 8081，属于不同源。
 * 项目里已经给 Vite 配了代理（{@code vite.config.js} 的 server.proxy），
 * 正常情况下走代理不会有跨域问题；这里的 CORS 配置是为了让「前端直接
 * 访问 8081」或「前端打包后由别的端口托管」这两种情况也能跑通。</p>
 */
@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    private final JwtUtil jwtUtil;

    public WebMvcConfig(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                // Spring Boot 3 中 allowCredentials(true) 时不能直接用 allowedOrigins("*")，
                // 要用 allowedOriginPatterns
                .allowedOriginPatterns("*")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .exposedHeaders("Authorization")
                .allowCredentials(true)
                .maxAge(3600);
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(new AuthInterceptor(jwtUtil))
                // 所有 /api/** 默认都要登录
                .addPathPatterns("/api/**")
                // 登录、注册、验证码本身不需要登录态
                .excludePathPatterns("/api/auth/**");
    }
}
