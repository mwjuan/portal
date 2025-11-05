function timestamp(schema) {
	schema.add({
		createdAt: { type: Number },
		updatedAt: { type: Number },
	});

	// Add hooks to save timestamps of creation and modification
	schema.pre('save', createdAtTimestamp);
	schema.pre('findOneAndUpdate', updatedAtTimestamp);
	schema.pre('update', updatedAtTimestamp);

	function createdAtTimestamp(next) {
		if (!this.createdAt) this.createdAt = Math.floor(Date.now() / 1000);
		this.updatedAt = Math.floor(Date.now() / 1000);
		next();
	}

	function updatedAtTimestamp(next) {
		this._update.updatedAt = Math.floor(Date.now() / 1000);
		next();
	}
}

module.exports = timestamp;
