
/**
 * 根据url query组装成pageable对象
 * ctx.state.pageable
 *
 * opt.size
 * - 如果所有page的size都一致可以设置, 如果需要个性化size, 则无需设置，延迟到service中决定
 *
 * page: >0, 1-based
 * size: >0
 * sort: foo,-bar
 *
 *
 * mongoose multiple sort:
 * sort({_id: -1, upvotes_count: -1})
 * criteria can be asc, desc, ascending, descending, 1, or -1
 * model.find({ ... }).sort({ field : criteria}).exec(function(err, model){ ... });

 * // equivalent
 * query.sort('field -test');
 */
exports.pageable = exports.paginate = (opt) => {
	opt = opt || { page: 1, size: 100 };

	return async (ctx, next) => {
		const pageable = {};

		// page默认值为1
		let page = parseInt(ctx.query.page) || opt.page;
		if (!page) page = 1;

		// 1-based
		if (typeof page === 'number' && !Number.isNaN(page) && page > 0) {
			pageable.page = page;
		}

		// size ( 等于0: 返回page meta, 小于0: 分页大小infinite )
		const size = parseInt(ctx.query.size);
		if (size !== null && typeof size === 'number' && !Number.isNaN(size)) {
			pageable.size = size;
		} else {
			pageable.size = opt.size;
		}

		if (ctx.query.sort) {
			pageable.sort = sort(ctx.query.sort);
		}
		ctx.state.pageable = pageable;
		return next();
	};
};

/**
 * 传入的内容无法解析或者是空时返回{}
 * foo, -bar
 */
let sort = (sort) => {
	if (!sort) return {};

	let sorters = sort.split(',');
	sorters = _.map(sorters, (s) => s.trim());

	return sorters.reduce((acc, item) => {
		if (item === '' || item === '-') return acc;

		if (item.startsWith('-')) {
			acc[item.slice(1)] = -1;
		} else {
			acc[item] = 1;
		}
		return acc;
	}, {});
};

exports.sort = sort;
