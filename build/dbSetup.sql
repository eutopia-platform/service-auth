CREATE SCHEMA IF NOT EXISTS auth;

CREATE TYPE auth.role AS ENUM ('USER', 'ADMIN');

DROP TABLE IF EXISTS auth.user CASCADE;
CREATE TABLE auth.user (
  id              uuid        PRIMARY KEY,
  email           varchar     UNIQUE NOT NULL,
  password        varchar     NOT NULL,
  role            auth.role   DEFAULT 'USER',
  email_verified  BOOLEAN     DEFAULT FALSE
);

DROP TABLE IF EXISTS auth.session CASCADE;
CREATE TABLE auth.session (
  token     uuid        PRIMARY KEY,
  id        uuid        NOT NULL REFERENCES auth.user(id) ON DELETE CASCADE,
  created   timestamp   NOT NULL
);

DROP USER IF EXISTS service_auth;
CREATE USER service_auth WITH ENCRYPTED PASSWORD <password>;

GRANT USAGE ON SCHEMA auth TO service_auth;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA auth TO service_auth;
