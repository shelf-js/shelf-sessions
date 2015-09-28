import ShelfSessions from './index'
import crypto from 'crypto'

let secret = crypto.randomBytes(128)

let MyShelf = new ShelfSessions('test', {
  secret,
  algorithm: 'HS256',
  subject: 'yolo',
  issuer: 'me'
})

let MyModel = MyShelf.extend()

MyModel.getSession('me', 'user', {userAgent: 'this-some-special-header'}, () => {
  console.log(arguments)
})
