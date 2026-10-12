package com.fenglin.springboottest.vo;

import lombok.Data;

import java.io.Serializable;

/**
 * 图片验证码返回体。
 *
 * <p>服务端只把「凭证 id」和「图片」给前端，正确答案留在服务端内存里，
 * 用户提交时带上 id + 输入值由服务端比对 —— 这样才真正起到防刷作用。</p>
 */
@Data
public class CaptchaVO implements Serializable {

    /** 验证码凭证，注册时原样回传 */
    private String captchaId;

    /** 图片内容，形如 data:image/png;base64,xxxxxx，可直接给 <img :src> 用 */
    private String image;

    /** 有效秒数，前端可用来做倒计时提示 */
    private Long expireSeconds;
}
