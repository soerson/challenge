const Ajv = require('ajv')
const { requestValidator } = require('./requestValidator');
const ajv = new Ajv()

const querySchema = {
    type: 'object',
    properties: {
        query: {
            type: 'object',
            properties: {
                amount: { type: 'number', minimum: 0 }
            },
            required: ['amount'],
            additionalProperties: false
        },
    },
    required: ['query'],
    additionalProperties: true
}

const validateAmount = requestValidator(querySchema)

module.exports = { validateAmount };
