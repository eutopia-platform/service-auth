const { mail } = require('./interService')
const gql = require('graphql-tag')

export const isValidEmail = email =>
  /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    .test(String(email).toLowerCase())

export const sendWelcome = async (recipient, code) => await mail.mutate({
  mutation: gql`mutation sendWelcome($sender: String, $receiver: String!, $subject: String!, $text: String!, $html: String) {
        sendEmail(sender: $sender, receiver: $receiver, subject: $subject, text: $text, html: $html)
      }`,
  variables: {
    sender: 'Productcube',
    receiver: recipient,
    subject: 'Welcome to Productcube 🚀',
    text: `Hello,

Thanks for signing up to Productcube!
Please enter the following code to continue:

${code}

See you soon!`
  }
})
