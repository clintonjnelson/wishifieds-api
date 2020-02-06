'use strict';

const mailer          = require('nodemailer');
const GOOGLE_EMAIL    = process.env.GOOGLE_MAIL_EMAIL;
const GOOGLE_PASSWORD = process.env.GOOGLE_MAIL_PASSWORD
const DEFAULT_EMAIL   = process.env.DEFAULT_EMAIL

// reusable transport (config) object
var transporter = mailer.createTransport({
  service: 'Mailgun',
  auth: {
    user: process.env.MAILGUN_USER,
    pass: process.env.MAILGUN_SECRET,
  }
});


// Returns object with sendEmail method and ContentBuilder for email content
module.exports = {
  sendEmail: buildSendEmail(),
};


// Service for building & sending email
// Note: mailOptions looks like this:
//  var mailOptions = {
//    from:    'Sender Name <sender@example.com>',
//    to:      'someemail@example.com',   // Email provided by user
//    subject: 'This Is The Email Subject',
//    html:    <if you need htmp template in the email, insert it here; can use email_content_builder>,
//    text:    <for plain text email content, insert that version here; can use email_content_builder>,
//  };
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
