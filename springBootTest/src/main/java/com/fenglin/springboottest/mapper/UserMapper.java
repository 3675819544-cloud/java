package com.fenglin.springboottest.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.fenglin.springboottest.entity.User;
import org.apache.ibatis.annotations.Mapper;

/**
 * 用户 Mapper。
 *
 * <p>继承 {@link BaseMapper} 后，单表增删改查（含逻辑删除、条件构造器）
 * 全部由 MyBatis-Plus 提供，无需写一行 SQL；复杂查询再补 XML 即可。</p>
 *
 * <p>启动类上已开启 {@code @MapperScan}，这里的 {@code @Mapper}
 * 加上只是为了在 IDEA 里能直接跳转/消除注入告警，两者不冲突。</p>
 */
@Mapper
public interface UserMapper extends BaseMapper<User> {
}
