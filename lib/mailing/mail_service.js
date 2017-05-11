'use strict';

const mailer          = require('nodemailer');
const GOOGLE_EMAIL    = process.env.GOOGLE_MAIL_EMAIL;
const GOOGLE_PASSWORD = process.env.GOOGLE_MAIL_PASSWORD
const DEFAULT_EMAIL   = process.env.DEFAULT_EMAIL

// reusable transport (config) object
var transporter = mailer.createTransport({
  service: 'gmail',
  auth: {
    user: GOOGLE_EMAIL,
    pass: GOOGLE_PASSWORD,
  }
});


// Returns object with sendEmail method and ContentBuilder for email content
module.exports = {
  sendEmail: buildSendEmail(),
};


function buildSendEmail() {
  return function sendEmail(mailOptions, callback) {

    // Overwrite the "to" field if NOT in prod
    if(process.env.NODE_ENV !== 'production') {
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
