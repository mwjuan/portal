module.exports = {
	apps: [{
		name: 'portal-demo',
		script: 'index.js',
		instances: '1',
		autorestart: true,
		watch: true,
		ignore_watch: ['node_modules', 'uploads', 'logs'],
		max_memory_restart: '1G'
	}]
};