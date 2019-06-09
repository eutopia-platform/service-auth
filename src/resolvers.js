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
  searchPath: 'sc_auth'
})

export default {
  Query: {
    hello: () => 'authentication service says hello',
    user: async (root, { token: sessionToken }, { isService }) => {
      if (!isService) throw new ForbiddenError('UNAUTHORIZED')
      const session = (await knex('session')
        .select('uid')
        .where({ token: sessionToken }))[0]
      if (!session) throw new UserInputError('NOT_LOGGED_IN')
      return (await knex('user').where({ uid: session.uid }))[0]
    }
  }

  // Mutation: {}
}
