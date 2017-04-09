'use strict';

module.exports = {
  buildHtmlEmail: buildHtmlEmail,
  buildPlainTextEmail: buildPlainTextEmail,
};

function buildHtmlEmail(mailData) {
  var fullRedirect;
  var redirectBase    = 'http://127.0.0.1:3000/requestpasswordchange/change?';
  var emailQuery      = 'email='      + mailData.email;
  var resetTokenQuery = 'resettoken=' + mailData.resetToken;
  var fullQueryParams = emailQuery + '&' + resetTokenQuery

  if(process.env.NODE_ENV != 'prod') {
    fullRedirect = redirectBase + fullQueryParams;
  }
  else {
    fullRedirect = process.env.PASSWORD_RESET_BASE_HREF + fullQueryParams;
  }

  var htmlString = '' +
    '<h1>Change Your Syynpost Password</h1>' +

    '<br/>' +
    '<p>' +
      'This link will expire in 2 hours. ' +
      'If you decide not to change your password, simply ignore this email.' +
    '</p>' +

    '</br>' +
    '<a href=\"' + fullRedirect + '\">' + 'Click here to reset' + '</a>'+
    '<br/>' +

    '<br/>' +
    '<br/>' +
    '<p>Thanks,</p>' +
    '<p>The Syynpost Team</p>';

  return htmlString;
}

function buildPlainTextEmail(emailData) {
  return 'Yipee.';
}
