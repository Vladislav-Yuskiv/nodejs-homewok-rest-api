const express = require('express')
const router = express.Router()
const {
  validateContact,
  validateStatusContact,
  validateContactId,
} = require('./validation')
const {
  getContact,
  getContacts,
  addContacts,
  removeContacts,
  updateContact,
  updateStatusContact,
} = require('../../controllers/contacts')
const guard = require('../../helpers/guard')
const role = require('../../helpers/role')
const wrappError = require('../../helpers/errorHandler')
const { Subscription } = require('../../config/constants')

router.get('/', guard, wrappError(getContacts))

router.get(
  '/test',
  guard,
  role(Subscription.BUSINESS),
  wrappError((req, res, next) => {
    res.json({
      status: 'success',
      code: 200,
      data: { message: 'Only for business' },
    })
  })
)

router.get('/:contactId', guard, validateContactId, wrappError(getContact))

router.post('/', guard, validateContact, wrappError(addContacts))

router.delete(
  '/:contactId',
  guard,
  validateContactId,
  wrappError(removeContacts)
)

router.put(
  '/:contactId',
  guard,
  validateContactId,
  validateContact,
  wrappError(updateContact)
)

router.patch(
  '/:contactId/favorite',
  guard,
  validateContactId,
  validateStatusContact,
  wrappError(updateStatusContact)
)

module.exports = router
