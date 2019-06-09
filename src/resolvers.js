import { ForbiddenError, UserInputError } from 'apollo-server-micro'

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
    login: async (root, { email, password }) => {},
    logout: async (root, { sessionToken }) => {}
  }
}
