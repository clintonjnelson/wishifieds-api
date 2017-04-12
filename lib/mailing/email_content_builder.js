'use strict';

module.exports = {
  passwordReset: {
    buildHtmlEmailString:      buildPasswordResetHtmlEmailString,
    buildPlainTextEmailString: buildPasswordResetPlainTextEmailString,
  },
  confirmation: {
    buildHtmlEmailString:      buildConfirmationHtmlEmailString,
    buildPlainTextEmailString: buildConfirmationPlainTextEmailString,
  },
};

// MailData requires
function buildPasswordResetHtmlEmailString(mailData) {
  var fullRedirect;
  var redirectBase    = 'http://127.0.0.1:3000/requestpasswordchange/change?';
  var emailQuery      = 'email='      + mailData.email;
  var resetTokenQuery = 'resettoken=' + mailData.resetToken;
  var fullQueryParams = emailQuery + '&' + resetTokenQuery;

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

function buildPasswordResetPlainTextEmailString(mailData) {
  return 'Yipee.';
}

function buildConfirmationHtmlEmailString(mailData) {
  var fullConfirmRedirect;
  var redirectBase = 'http://127.0.0.1:3000/user/confirmation?';
  var emailQuery             = 'email='             + mailData.email;
  var confirmationTokenQuery = 'confirmationtoken=' + mailData.confirmationToken;
  var fullQueryParams = emailQuery + '&' + confirmationTokenQuery;

  if(process.env.NODE_ENV != 'prod') {
    fullConfirmRedirect = redirectBase + fullQueryParams;
  }
  else {
    fullConfirmRedirect = process.env.PASSWORD_RESET_BASE_HREF + fullQueryParams;
  }

  var htmlString = '' +
    '<h1>Confirm Your Email</h1>' +

    '<br/>' +
    '<p>' +
      'Please confirm it was you that created this account. ' +
      'If the account is not confirmed within 7 days, it will be suspended until confirmed.' +
    '</p>' +

    '</br>' +
    '<a href=\"' + fullConfirmRedirect + '\">' + 'Click here to confirm' + '</a>'+
    '<br/>' +

    '<br/>' +
    '<br/>' +
    '<p>Thanks,</p>' +
    '<p>The Syynpost Team</p>';

  return htmlString;
}

function buildConfirmationPlainTextEmailString(mailData) {
  return "Yipperoo"
}
