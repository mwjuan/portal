const _ = require('lodash');
const path = require('path');
const config = require('config');
const Koa = require('koa');
const koaStatic = require('koa-static');
const koaMount = require('koa-mount');
const koaJson = require('koa-json');
const koaBodyParser = require('koa-bodyparser');
const { pageable } = require('./middleware/koa-pageable');
const { userAgent } = require('koa-useragent');
const koaLogger = require('./middleware/koa-logger');
const cors = require('@koa/cors');
const koaViews = require('koa-views');
const koaMongoose = require('./middleware/koa-mongoose');
const { errorHandler } = require('./middleware/errorHandler');
const requestId = require('koa-requestid');
const { koaSwagger } = require('koa2-swagger-ui');
const koaCash = require('koa-cash');

const swaggerStats = require('swagger-stats');
const e2k = require('express-to-koa');
const swaggerStatsMiddleware = swaggerStats.getMiddleware({
	name: config.swaggerStatsName,
	durationBuckets: [0.1, 0.5, 1, 2, 3],
	requestSizeBuckets: [1, 10, 100, 1000],
	responseSizeBuckets: [1, 10, 100, 1000],
	apdexThreshold: 0.5
});

const Prometheus = require('prom-client');
const collectDefaultMetrics = Prometheus.collectDefaultMetrics;
collectDefaultMetrics({ timeout: 5000 });

const requestCounter = new Prometheus.Counter({
	name: 'webapp_request_count',
	help: 'Total number of requests made to client'
});

const logger = require('infra').logger.child({ module: 'server:web' });
const { entries, routers } = require('./routers');

class WebServer {
	constructor() {
		this.entries = entries;
		this.koa = null;
		this.server = null;
		this.cache = null;
	}

	build(cache) {
		this.cache = cache;
		let koa = new Koa();
		koa.proxy = true;
		koa.use(cors());
		koa.use(requestId());
		koa.use(
			koaViews(path.join(__dirname, 'views'), {
				extension: 'hbs',
				map: { hbs: 'handlebars' },
			})
		);
		koa.use(koaMount('/api/v2', koaStatic(path.join(__dirname, 'public'))));
		koa.use(pageable());
		koa.use(koaJson());
		koa.use(errorHandler());
		koa.use(koaBodyParser());
		koa.use(koaMongoose());
		koa.use(userAgent);
		koa.use(koaLogger());
		koa.use(koaCash({
			get: (key, maxAge) => {
				return this.cache.get(key);
			},
			set: (key, value, maxAge) => {
				return this.cache.set(key, value, maxAge);
			},
			compression: true,
			setCachedHeader: true,
		}));
		koa.use(e2k(swaggerStatsMiddleware));
		koa.use(async (ctx, next) => {
			if (ctx.path === '/api/metrics') {
				ctx.body = await Prometheus.register.metrics();
				ctx.type = Prometheus.register.contentType;
			} else {
				await next();
			}
		});
		koa.use(async (ctx, next) => {
			requestCounter.inc();
			await next();
		});
		koa.use(routers());
		koa.use(
			koaSwagger({
				title: 'Space365 API',
				version: '3.0.0',
				routePrefix: '/api/docs',
				hideTopbar: true,
				oauthOptions: {
					clientId: 's365-webapp',
					clientSecret: 'd0dbacc9-c8ac-42ae-bc9d-266a65329cb2',
				},
				swaggerOptions: {
					// 'url':'http://petstore.swagger.io/v2/swagger.json',
					url: '/api/v2/swagger/api.yaml',
					jsonEditor: true,
					// docExpansion: [none, list ,full]
					docExpansion: 'none',
				},
			})
		);
		koa.context.logger = logger;

		koa.on('error', (error, ctx) => {
			logger.warn('koa encounter error :', error);
		});

		this.koa = koa;
	}

	// wstest: http://coolaf.com/tool/chattest
	async open() {
		return new Promise((resolve, reject) => {
			this.server = this.koa.listen(config.port, '0.0.0.0', () => {
				logger.info(`Web server started, please visit: http://host:${config.port} (with ${process.env.NODE_ENV} mode)`);
				resolve();
			});
		});
	}

	async close() {
		if (!this.server) return;
		await this.server.close();
		logger.info('Web server closed');
	}
}

module.exports = new WebServer();
