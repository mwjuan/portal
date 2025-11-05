// const pinyin = require('pinyin');

// module.exports = function pinyinPlugin(schema, options) {
// 	schema.pre('save', function (next) {
// 		if (this.name && !this.pinyin && !this.name.startsWith('_')) {
// 			try {
// 				this.pinyin = pinyin(this.name, {
// 					style: pinyin.STYLE_NORMAL,
// 				}).join('');
// 			} catch (ignore) {
// 				// ignore
// 			}
// 		}
// 		next();
// 	});
// };
