package com.fenglin.springboottest;

import org.mybatis.spring.annotation.MapperScan;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.core.env.Environment;

/**
 * 启动类。
 *
 * <p>相比原版只多了一行 {@link MapperScan}：告诉 MyBatis-Plus
 * 去 {@code com.fenglin.springboottest.mapper} 包下扫描 Mapper 接口。</p>
 */
@SpringBootApplication
@MapperScan("com.fenglin.springboottest.mapper")
public class SpringBootTestApplication {

    private static final Logger log = LoggerFactory.getLogger(SpringBootTestApplication.class);

    public static void main(String[] args) {
        Environment env = SpringApplication.run(SpringBootTestApplication.class, args).getEnvironment();

        String port = env.getProperty("server.port", "8081");
        String contextPath = env.getProperty("server.servlet.context-path", "");
        String profiles = String.join(",", env.getActiveProfiles());

        log.info("""

                ----------------------------------------------------------
                  BlockCraft 后端启动成功！
                  环境      : {}
                  本地地址  : http://localhost:{}{}
                  登录接口  : http://localhost:{}{}/api/auth/login
                  验证码    : http://localhost:{}{}/api/auth/captcha
                ----------------------------------------------------------""",
                profiles, port, contextPath, port, contextPath, port, contextPath);
    }
}
