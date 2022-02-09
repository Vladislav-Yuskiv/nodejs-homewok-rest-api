const User = require('../model/users')

const findById = async (id) => {
  return await User.findById(id)
}

const findByEmail = async (email) => {
  return await User.findOne({ email })
}

const findUserByVerifyToken = async (verifyToken) => {
  return await User.findOne({ verifyToken })
}

const create = async (options) => {
  const user = new User(options)
  return await user.save()
}

const updateToken = async (id, token) => {
  return await User.updateOne({ _id: id }, { token })
}

const updateTokenVerify = async (id, isVerified, verifyToken) => {
  return await User.updateOne({ _id: id }, { isVerified, verifyToken })
}

const updateSubscription = async (id, body) => {
  const result = await User.findOneAndUpdate(
    { _id: id },
    { ...body },
    { new: true }
  ).select(['-password', '-token'])
  return result
}

const updateAvatar = async (id, avatar) => {
  return await User.updateOne({ _id: id }, { avatar })
}

module.exports = {
  findByEmail,
  create,
  updateToken,
  findById,
  updateSubscription,
  updateAvatar,
  updateTokenVerify,
  findUserByVerifyToken,
}
