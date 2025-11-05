function normalizeId(ret) {
	if (!ret) return;
	if (typeof ret.id === 'undefined') {
		ret.id = ret._id;
	}

	if (typeof ret._id !== 'undefined') {
		delete ret._id;
	}

	for (const prop in ret) {
		if (Object.prototype.hasOwnProperty.call(ret, prop) && Array.isArray(ret[prop])) {
			for (const item of ret[prop]) {
				normalizeId(item);
			}
		}

		if (Object.prototype.hasOwnProperty.call(ret, prop) && Object.prototype.toString.call(ret[prop]) === '[object Object]') {
			normalizeId(ret[prop]);
		}
	}
}

function removeVersion(ret) {
	if (!ret) return;
	if (typeof ret.__v !== 'undefined') {
		delete ret.__v;
	}

	for (const prop in ret) {
		if (Object.prototype.hasOwnProperty.call(ret, prop) && Array.isArray(ret[prop])) {
			for (const item of ret[prop]) {
				removeVersion(item);
			}
		}

		if (Object.prototype.hasOwnProperty.call(ret, prop) && Object.prototype.toString.call(ret[prop]) === '[object Object]') {
			removeVersion(ret[prop]);
		}
	}
}

function removeDeleteFlag(ret) {
	if (!ret) return;
	if (typeof ret.deleted !== 'undefined') {
		delete ret.deleted;
	}

	for (const prop in ret) {
		if (Object.prototype.hasOwnProperty.call(ret, prop) && Array.isArray(ret[prop])) {
			for (const item of ret[prop]) {
				removeDeleteFlag(item);
			}
		}

		if (Object.prototype.hasOwnProperty.call(ret, prop) && Object.prototype.toString.call(ret[prop]) === '[object Object]') {
			removeDeleteFlag(ret[prop]);
		}
	}
}

// https://github.com/meanie/mongoose-to-json
// 不适用于自定义_id，所以复制过来修改一下
module.exports = function norma(schema) {
	// NOTE: this plugin is actually called *after* any schema's
	// custom toJSON has been defined, so we need to ensure not to
	// overwrite it. Hence, we remember it here and call it later
	let transform;
	if (schema.options.toJSON && schema.options.toJSON.transform) {
		transform = schema.options.toJSON.transform;
	}

	// Extend toJSON options
	schema.options.toJSON = Object.assign(schema.options.toJSON || {}, {
		transform(doc, ret, options) {
			removeDeleteFlag(ret);

			// Remove version
			if (schema.options.removeVersion !== false) {
				removeVersion(ret);
			}

			// Normalize ID
			if (schema.options.normalizeId !== false) {
				normalizeId(ret);
			}

			// Call custom transform if present
			if (transform) {
				return transform(doc, ret, options);
			}
		},
	});
};
