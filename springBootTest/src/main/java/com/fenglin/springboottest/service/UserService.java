package com.fenglin.springboottest.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.fenglin.springboottest.dto.LoginDTO;
import com.fenglin.springboottest.dto.RegisterDTO;
import com.fenglin.springboottest.entity.User;
import com.fenglin.springboottest.vo.LoginVO;
import com.fenglin.springboottest.vo.UserVO;

/**
 * 用户业务接口。
 *
 * <p>继承 MyBatis-Plus 的 {@link IService} 后自动拥有 save / getById /
 * lambdaQuery 等通用方法，这里只声明本项目特有的业务方法。</p>
 */
public interface UserService extends IService<User> {

    /** 注册新用户 */
    void register(RegisterDTO dto);

    /** 登录，成功返回 token 与用户信息 */
    LoginVO login(LoginDTO dto, String clientIp);

    /** 查询当前登录用户资料 */
    UserVO getProfile(Long userId);

    /** 用户名是否已被占用 */
    boolean isUsernameTaken(String username);
}
