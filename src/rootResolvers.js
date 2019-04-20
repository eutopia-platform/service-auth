import { graphql } from 'graphql'
import schema from './schema'
import { isValidEmail, sendWelcome } from './mail'

const knex = require('knex')({
  client: 'pg',
  version: '10.6',
  connection: {
    host: process.env.DATABASE_URL,
    database: 'postgres',
    user: 'service_auth',
    password: process.env.AUTH_DATABASE_PASSWORD
  }
})
const dbSchema = 'sc_auth'
const select = async (from, where) => await knex.select().withSchema(dbSchema).from(from).where(where)
const selectSingle = async (from, where) => await select(from, where) |> (_ => #.length ?#[0] : null) ()

export default {
  hello: () => 'auth says hello',

  isCodeValid: async ({email, code}) => {
    const user = await selectSingle('pending_signup', {email})
    if (user === null)
      throw Error('NOT_PENDING')
    return user.code === code
  },

  registerEmail: async ({email}) => {
    const [alreadyPending, alreadyUser] = (await Promise.all([select('pending_signup', {email}), select('user', {email})])).map(r => r.length > 0)
    if (alreadyUser)
      throw new Error('EMAIL_ALREADY_USED')
    if (alreadyPending) {
      await knex.withSchema(dbSchema).from('pending_signup').delete().where({email})
    }
    if (!isValidEmail(email))
      throw new Error('INVALID_EMAIL')

    const code = Math.floor(Math.random() * 1e6).toString().padStart(6, '0')

    await knex.withSchema(dbSchema).into('pending_signup').insert({
      email,
      code,
      created: knex.fn.now()
    })

    await sendWelcome(email, code)

    return code
  }
}
