const request = require('supertest')
const fs = require('fs/promises')
require('dotenv').config()
const app = require('../app')
const db = require('../config/db')
const User = require('../model/users')
const { NewUserForRouterUser } = require('./data/data')

// jest.mock('cloudinary')

describe('test route users', () => {
  let token

  beforeAll(async () => {
    await db
    await User.deleteOne({ email: NewUserForRouterUser.email }) //удаляем если он уже есть
  })

  //отключение от базы
  afterAll(async () => {
    const mongo = await db
    await User.deleteOne({ email: NewUserForRouterUser.email })
    await mongo.disconnect()
  })

  it('register user return status 201', async () => {
    const response = await request(app)
      .post('/api/users/signup')
      .send(NewUserForRouterUser)
      .set('Accept', 'application/json')

    expect(response.status).toEqual(201)
    expect(response.body).toBeDefined()
  })

  it('User exist return status 409', async () => {
    const response = await request(app)
      .post('/api/users/signup')
      .send(NewUserForRouterUser)
      .set('Accept', 'application/json')

    expect(response.status).toEqual(409)
    expect(response.body).toBeDefined()
  })

  it('Login user', async () => {
    const response = await request(app)
      .post('/api/users/login')
      .send(NewUserForRouterUser)
      .set('Accept', 'application/json')
    expect(response.status).toEqual(200)
    expect(response.body).toBeDefined()
    token = response.body.data.token
  })

  it('Upload avatar for user', async () => {
    const buffer = await fs.readFile('./test/data/testimage.png')
    const response = await request(app)
      .patch('/api/users/avatars')
      .set('Authorization', `Bearer ${token}`)
      .attach('avatar', buffer, 'testimage.png')
    expect(response.status).toEqual(200)
    expect(response.body).toBeDefined()
  })
})
