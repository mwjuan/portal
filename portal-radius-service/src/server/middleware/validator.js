// 校验器封装
exports.validate = (schema) => {
	if (!schema) {
		return function (ctx, next) {
			return next();
		};
	}
	const validateFunctions = {};
	if (schema.query) {
		validateFunctions.query = (ctx) => schema.query.validate(ctx.query);
	}
	if (schema.body) {
		validateFunctions.body = (ctx) => schema.body.validate(ctx.request.body);
	}

	if (schema.params) {
		validateFunctions.params = (ctx) => schema.params.validate(ctx.params);
	}
	return async function (ctx, next) {
		ctx.validateResult = {};
		for (const fk of Object.keys(validateFunctions)) {
			const validateResult = validateFunctions[fk](ctx);
			if (validateResult.error) {
				ctx.throw(400, `validate error ${JSON.stringify(validateResult.error.details[0].message)}`, {
					debug: validateResult,
				});
			}
			ctx.validateResult[fk] = validateResult.value;
		}
		return next();
	};
};
