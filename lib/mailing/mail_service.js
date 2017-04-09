'use strict';

const mailer          = require('nodemailer');
const GOOGLE_EMAIL    = process.env.GOOGLE_MAIL_EMAIL;
const GOOGLE_PASSWORD = process.env.GOOGLE_MAIL_PASSWORD
const DEFAULT_EMAIL   = process.env.DEFAULT_EMAIL

module.exports = {
  sendPasswordResetEmail: passwordResetMailer(),
}


function passwordResetMailer() {
  // reusable transport (config) object
  var transporter = mailer.createTransport({
    service: 'gmail',
    auth: {
      user: GOOGLE_EMAIL,
      pass: GOOGLE_PASSWORD,
    }
  });

  return function sendPasswordResetMail(mailOptions, callback) {

    // Intercept emails to ensure none sent to inintended recipients while not in prod
    // Overwrite the "to" field if NOT in prod
    if(process.env.NODE_ENV != 'prod') {
      mailOptions.to = DEFAULT_EMAIL;

      // Make sure it worked!
      if(mailOptions.to != DEFAULT_EMAIL) {
        return callback(null, info)
      }
    }

    transporter.sendMail(mailOptions, function(error, info) {
      if(error) {
        console.log('Error sending mail is: ', error);
        return callback(error, null);
      }

      console.log('Message sent. Accepted result is: ', info.accepted, '. Response from SMTP is: ', info.response);
      callback(null, info);
    });
  }
}
