const { createLogger, format, transports } = require('winston');
const { errors, combine, timestamp, label, colorize, simple, json, printf } = format;

const chalk = require('chalk');
const config = require('config');
require('winston-daily-rotate-file');

/**
 * module: 模块, server:web, service:jwt => info.event.module
 * category: 分类, cron, etc. => info.event.dataset
 */

const fix = format(info => {
  if(info.timestamp) {
    info['@timestamp'] = info.timestamp;
    delete info.timestamp;
  }
  info.service = {
    type: config.logger.serviceType
  }
  info.event = info.event || {};
  if(info.category) info.event.dataset = info.category;
  if(info.module) info.event.module = info.module;
  delete info.category;
  delete info.module;

  return info;
});

const create = () => {
  const logger = createLogger();

  if(config.logger.file) {
    logger.add(
      new transports.DailyRotateFile({
        level: config.logger.level,
        json: true,
        dirname: config.logger.dirname,
        filename: config.logger.filename,
        datePattern: config.logger.datePattern,
				zippedArchive: false,
				maxSize: config.logger.maxSize,
				maxFiles: config.logger.maxFiles,
				handleExceptions: true,
				format: combine(errors({ stack: true }), timestamp(), fix(), json())
      })
    );
  }

  if(config.logger.console) {
    logger.add(
      new transports.Console({
        level: config.logger.level,
				handleExceptions: false,
				json: false,
				format: combine(
					colorize(),
					errors({ stack: true }),
					simple(),
					printf(info => {
						let { level } = info;
						switch (level) {
						case 'info':
							level = chalk.cyan(level);
							break;
						case 'warn':
							level = chalk.yellow(level);
							break;
						case 'error':
							level = chalk.red(level);
							break;
						default:
							break;
						}

						const category = info.category ? ` ${chalk.bgRed(info.category)}` : '';
						const module = info.module ? `${chalk.bgBlue(info.module)}` : '';

						if (info.error) {
							return `${level}:${module}${category} ${info.message}\n${info.error.stack}`;
						}
						return `${level}:${module}${category} ${info.message ? info.message : JSON.stringify(info)}`;
					})
				)
      })
    )
  }

  return logger;
};

exports.logger = create();