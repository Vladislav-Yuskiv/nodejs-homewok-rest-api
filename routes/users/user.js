const express = require('express')
const router = express.Router()
const wrappError = require('../../helpers/errorHandler')

const {
  registration,
  login,
  logout,
  updateSubscription,
  getCurrent,
  uploadAvatar,
  verifyUser,
  repeatEmailForVerifyUser,
} = require('../../controllers/users')
const guard = require('../../helpers/guard')
const loginLimit = require('../../helpers/rate-limit-login')
const upload = require('../../helpers/uploads')
const {
  validateUser,
  validateSubscription,
  validateEmail,
} = require('../users/validationUsers')

router.post('/signup', validateUser, registration)
router.post('/login', loginLimit, validateUser, login)
router.get('/logout', guard, logout)
router.patch('/', guard, validateSubscription, updateSubscription)
router.get('/current', guard, getCurrent)
router.patch('/avatars', guard, upload.single('avatar'), uploadAvatar)

router.get('/verify/:token', wrappError(verifyUser))
router.post('/verify', validateEmail, repeatEmailForVerifyUser)

module.exports = router
