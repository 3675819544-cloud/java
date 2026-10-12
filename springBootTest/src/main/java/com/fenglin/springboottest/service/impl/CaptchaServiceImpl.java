package com.fenglin.springboottest.service.impl;

import com.fenglin.springboottest.common.BusinessException;
import com.fenglin.springboottest.common.ResultCode;
import com.fenglin.springboottest.service.CaptchaService;
import com.fenglin.springboottest.vo.CaptchaVO;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import javax.imageio.ImageIO;
import java.awt.BasicStroke;
import java.awt.Color;
import java.awt.Font;
import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.geom.AffineTransform;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Base64;
import java.util.Iterator;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ThreadLocalRandom;

/**
 * 图片验证码实现。
 *
 * <p>实现要点：</p>
 * <ol>
 *   <li>用 JDK 自带 Java2D 画图，不引第三方验证码库；</li>
 *   <li>正确答案只存在服务端内存（{@link ConcurrentHashMap}），
 *       前端拿到的是 {@code captchaId} + 图片，改前端 JS 也刷不出答案；</li>
 *   <li>一次一用：校验后立刻从内存移除，防止重放；</li>
 *   <li>带过期时间，并顺手清理过期数据，避免内存无限增长。</li>
 * </ol>
 *
 * <p>单机内存实现对于这个项目足够；如果以后要多实例部署，
 * 把 Map 换成 Redis 即可（接口不变）。</p>
 */
@Service
public class CaptchaServiceImpl implements CaptchaService {

    /** 可选字符：去掉易混淆的 0 O 1 I L */
    private static final String CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private static final int CODE_LENGTH = 4;
    private static final int WIDTH = 120;
    private static final int HEIGHT = 46;
    /** 2 倍物理像素绘制，配合前端 image-rendering: pixelated 得到硬边像素感 */
    private static final int SCALE = 2;
    /** 触发清理的阈值 */
    private static final int CLEAN_THRESHOLD = 2000;

    private final Map<String, CaptchaEntry> store = new ConcurrentHashMap<>();

    private final long expireSeconds;

    public CaptchaServiceImpl(@Value("${blockcraft.captcha.expire-seconds:300}") long expireSeconds) {
        this.expireSeconds = expireSeconds;
    }

    @Override
    public CaptchaVO generate() {
        cleanExpiredIfNeeded();

        String code = randomCode();
        String captchaId = UUID.randomUUID().toString().replace("-", "");
        store.put(captchaId, new CaptchaEntry(code, System.currentTimeMillis() + expireSeconds * 1000));

        CaptchaVO vo = new CaptchaVO();
        vo.setCaptchaId(captchaId);
        vo.setImage(draw(code));
        vo.setExpireSeconds(expireSeconds);
        return vo;
    }

    @Override
    public void validate(String captchaId, String code) {
        if (!StringUtils.hasText(captchaId) || !StringUtils.hasText(code)) {
            throw new BusinessException(ResultCode.CAPTCHA_EXPIRED);
        }

        // remove 而不是 get：保证「一次一用」，无论成功失败凭证都作废
        CaptchaEntry entry = store.remove(captchaId);
        if (entry == null) {
            throw new BusinessException(ResultCode.CAPTCHA_EXPIRED);
        }
        if (entry.expireAt() < System.currentTimeMillis()) {
            throw new BusinessException(ResultCode.CAPTCHA_EXPIRED);
        }
        if (!entry.code().equalsIgnoreCase(code.trim())) {
            throw new BusinessException(ResultCode.CAPTCHA_ERROR);
        }
    }

    /* ---------------- 内部实现 ---------------- */

    private String randomCode() {
        ThreadLocalRandom random = ThreadLocalRandom.current();
        StringBuilder builder = new StringBuilder(CODE_LENGTH);
        for (int i = 0; i < CODE_LENGTH; i++) {
            builder.append(CHARS.charAt(random.nextInt(CHARS.length())));
        }
        return builder.toString();
    }

    /** 用 Java2D 画一张像素风验证码，返回 data URL */
    private String draw(String code) {
        BufferedImage image = new BufferedImage(WIDTH * SCALE, HEIGHT * SCALE, BufferedImage.TYPE_INT_RGB);
        Graphics2D g = image.createGraphics();
        try {
            g.scale(SCALE, SCALE);
            // 关掉抗锯齿，保持像素硬边
            g.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_OFF);
            g.setRenderingHint(RenderingHints.KEY_TEXT_ANTIALIASING, RenderingHints.VALUE_TEXT_ANTIALIAS_OFF);

            ThreadLocalRandom random = ThreadLocalRandom.current();

            // 1. 黑色凹槽底
            g.setColor(Color.BLACK);
            g.fillRect(0, 0, WIDTH, HEIGHT);

            // 2. 噪点
            Color[] noiseColors = {new Color(0x3A3A3A), new Color(0x4C4C4C), new Color(0x5A5A5A)};
            for (int i = 0; i < 180; i++) {
                g.setColor(noiseColors[random.nextInt(noiseColors.length)]);
                g.fillRect(random.nextInt(WIDTH), random.nextInt(HEIGHT), 1, 1);
            }

            // 3. 干扰线
            Color[] lineColors = {new Color(0x6EE04F), new Color(0x5B8DD9), new Color(0xFFFF55), new Color(0x74C042)};
            g.setStroke(new BasicStroke(1f));
            for (int i = 0; i < 3; i++) {
                g.setColor(lineColors[random.nextInt(lineColors.length)]);
                g.drawLine(random.nextInt(WIDTH), random.nextInt(HEIGHT), random.nextInt(WIDTH), random.nextInt(HEIGHT));
            }

            // 4. 逐字符绘制，带随机偏移/旋转/颜色
            Color[] charColors = {new Color(0x6EE04F), new Color(0xCFE3FF), new Color(0xFFFF55),
                    new Color(0x74C042), Color.WHITE};
            g.setFont(new Font(Font.MONOSPACED, Font.BOLD, 24));

            int step = WIDTH / (code.length() + 1);
            for (int i = 0; i < code.length(); i++) {
                int x = step * (i + 1);
                int y = HEIGHT / 2 + random.nextInt(-4, 5);
                AffineTransform origin = g.getTransform();
                g.rotate((random.nextDouble() - 0.5) * 0.4, x, y);
                g.setColor(charColors[random.nextInt(charColors.length)]);
                g.drawString(String.valueOf(code.charAt(i)), x - 8, y + 8);
                g.setTransform(origin);
            }
        } finally {
            g.dispose();
        }

        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            ImageIO.write(image, "png", out);
            return "data:image/png;base64," + Base64.getEncoder().encodeToString(out.toByteArray());
        } catch (IOException e) {
            throw new IllegalStateException("生成验证码图片失败", e);
        }
    }

    /** 存储量超过阈值时清理过期数据 */
    private void cleanExpiredIfNeeded() {
        if (store.size() < CLEAN_THRESHOLD) {
            return;
        }
        long now = System.currentTimeMillis();
        Iterator<Map.Entry<String, CaptchaEntry>> iterator = store.entrySet().iterator();
        while (iterator.hasNext()) {
            if (iterator.next().getValue().expireAt() < now) {
                iterator.remove();
            }
        }
    }

    /** 内存中的验证码记录 */
    private record CaptchaEntry(String code, long expireAt) {
    }
}
