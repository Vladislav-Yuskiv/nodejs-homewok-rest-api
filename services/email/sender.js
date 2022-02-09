const sgMail = require('@sendgrid/mail')
require('dotenv').config()

class CreateSendlerSendGrid {
  async send(msg) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY)
    return await sgMail.send({ ...msg, from: 'nedilko.svitlanka@gmail.com' })
  }
}

module.exports = { CreateSendlerSendGrid }
