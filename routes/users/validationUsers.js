const Joi = require('joi')
Joi.objectId = require('joi-objectid')(Joi)

const schemaUser = Joi.object({
  email: Joi.string().email({
    minDomainSegments: 2,
    tlds: true,
  }),
  password: Joi.required(),
  subscription: Joi.optional(),
})

const schemaSubscription = Joi.object({
  subscription: Joi.string().required(),
})

const schemaEmail = Joi.object({
  email: Joi.string()
    .email({
      minDomainSegments: 2,
      tlds: true,
    })
    .required(),
})

const validate = async (schema, obj, res, next) => {
  try {
    await schema.validateAsync(obj)
    next()
  } catch (err) {
    res.status(400).json({
      status: 'error',
      code: 400,
      message: `Field ${err.message.replace(/"/g, '')}`,
    })
  }
}

module.exports.validateUser = async (req, res, next) => {
  return await validate(schemaUser, req.body, res, next)
}

module.exports.validateSubscription = async (req, res, next) => {
  return await validate(schemaSubscription, req.body, res, next)
}

module.exports.validateEmail = async (req, res, next) => {
  return await validate(schemaEmail, req.body, res, next)
}
