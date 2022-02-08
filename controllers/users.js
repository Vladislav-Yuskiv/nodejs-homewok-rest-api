const jwt = require('jsonwebtoken')
const Users = require('../repository/users')
const { HttpCode } = require('../config/constants')
require('dotenv').config()
const { CustomError } = require('../helpers/custom_error')
const SECRET_KEY = process.env.JVT_SECRET_KEY

const registration = async (req, res, next) => {
  const { email, password, subscription } = req.body
  const user = await Users.findByEmail(email)
  if (user) {
    return res.status(HttpCode.CONFLICT).json({
      status: 'error',
      code: HttpCode.CONFLICT,
      message: 'Email is already use',
    })
  }
  try {
    const newUser = await Users.create({ email, password, subscription })
    return res.status(HttpCode.CREATED).json({
      status: 'success',
      cade: HttpCode.CREATED,
      data: {
        id: newUser.id,
        email: newUser.email,
        subscription: newUser.subscription,
      },
    })
  } catch (e) {
    next(e)
  }

  res.json()
}

const login = async (req, res, next) => {
  const { email, password } = req.body
  const user = await Users.findByEmail(email)
  let isValidPassword = false
  if (user) {
    isValidPassword = await user.isValidPassword(password.toString())
  }
  if (!user || !isValidPassword) {
    return res.status(HttpCode.UNAUTHORIZED).json({
      status: 'error',
      code: HttpCode.UNAUTHORIZED,
      message: 'Email or password is wrong',
    })
  }
  const id = user._id
  const payload = { id }
  const token = jwt.sign(payload, SECRET_KEY, { expiresIn: '1h' })
  await Users.updateToken(id, token)
  return res.status(HttpCode.OK).json({
    status: 'success',
    code: HttpCode.OK,
    data: { token },
  })
}

const logout = async (req, res, next) => {
  const id = req.user._id
  await Users.updateToken(id, null)
  return res.status(HttpCode.NO_CONTENT).json({})
}

const updateSubscription = async (req, res, next) => {
  const id = req.user._id
  const user = await Users.updateSubscription(id, req.body)
  if (user) {
    return res
      .status(200)
      .json({ status: 'success', code: 200, data: { user } })
  }
  throw new CustomError(404, 'Not Found')
}

const getCurrent = async (req, res, next) => {
  return res
    .status(200)
    .json({ status: 'success', code: 200, data: { user: req.user } })
}

module.exports = { registration, login, logout, updateSubscription, getCurrent }
