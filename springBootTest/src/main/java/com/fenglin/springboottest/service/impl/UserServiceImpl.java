package com.fenglin.springboottest.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.fenglin.springboottest.common.BusinessException;
import com.fenglin.springboottest.common.ResultCode;
import com.fenglin.springboottest.dto.LoginDTO;
import com.fenglin.springboottest.dto.RegisterDTO;
import com.fenglin.springboottest.entity.User;
import com.fenglin.springboottest.mapper.UserMapper;
import com.fenglin.springboottest.service.CaptchaService;
import com.fenglin.springboottest.service.UserService;
import com.fenglin.springboottest.util.JwtUtil;
import com.fenglin.springboottest.util.PasswordUtil;
import com.fenglin.springboottest.vo.LoginVO;
import com.fenglin.springboottest.vo.UserVO;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;

/**
 * 用户业务实现。
 *
 * <p>全篇没有一行手写 SQL：查询用 MyBatis-Plus 的 {@code lambdaQuery()}，
 * 插入用 {@code save()}，更新用 {@code lambdaUpdate()}。</p>
 */
@Service
@RequiredArgsConstructor
public class UserServiceImpl extends ServiceImpl<UserMapper, User> implements UserService {

    private static final Logger log = LoggerFactory.getLogger(UserServiceImpl.class);

    /** 正常状态 */
    private static final int STATUS_ENABLED = 1;

    private final CaptchaService captchaService;
    private final JwtUtil jwtUtil;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void register(RegisterDTO dto) {
        String username = dto.getUsername().trim();

        // 1. 两次密码一致性（前端校验过，这里再挡一次）
        if (StringUtils.hasText(dto.getConfirmPassword())
                && !dto.getConfirmPassword().equals(dto.getPassword())) {
            throw new BusinessException(ResultCode.PASSWORD_NOT_MATCH);
        }

        // 2. 用户名唯一性：先查，给出友好提示
        if (isUsernameTaken(username)) {
            throw new BusinessException(ResultCode.USERNAME_EXISTS);
        }

        // 3. 校验验证码（放在最后：只有真的要落库了才作废凭证）
        captchaService.validate(dto.getCaptchaId(), dto.getCaptchaCode());

        // 4. 组装实体并保存
        String salt = PasswordUtil.randomSalt();
        User user = new User();
        user.setUsername(username);
        user.setSalt(salt);
        user.setPassword(PasswordUtil.encrypt(dto.getPassword(), salt));
        user.setNickname(username);
        user.setStatus(STATUS_ENABLED);

        try {
            save(user);
        } catch (DuplicateKeyException e) {
            // 并发下两个请求同时通过第 2 步检查时，靠数据库唯一索引兜底
            throw new BusinessException(ResultCode.USERNAME_EXISTS);
        }
        log.info("新用户注册成功: id={}, username={}", user.getId(), user.getUsername());
    }

    @Override
    public LoginVO login(LoginDTO dto, String clientIp) {
        String username = dto.getUsername().trim();

        // 1. 按用户名查（逻辑删除的记录会被自动过滤掉）
        User user = lambdaQuery().eq(User::getUsername, username).one();
        if (user == null) {
            throw new BusinessException(ResultCode.USER_NOT_FOUND);
        }

        // 2. 状态检查
        if (user.getStatus() == null || user.getStatus() != STATUS_ENABLED) {
            throw new BusinessException(ResultCode.USER_DISABLED);
        }

        // 3. 密码比对：SHA-256(明文 + 该用户的盐)
        if (!PasswordUtil.matches(dto.getPassword(), user.getSalt(), user.getPassword())) {
            throw new BusinessException(ResultCode.PASSWORD_ERROR);
        }

        // 4. 记录登录信息
        LocalDateTime now = LocalDateTime.now();
        lambdaUpdate()
                .eq(User::getId, user.getId())
                .set(User::getLastLoginTime, now)
                .set(User::getLastLoginIp, clientIp)
                .update();
        user.setLastLoginTime(now);
        user.setLastLoginIp(clientIp);

        // 5. 签发 token 并返回
        LoginVO vo = new LoginVO();
        vo.setToken(jwtUtil.createToken(user.getId(), user.getUsername()));
        vo.setExpiresIn(jwtUtil.getExpireSeconds());
        vo.setUser(toUserVO(user));

        log.info("用户登录成功: id={}, username={}, ip={}", user.getId(), user.getUsername(), clientIp);
        return vo;
    }

    @Override
    public UserVO getProfile(Long userId) {
        User user = getById(userId);
        if (user == null) {
            throw new BusinessException(ResultCode.USER_NOT_FOUND);
        }
        return toUserVO(user);
    }

    @Override
    public boolean isUsernameTaken(String username) {
        return lambdaQuery().eq(User::getUsername, username).count() > 0;
    }

    /** 实体转 VO，顺手把 password / salt 这类敏感字段挡在外面 */
    private UserVO toUserVO(User user) {
        UserVO vo = new UserVO();
        vo.setId(user.getId());
        vo.setUsername(user.getUsername());
        vo.setNickname(user.getNickname());
        vo.setAvatar(user.getAvatar());
        vo.setEmail(user.getEmail());
        vo.setStatus(user.getStatus());
        vo.setLastLoginTime(user.getLastLoginTime());
        vo.setCreateTime(user.getCreateTime());
        return vo;
    }
}
