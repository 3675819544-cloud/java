package com.fenglin.springboottest.controller;

import com.fenglin.springboottest.common.BusinessException;
import com.fenglin.springboottest.common.Result;
import com.fenglin.springboottest.common.ResultCode;
import com.fenglin.springboottest.common.UserContext;
import com.fenglin.springboottest.service.UserService;
import com.fenglin.springboottest.vo.UserVO;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 用户资料接口，需要携带 token 才能访问。
 *
 * <p>路径落在 {@code /api/**} 且不在 {@code /api/auth/**} 白名单内，
 * 会被 {@code AuthInterceptor} 拦截并注入 {@link UserContext}，
 * 所以这里直接 {@code UserContext.getUserId()} 就能拿到当前用户。</p>
 *
 * <p>命名说明：根包下已有一个项目原有的
 * {@code com.fenglin.springboottest.UserController}（Thymeleaf 演示用），
 * 两个类如果都叫 UserController，Spring 生成 Bean 名时会冲突
 * （ConflictingBeanDefinitionException），所以这里叫 UserProfileController。</p>
 */
@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserProfileController {

    private final UserService userService;

    /** 获取当前登录用户资料 */
    @GetMapping("/info")
    public Result<UserVO> info() {
        Long userId = UserContext.getUserId();
        if (userId == null) {
            throw new BusinessException(ResultCode.UNAUTHORIZED);
        }
        return Result.ok(userService.getProfile(userId));
    }
}
