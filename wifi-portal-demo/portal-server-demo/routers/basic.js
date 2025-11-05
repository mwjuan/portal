const Router = require('koa-router');
const _ = require('lodash');
const config = require('config');

const router = new Router({ prefix: '/' });

// https://smb.tp-link.com.cn/service/detail_article_3413.html
// http://LAN_IP:Port/portal/auth/?ssid_mode=true&pagetype=xx&authtype=5&vlan=4095&staIp=xx&staMac=xx&apMac=xxx&apIp=xx
// http://172.16.25.173:8080/?ssid_mode=true&pagetype=100&wlanuserip=172.16.21.3&ssid=TP-LINK_AP&wlanapmac=68-dd-b7-e2-f9-49&wlanacip=172.16.21.190&wlanusermac=e2-b7-59-6e-ad-4e&vlan=4095&staMac=e2:b7:59:6e:ad:4e&staIp=172.16.21.3&apMac=68:dd:b7:e2:f9:49&apIp=172.16.21.2&supportTPAuth=true&bas_port=10443&bas_http_port=8080

router.get('/', async (ctx) => {
	// const { ssid_mode, pagetype, vlan, staIp, staMac, apIp, apMac, wlanuserip, ssid, wlanacip, wlanapmac, wlanusermac, supportTPAuth, bas_port, bas_http_port } = ctx.query;
	// if (_.isEmpty(acUrl)) acUrl = config.acUrl;

	// const viewdata = { acUrl, ssid_mode, pagetype, vlan, staIp, staMac, apIp, apMac, wlanuserip, ssid, wlanacip, wlanapmac, wlanusermac, supportTPAuth, bas_port, bas_http_port };
	// await renderLoginPage(ctx, viewdata);

	console.log("get===>>>>", ctx)
	let acUrl = ctx.request.headers['referer'];
	console.log("acUrl=>>>>>" + acUrl);

	const viewdata = { acUrl };
	await renderLoginPage(ctx, viewdata);
	return;
});

router.post('/', async ctx => {
	const { login_type, redirect_uri, username, password } = ctx.request.body;
	console.dir({ login_type, redirect_uri, username, password });
	ctx.body = 'login ok!';
	ctx.status = 200;
});

let renderLoginPage = async (ctx, viewdata) => {
	console.log("cookies===>>>", ctx);

	// if (ctx.cookies.get('flash')) {
	// 	const flash = JSON.parse(new Buffer.from(ctx.cookies.get('flash'), 'base64').toString());
	// 	viewdata.flash = flash;
	// 	ctx.cookies.set('flash', null);
	// }
	// await ctx.render('login', viewdata);
	await ctx.render('login', viewdata);
};

module.exports = router;
