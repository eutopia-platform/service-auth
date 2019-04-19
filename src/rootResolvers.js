import { graphql } from 'graphql'
import schema from './schema'
const axios = require('axios')

const knex = require('knex')({
  client: 'pg',
  version: '10.6',
  connection: {
    host: process.env.DATABASE_URL,
    database: process.env.DATABASE_NAME,
    user: process.env.AUTH_DATABASE_USER,
    password: process.env.AUTH_DATABASE_PASSWORD
  }
})

export default {
  hello: () => 'auth says hello'
}
