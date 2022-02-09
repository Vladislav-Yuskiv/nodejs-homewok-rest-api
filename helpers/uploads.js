const multer = require('multer')
require('dotenv').config()
const { CustomError } = require('./custom_error')

const UPLOAD_DIR = process.env.UPLOAD_DIR

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOAD_DIR)
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
    cb(null, `${uniqueSuffix}_${file.originalname}`)
  },
})

const upload = multer({
  storage: storage,
  limits: { fieldSize: 2000000 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.includes('image')) {
      return cb(null, true)
    }

    cb(new CustomError(400, 'Wrong format for avatar'))
  },
})

module.exports = upload
