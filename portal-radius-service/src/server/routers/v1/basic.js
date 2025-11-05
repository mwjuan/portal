const Router = require('koa-router');
const router = new Router({ prefix: '/api' });
const { name: service, version } = require('../../../../package.json');
const { formResponse } = require('../../middleware/koa-response');

router.use(formResponse());

router.get('/', async (ctx) => {
	const _now = new Date();
	ctx.body = `${service} works! start at ${_now} version: ${version}`;
	ctx.status = 200;
});

module.exports = router;