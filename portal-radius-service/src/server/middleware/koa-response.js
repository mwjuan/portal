const HTTP_OK = 0;

class CommonService {
	static responseData(data = null, statusCode = HTTP_OK, msg = null, debug) {
		return {
			code: statusCode, data, msg, debug,
		};
	}

	static responseCount(data = null, statusCode = HTTP_OK, msg = null, debug) {
		return {
			code: statusCode, count: data, msg, debug,
		};
	}

	static errorResponse(errCode, errMsg, debug) {
		return CommonService.responseData(undefined, errCode, errMsg, debug);
	}
}

exports.reqBody = CommonService;

exports.formResponse = function () {
	return async function (ctx, next) {
		const _result = await next();
		if (!ctx.body) {
			const status = ctx.response.status === 200 ? HTTP_OK : ctx.response.status;
			ctx.body = CommonService.responseData(ctx.body, status);
		} else if (!(ctx.body.data || ctx.body.statusCode || ctx.body.msg)) {
			const status = ctx.response.status === 200 ? HTTP_OK : ctx.response.status;
			ctx.body = CommonService.responseData(ctx.body, status);
		}

		return _result;
	};
};