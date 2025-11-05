const _ = require('lodash');
const combineRouters = require('koa-combine-routers');

const routers = [];
const context = require.context('.', true, /^\.\/v1\/\w+\.js$/);

context.keys().forEach((filename) => {
	routers.push(context(filename));
});

const entries = [];

_.each(routers, (router) => {
	_.each(router.stack, (s) => {
		_.each(s.methods, (m) => {
			if (['GET', 'POST', 'PUT', 'DELETE', 'PATCH'].includes(m.toUpperCase())) {
				entries.push(`${m} ${s.path}`);
			}
		});
	});
});


exports.entries = entries;

exports.routers = combineRouters(...routers);
