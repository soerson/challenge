const Ajv = require('ajv')
const ajv = new Ajv({ coerceTypes: true })

const requestValidator = (schema) => (req, res, next) => {
    const validate = ajv.compile(schema)
    const valid = validate(req)
    if (!valid) {
        next(validate.errors)
    }
    next()
};

module.exports = { requestValidator };
