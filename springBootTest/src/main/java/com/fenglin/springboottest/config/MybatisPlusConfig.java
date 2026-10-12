package com.fenglin.springboottest.config;

import com.baomidou.mybatisplus.core.handlers.MetaObjectHandler;
import org.apache.ibatis.reflection.MetaObject;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.LocalDateTime;

/**
 * MyBatis-Plus 配置。
 *
 * <p>这里只做一件事：自动填充 create_time / update_time，
 * 业务代码里就再也不用写 {@code user.setCreateTime(LocalDateTime.now())}。</p>
 *
 * <p>填充规则由实体上的 {@code @TableField(fill = ...)} 声明：
 * {@code FieldFill.INSERT} 只在插入时填，{@code INSERT_UPDATE} 插入和更新都填。</p>
 *
 * <p>关于分页：本项目没有分页需求，所以没有注册 PaginationInnerInterceptor。
 * 以后需要分页时，除了注册拦截器，还要额外引入 jsqlparser 依赖
 * （MyBatis-Plus 3.5.9 起把它从 extension 里拆出去了）：</p>
 * <pre>
 * &lt;dependency&gt;
 *   &lt;groupId&gt;com.baomidou&lt;/groupId&gt;
 *   &lt;artifactId&gt;mybatis-plus-jsqlparser&lt;/artifactId&gt;
 *   &lt;version&gt;3.5.9&lt;/version&gt;
 * &lt;/dependency&gt;
 * </pre>
 */
@Configuration
public class MybatisPlusConfig {

    @Bean
    public MetaObjectHandler metaObjectHandler() {
        return new MetaObjectHandler() {

            @Override
            public void insertFill(MetaObject metaObject) {
                LocalDateTime now = LocalDateTime.now();
                // 只有当实体字段为 null 且标注了对应 fill 策略时才会真正写入
                strictInsertFill(metaObject, "createTime", LocalDateTime.class, now);
                strictInsertFill(metaObject, "updateTime", LocalDateTime.class, now);
            }

            @Override
            public void updateFill(MetaObject metaObject) {
                strictUpdateFill(metaObject, "updateTime", LocalDateTime.class, LocalDateTime.now());
            }
        };
    }
}
