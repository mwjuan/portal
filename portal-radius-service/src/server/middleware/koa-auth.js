const {logger, jwt} = require('infra');
const {authService} = require('service');


module.exports.auth = function () {
	return async function (ctx, next) {
		//简简单单塞一个UserObjectId
		const token = ctx.header.authorization?
			ctx.header.authorization.split(' ')[1]:
			undefined;

		try { // todo 优化掉try
			if (token && !jwt.isExp(token)) {
				const userObjectId = authService.getUserIDFromToken(token);
				ctx.state = {userObjectId};
				ctx.set('token', authService.getToken(userObjectId));
			} else {
				ctx.state = {};
			}
		}catch (e) {
			ctx.state = {};
		}


		logger.info(`[Token] path [${ctx.request.path}] token [${token}] state [${JSON.stringify(ctx.state)}]`);
		return next();
	};

};
