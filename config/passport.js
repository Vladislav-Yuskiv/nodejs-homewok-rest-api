var { Strategy, ExtractJwt } = require('passport-jwt')

const passport = require('passport')
const Users = require('../repository/users')
require('dotenv').config()
const SECRET_KEY = process.env.JVT_SECRET_KEY

var params = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: SECRET_KEY,
}

passport.use(
  new Strategy(params, async (payload, done) => {
    const user = await Users.findById(payload.id)
    try {
      if (!user) {
        return done(new Error('User not found'), false)
      }
      if (!user.token) {
        return done(null, false)
      }
      return done(null, user)
    } catch (err) {
      return done(err, false)
    }
  })
)
