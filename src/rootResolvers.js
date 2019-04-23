import { isValidEmail, sendWelcome } from './mail'

const bcrypt = require('bcrypt')

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

  user: async ({token}, context) => {
    const auth = context.headers.auth
    if (!auth || auth !== process.env.AUTH_PASSWORD)
      throw Error('UNAUTHORIZED')
    
    const session = await selectSingle('session', {token})
    if (!session)
      return { isLoggedIn: false }

    const user = await selectSingle('user', {uid: session.uid})
    
    return {
      isLoggedIn: true,
      uid: user.uid,
      email: user.email
    }
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
  },

  setPassword: async ({email, code, password}) => {
    const user = await selectSingle('pending_signup', {email, code})
    if (user === null)
      throw Error('INVALID_USER')
    if (password.length < 8)
      throw Error('INVALID_PASSWORD')
    
      await knex.withSchema(dbSchema).from('pending_signup').delete().where({email, code})
    
    let uid
    do {
      uid = Array(20).fill().map(_ => String.fromCharCode(Math.floor(Math.random() * 26) + 97)).join('')
    } while((await selectSingle('user', {uid})) !== null)

    const hash = bcrypt.hashSync(password, 10)
    
    await knex.withSchema(dbSchema).into('user').insert({uid, email, password: hash})
  },

  login: async ({email, password}) => {
    const user = await selectSingle('user', {email})
    const correct = user ? await bcrypt.compare(password, user.password) : false
    if (!correct)
      throw new Error('INCORRECT')

    let sessionToken
    do {
      sessionToken = Array(20).fill().map(_ => String.fromCharCode(Math.floor(Math.random() * 26) + 97)).join('')
    } while ((await selectSingle('session', { token: sessionToken })) !== null)

    await knex.withSchema(dbSchema).into('session').insert({
      token: sessionToken,
      uid: user.uid,
      created: knex.fn.now(),
      timeout: 'P100D'
    })
    
    return sessionToken
  },

  logout: async ({token}) => {
    await knex.withSchema(dbSchema).from('session').delete().where({token})
  }
}
