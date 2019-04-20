CREATE SCHEMA IF NOT EXISTS sc_auth;

DROP TABLE IF EXISTS sc_auth.user CASCADE;
CREATE TABLE sc_auth.user (
  uid       char(20)      PRIMARY KEY,
  email     varchar(70)   UNIQUE NOT NULL,
  password  varchar(100)  NOT NULL
);

DROP TABLE IF EXISTS sc_auth.session CASCADE;
CREATE TABLE sc_auth.session (
  token     char(20)      PRIMARY KEY,
  uid       char(20)      NOT NULL REFERENCES sc_auth.user(uid),
  created   timestamp     NOT NULL,
  timeout   interval      NOT NULL
);

DROP TABLE IF EXISTS sc_auth.pending_signup CASCADE;
CREATE TABLE sc_auth.pending_signup (
  email     varchar(70)   UNIQUE NOT NULL,
  code      char(6)       UNIQUE NOT NULL,
  created   timestamp     NOT NULL
);

DROP USER IF EXISTS service_auth;
CREATE USER service_auth WITH ENCRYPTED PASSWORD <password>;

GRANT USAGE ON SCHEMA sc_auth TO service_auth;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA sc_auth TO service_auth;
