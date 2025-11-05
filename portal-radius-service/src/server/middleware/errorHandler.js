const _ = require('lodash');
const { reqBody } = require('server/middleware/koa-response');
const config = require('config');

// 避免引用混乱 而单独引用
const logger = require('../../infra/logger').logger.child({ category: '', module: 'middleware:errorHandler' });

class ServiceError {
    /**
     * 业务报错实例
     * @param {Number} errCode  报错码
     * @param {String} errMsg   业务报错信息（返回给前端）
     * @param {String} innerMsg 内部错误信息（日志打出，dev环境可以返回给接口）
     */
    constructor(errCode, errMsg, innerMsg) {
        this.errCode = errCode;
        this.errMsg = errMsg;
        this.innerMsg = innerMsg ? `[${innerMsg}]` : '';
    }

    /**
     * 填充报错模板
     * @param {Object || Map} fill
     * @returns {ServiceError}
     */
    fill(fill) {
        this.errMsg = _.template(this.errMsg)(fill);
        return this;
    }

    /**
     * 在错误消息中添加消息
     * @param {string} msg
     * @returns {ServiceError}
     */
    add(msg) {
        this.innerMsg += msg;
        return this;
    }

    /**
     * 执行抛出异常，可catch 也可交由中间件处理
     */
    throw() {
        this.error = new Error(this.errMsg);
        this.stack = this.error.stack;
        this.log = `[${this.errCode}]${this.innerMsg}[${this.errMsg}]\n${this.stack}`;
        logger.error(this.log);
        throw this;
    }
}

const isServiceError = module.exports.isServiceError = (err)=>{
    return err instanceof ServiceError;
};

/**
 *
 * @param {Number||String} [errCode]   报错业务code  如 10012
 * @param {String} [errMsg]    可填充的业务报错模板 会返回给业务
 * @param {String} [innerMsg]  日志中报错信息（固定信息），不会返回给业务
 * @returns {function(String=): ServiceError}
 * @constructor
 */
module.exports.ServiceError =
    (errCode, errMsg, innerMsg) =>
    /**
     *
     * @param {String} [addInnerMsg] 运行中可以加入的报错信息
     * @returns {ServiceError}
     */
    addInnerMsg =>
        new ServiceError(errCode, errMsg, (innerMsg || '') + (addInnerMsg || ''));

module.exports.errorHandler = () => async (ctx, next) => {
    try {
        await next();
    } catch (err) {
        if (isServiceError(err)) {
            // 预期错误，前端可以收到详细报错信息 默认200
            const _debugMsg =
                config.env === 'development' || process.env.NODE_ENV === 'development'
                    ? {
                          msg: `${err.message} 【_debugMsg 调试信息 线上均不显示】`,
                          detail: err.log,
                          stack: err.stack,
                      }
                    : undefined;
            ctx.body = reqBody.errorResponse(err.errCode, err.errMsg, _debugMsg);
        } else {
            // 非预期错误，前端只可以看到 internal error
            logger.error(`非预期(or非业务)错误 ${err}, ${err.stack}`);
            if (config.env === 'development' || process.env.NODE_ENV === 'development') {
                ctx.body = reqBody.errorResponse(ctx.response.statusCode ? ctx.response.statusCode !== 200 : 500, 'internal error', {
                    msg: `${err.message} 【body 调试信息 线上均不显示】`,
                    stack: err.stack,
                    name: err.name,
                });
            } else {
                ctx.body = reqBody.errorResponse(ctx.response.statusCode ? ctx.response.statusCode !== 200 : 500, 'internal error');
            }
        }
    }
};

/**
 *
 * @param {function:OperatorDto} logOpDto
 * @returns {function(*=, *=): Promise<void>}
 */
module.exports.errorLogOp = logOpDto => async (ctx, next) => {
    ctx.logOp = logOpDto();
    if (!ctx.logOp.error) {
        return await next();
    }
    try {
        return await next();
    } catch (err) {
        if (!isServiceError(err)) {
            ctx.logOp.error({ error: err.toString() });
        } else {
            ctx.logOp.exception({
                exception: (err.innerMsg ? err.innerMsg.toString() : '') + (err.errMsg ? err.errMsg.toString() : ''),
            });
        }
        throw err;
    }
};
