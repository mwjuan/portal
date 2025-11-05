const { mongoose } = require('infra').mongodb;

const model = {};
const modelProxy = new Proxy(model, {
	get(target, prop) {
		return mongoose.model(prop);
	},
});

module.exports = function () {
	return async (ctx, next) => {
		ctx.model = modelProxy;
		return next();
	};
};
