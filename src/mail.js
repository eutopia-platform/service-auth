const axios = require('axios')

export const isValidEmail = email =>
  /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    .test(String(email).toLowerCase())

export const sendWelcome = async (recipient, code) => await axios.post(process.env.MAIL_SERVICE_URL, {
  query: `mutation {
        sendMail(
          recipient: "${recipient}",
          subject: "Thanks for signing up for Productcube!",
          body: "Hello,\\n\\nThanks for signing up to Productcube!\\nPlease paste this code to continue: ${code}\\n\\nSee you soon!",
          password: "${process.env.MAIL_SERVICE_PASSWORD}"
        ) {
          exitcode
          msg
        }
      }`
})
