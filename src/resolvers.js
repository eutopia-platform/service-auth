import { ForbiddenError, UserInputError } from 'apollo-server-micro'
import uuid from 'uuid/v4'
import bcrypt from 'bcrypt'

const knex = require('knex')({
  client: 'pg',
  version: '10.6',
  connection: {
    host: process.env.DATABASE_URL,
    database: 'postgres',
    user: 'service_auth',
    password: process.env.AUTH_DATABASE_PASSWORD
  },
  searchPath: 'auth'
})

const isValidUUID = uuid =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    uuid
  )

const isValidEmail = email =>
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
    email
  )

export default {
  Query: {
    hello: () => 'authentication service says hello',
    user: async (root, { sessionToken }, { isService }) => {
      if (!isService) throw new ForbiddenError('UNAUTHORIZED')
      if (!isValidUUID(sessionToken)) throw new UserInputError('INVALID_UUID')
      const session = (await knex('session')
        .select('id')
        .where({ token: sessionToken }))[0]
      if (!session) throw new UserInputError('NOT_LOGGED_IN')
      return (await knex('user').where({ id: session.id }))[0]
    }
  },

  Mutation: {
    login: async (root, { email, password }) => {
      const user = (await knex('user').where({ email }))[0]
      const correct = user
        ? await bcrypt.compare(password, user.password)
        : false
      if (!correct) throw new UserInputError('INVALID')

      const token = uuid()
      await knex('session').insert({
        token,
        id: user.id,
        created: knex.fn.now()
      })
      return token
    },

    logout: async (root, { sessionToken }) => {
      await knex('session')
        .where({ token: sessionToken })
        .del()
    },

    signup: async (root, { email, password }, context) => {
      if ((await knex('user').where({ email })).length)
        throw new UserInputError('ALREADY_EXIST')
      if (!isValidEmail(email)) throw new UserInputError('INVALID_EMAIL')
      if (password.length < 8) throw new UserInputError('INVALID_PASSWORD')

      await knex('user').insert({
        id: uuid(),
        email,
        password: bcrypt.hashSync(password, 10)
      })
      return await context.resolvers.Mutation.login(null, { email, password })
    }
  }
}
