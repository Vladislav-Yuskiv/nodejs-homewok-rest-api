const Contact = require('../model/contact')

const listContacts = async (userId, query) => {
  const { favorite = null, limit = 20, offset = 0 } = query
  const searchOptions = { owner: userId }
  if (favorite !== null) {
    searchOptions.favorite = favorite
  }
  const result = await Contact.paginate(searchOptions, {
    limit,
    offset,
    populate: {
      path: 'owner',
      select: ' email subscription ',
    },
  })
  const { docs: contact } = result
  delete result.docs
  return { ...result, contact }
}

const getContactById = async (contactId, userId) => {
  const result = await Contact.findOne({
    _id: contactId,
    owner: userId,
  }).populate({ path: 'owner', select: ' email subscription ' })
  return result
}

const removeContact = async (contactId, userId) => {
  const result = await Contact.findOneAndRemove({
    _id: contactId,
    owner: userId,
  })
  return result
}

const addContact = async (body) => {
  const result = await Contact.create(body)
  return result
}

const updateContact = async (contactId, body, userId) => {
  const result = await Contact.findOneAndUpdate(
    { _id: contactId, owner: userId },
    { ...body },
    { new: true }
  )
  return result
}

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
}
