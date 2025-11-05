const Joi = require('joi');
const mongoose = require('mongoose');

/**
 * 识别并转换为 mongoose 的ObjectId
 * @type {Joi.Schema}
 */
exports.objectId = Joi.custom((value, helpers) => {
    if ('string' === typeof value) {
        const validatePattern = Joi.string()
            .required()
            .trim()
            .lowercase()
            .pattern(/[0-9a-f]{24}/)
            .error(new Error('Invalid Object Id '));
        const validateResult = validatePattern.validate(value);
        if (validateResult.error) {
            return helpers.error('any.invalid');
        }
        return mongoose.mongo.ObjectId(value);
    } else {
        if (!mongoose.mongo.ObjectId.isValid(value)) {
            return helpers.error('any.invalid');
        }
        return value;
    }
});

exports.uuidv4 = Joi.string().length(36).required();

exports.pageable = {
    page: Joi.number().default(1).min(1),
    size: Joi.number().default(20).min(1).max(20),
    sort: Joi.string().default('-createdAt'),
};
