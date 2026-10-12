package com.fenglin.springboottest.service;

import com.fenglin.springboottest.vo.CaptchaVO;

/**
 * 图片验证码服务。
 */
public interface CaptchaService {

    /** 生成一张新的验证码，返回凭证 id + 图片 */
    CaptchaVO generate();

    /**
     * 校验验证码。
     *
     * @param captchaId 凭证 id
     * @param code      用户输入
     * @throws com.fenglin.springboottest.common.BusinessException 校验不通过
     */
    void validate(String captchaId, String code);
}
