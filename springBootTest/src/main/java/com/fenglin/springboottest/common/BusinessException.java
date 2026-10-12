package com.fenglin.springboottest.common;

/**
 * 业务异常：抛出后由 {@link GlobalExceptionHandler} 统一转换成 {@link Result}。
 *
 * <p>例如：{@code throw new BusinessException(ResultCode.USERNAME_EXISTS);}</p>
 */
public class BusinessException extends RuntimeException {

    private final int code;

    public BusinessException(ResultCode resultCode) {
        super(resultCode.getMessage());
        this.code = resultCode.getCode();
    }

    public BusinessException(ResultCode resultCode, String message) {
        super(message);
        this.code = resultCode.getCode();
    }

    public BusinessException(int code, String message) {
        super(message);
        this.code = code;
    }

    public int getCode() {
        return code;
    }
}
