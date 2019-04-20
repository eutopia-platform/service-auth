# Authentication Service

Use node version 8.11.3 (latest)

## Queries

- [Hello](#hello)

### Hello

```graphql
hello: String
```

#### Return value

"auth says hello"

## Mutations

- [Register Email](#register-email)  

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
