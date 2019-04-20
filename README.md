# Authentication Service

Use node version 8.11.3 (latest)

#### Queries:
- [hello](#hello)
- [isCodeValid](#is-code-valid)

#### Mutations:
- [registerEmail](#register-email)  

# Queries

### Hello

```graphql
hello: String
```

#### Return value

"auth says hello"

---

### Is Code Valid

```graphql
isCodeValid(email: String!, code: ID!): Boolean!
```
Checks if user signup with given email and code is pending.

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


# Mutations


### Register Email

```graphql
registerEmail(email: String!): ID!
```

Sends welcome email with signup code to email address.

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
