const _ = require('lodash');
const moment = require('moment');
const path = require('path');
const config = require('config');
const Koa = require('koa');
const koaStatic = require('koa-static');
const koaMount = require('koa-mount');
const koaJson = require('koa-json');
const koaBodyParser = require('koa-bodyparser');
const { userAgent } = require('koa-useragent');
const cors = require('@koa/cors');
const koaViews = require('koa-views');
const requestId = require('koa-requestid');
const router = require('./routers/basic.js');

class WebServer {
	constructor() {
		this.koa = this.build();
		this.server = null;
	}

	build() {
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
		koa.use(koaMount('/', koaStatic(path.join(__dirname, 'public'))));
		koa.use(koaJson());
		koa.use(koaBodyParser());
		koa.use(userAgent);
		koa.use(router.routes());

		koa.on('error', (error, ctx) => {
			console.error('koa encounter error :', error);
		});
		return koa;
	}

	async open() {
		return new Promise((resolve, reject) => {
			this.server = this.koa.listen(config.port, '0.0.0.0', () => {
				console.log(`Web server started, please visit: http://:${config.port} (with ${process.env.NODE_ENV} mode)`);
				resolve();
			});
		});
	}

	async close() {
		if (!this.server) return;
		await this.server.close();
		console.log('Web server closed.');
	}
}

module.exports = new WebServer();
