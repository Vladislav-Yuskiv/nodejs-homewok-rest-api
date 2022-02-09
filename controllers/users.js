const jwt = require('jsonwebtoken')
const Users = require('../repository/users')
const UploadService = require('../services/file-upload')
const { HttpCode } = require('../config/constants')
require('dotenv').config()
const SECRET_KEY = process.env.JVT_SECRET_KEY

const { CreateSendlerSendGrid } = require('../services/email/sender')
const { CustomError } = require('../helpers/custom_error')
const EmailService = require('../services/email/service')

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
    //TODO Send Email for verify users
    const newUser = await Users.create({ email, password, subscription })

    const EmailServices = new EmailService(
      process.env.NODE_ENV,
      new CreateSendlerSendGrid()
    )
    const statusEmail = await EmailServices.sendVerifyEmail(
      newUser.email,
      newUser.verifyToken
    )

    return res.status(HttpCode.CREATED).json({
      status: 'success',
      cade: HttpCode.CREATED,
      data: {
        id: newUser.id,
        email: newUser.email,
        subscription: newUser.subscription,
        avatar: newUser.avatar,
        successEmail: statusEmail,
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
    isValidPassword = await user?.isValidPassword(password.toString())
  }
  if (!user || !isValidPassword || !user?.isVerified) {
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

const uploadAvatar = async (req, res, next) => {
  const id = String(req.user._id)

  const file = req.file
  const destination = process.env.AVATAR_OF_USERS

  const uploadService = new UploadService(destination)
  const avatarUrl = await uploadService.save(file)
  await Users.updateAvatar(id, avatarUrl)

  return res.status(HttpCode.OK).json({
    status: 'success',
    code: HttpCode.OK,
    data: {
      avatar: avatarUrl,
    },
  })
}

const verifyUser = async (req, res, next) => {
  const user = await Users.findUserByVerifyToken(req.params.token)
  if (user) {
    await Users.updateTokenVerify(user._id, true, null)
    return res.status(HttpCode.OK).json({
      status: 'success',
      code: HttpCode.OK,
      data: { message: 'Verification successful' },
    })
  }
  return res.status(HttpCode.BAD_REQUEST).json({
    status: 'error',
    code: HttpCode.BAD_REQUEST,
    data: { message: 'User not found' },
  })
}

const repeatEmailForVerifyUser = async (req, res, next) => {
  const { email } = req.body
  const user = await Users.findByEmail(email)
  if (user) {
    if (!user.isVerified) {
      const { email, verifyToken } = user
      const EmailServices = new EmailService(
        process.env.NODE_ENV,
        new CreateSendlerSendGrid()
      )
      const statusEmail = await EmailServices.sendVerifyEmail(
        email,
        verifyToken
      )
      return res.status(HttpCode.OK).json({
        status: 'success',
        code: HttpCode.OK,
        data: { message: 'Verification email sent' },
      })
    }
    return res.status(HttpCode.BAD_REQUEST).json({
      status: 'error',
      code: HttpCode.BAD_REQUEST,
      data: { message: 'Verification has already been passed' },
    })
  }
  return res.status(HttpCode.NOT_FOUND).json({
    status: 'error',
    code: HttpCode.NOT_FOUND,
    data: { message: 'user not found' },
  })
}

module.exports = {
  registration,
  login,
  logout,
  updateSubscription,
  getCurrent,
  uploadAvatar,
  verifyUser,
  repeatEmailForVerifyUser,
}
