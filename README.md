# Authentication Service

## Installation & Usage Instruction

To install the dependencies run `npm install`

Build the service with `npm run build` and start it in development mode with `npm run start:dev`

Running the `start:dev` script expects a file named `secrete_setup.sh` to be present in the root directory of the repository. The script should export all environment variables that the service requires to run, i.e. `export VARIABLE=VALUE`. A list of the required environment variables can be found in the [`now.json`](now.json).

The service accepts `GET` and `POST` requests for GraphQL queries.

The current version on master gets automatically deployed to https://auth.api.productcube.io

## Schema

#### Queries:
- [Hello](#hello)
- [Is code valid](#is-code-valid)
- [User](#user)

#### Mutations:
- [Register Email](#register-email)
- [Set password](#set-password)
- [Login](#login)
- [Logout](#logout)

# Queries

### Hello

```graphql
hello: String
```

#### Return value

"auth says hello"

---

### Is Code Valid

Checks if user signup with given email and code is pending.

```graphql
isCodeValid(email: String!, code: ID!): Boolean!
```

#### Arguments

Argument | Type | Description
-- | -- | --
email | String! |
code | ID! |

#### Return Value

True if signup code matches the email in pending signups, false otherwise.

#### Error messages

Message | Description
-- | --
NOT_PENDING | either email address wasn't used to request signup or signup is already completed

---

### User

Returns user information to session token. Authorization required.

```graphql
user(token: ID!): User!
```

#### Arguments

Argument | Type | Description
-- | -- | --
token | ID! | session token

#### Return Value

```graphql
type User {
  isLoggedIn: Boolean
  uid: ID
  email: String
}
```

#### Error messages

Message | Description
-- | --
UNAUTHORIZED | invalid or missing auth HTTP header


# Mutations


### Register Email

Sends welcome email with signup code to email address.

```graphql
registerEmail(email: String!): ID!
```

#### Arguments

Argument | Type | Description
-- | -- | --
email | String! | email of the user signing up

#### Return Value

A numerical six digit code

#### Error messages

Message | Description
-- | --
EMAIL_ALREADY_USED | a user with the specified email address already exists
INVALID_EMAIL | the email argument is not in valid email format

---

### Set Password

Moves user from pending signup to regular user. Password is stored hashed & salted.

```graphql
setPassword(email: String!, code: ID!, password: String!): Null
```

#### Arguments

Argument | Type | Description
-- | -- | --
email | String! | email used in signup
code | ID! | pin code received via email
password | String! | new password (length must be > 8)

#### Error messages

Message | Description
-- | --
INVALID_USER | no signup with given email & code pending
INVALID_PASSWORD | password length is shorther than 8

---

### Login

```graphql
login(email: String!, password: String!): ID
```

#### Arguments

Argument | Type | Description
-- | -- | --
email | String! |
password | String! |

#### Return Value

The session token, if successful

#### Error Messages

Message | Description
-- | --
INCORRECT | email and/or password is incorrect

---

### Logout

```graphql
login(token: ID!): Null
```

#### Arguments

Argument | Type | Description
-- | -- | --
token | ID! | session token
