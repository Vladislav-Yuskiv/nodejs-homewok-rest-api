const request = require('supertest')
const jwt = require('jsonwebtoken')
require('dotenv').config()
const app = require('../app')
const db = require('../config/db')
const Contact = require('../model/contact')
const User = require('../model/users')
const { NewUserForRouterContact, NewContact } = require('./data/data')

describe('test route contacts', () => {
  let user, token

  beforeAll(async () => {
    await db
    await User.deleteOne({ email: NewUserForRouterContact.email }) //удаляем если он уже есть
    user = await User.create(NewUserForRouterContact) //создаем
    const SECRET_KEY = process.env.JVT_SECRET_KEY //вытаскиваем ключ
    const issueToken = (payload, secret) => jwt.sign(payload, secret) //создаем функцию для получ токена
    token = issueToken({ id: user._id }, SECRET_KEY) //получаем токен
    await User.updateOne({ _id: user._id }, { token }) //скармливаем токен
  })

  //отключение от базы
  afterAll(async () => {
    const mongo = await db
    await User.deleteOne({ email: NewUserForRouterContact.email })
    await mongo.disconnect()
  })

  beforeEach(async () => {
    await Contact.deleteMany({})
  })

  describe('GET request', () => {
    it('should return status 200 get all contacts', async () => {
      const response = await request(app)
        .get('/api/contacts')
        .set('Authorization', `Bearer ${token}`)
      expect(response.status).toEqual(200)
      expect(response.body).toBeDefined()
      expect(response.body.data.contact).toBeInstanceOf(Array)
    })

    it('should return status 200 get by ID contacts', async () => {
      const contact = await Contact.create({ ...NewContact, owner: user._id })
      const response = await request(app)
        .get(`/api/contacts/${contact._id}`)
        .set('Authorization', `Bearer ${token}`)
      expect(response.status).toEqual(200)
      expect(response.body).toBeDefined()
      expect(response.body.data.contact).toBeDefined()
      expect(response.body.data.contact).toHaveProperty('id')
      expect(response.body.data.contact).toHaveProperty('name')
      expect(response.body.data.contact).toHaveProperty('email')
      expect(response.body.data.contact).toHaveProperty('phone')
    })

    it('should return status 404 get if contacts not found', async () => {
      const contact = await Contact.create({ ...NewContact, owner: user._id })
      const response = await request(app)
        .get(`/api/contacts/${user._id}`)
        .set('Authorization', `Bearer ${token}`)
      expect(response.status).toEqual(404)
      expect(response.body).toBeDefined()
      expect(response.body).toHaveProperty('status')
      expect(response.body).toHaveProperty('code')
    })
  })

  describe('POST request', () => {
    it('should return status 201 creat contacts', async () => {
      const response = await request(app)
        .post('/api/contacts')
        .set('Authorization', `Bearer ${token}`)
        .send(NewContact)
        .set('Accept', 'application/json')
      expect(response.status).toEqual(201)
      expect(response.body).toBeDefined()
    })
  })
})
