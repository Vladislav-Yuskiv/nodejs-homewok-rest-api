const express = require('express')
const router = express.Router()
const {
  registration,
  login,
  logout,
  updateSubscription,
  getCurrent,
  uploadAvatar,
} = require('../../controllers/users')
const guard = require('../../helpers/guard')
const loginLimit = require('../../helpers/rate-limit-login')
const upload = require('../../helpers/uploads')
const {
  validateUser,
  validateSubscription,
} = require('../users/validationUsers')

router.post('/signup', validateUser, registration)
router.post('/login', loginLimit, validateUser, login)
router.get('/logout', guard, logout)
router.patch('/', guard, validateSubscription, updateSubscription)
router.get('/current', guard, getCurrent)
router.patch('/avatars', guard, upload.single('avatar'), uploadAvatar)

module.exports = router
