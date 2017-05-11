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

function buildEmailRedirectUrl(localRedirectBaseHref, basePageRoute, queryParams) {
  // Local can vary - http/https, etc; prod is fixed by env var
  var redirectBaseHref = (process.env.NODE_ENV === 'production' ? process.env.PASSWORD_RESET_BASE_HREF : localRedirectBaseHref)
  var fullPageRoute    = basePageRoute + queryParams

  return redirectBaseHref + fullPageRoute;
}

// MailData requires
function buildPasswordResetHtmlEmailString(mailData) {
  var localRedirectBaseHref = mailData.host + '/';
  var emailQuery            = 'email='      + mailData.email;
  var resetTokenQuery       = 'resettoken=' + mailData.resetToken;
  var fullQueryParams       = emailQuery + '&' + resetTokenQuery;
  var pageRoute             = 'requestpasswordchange/change?'

  var fullRedirect = buildEmailRedirectUrl(localRedirectBaseHref, pageRoute, fullQueryParams);
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
  var localRedirectBaseHref  = mailData.host + '/';
  var emailQuery             = 'email='             + mailData.email;
  var confirmationTokenQuery = 'confirmationtoken=' + mailData.confirmationToken;
  var fullQueryParams        = emailQuery + '&' + confirmationTokenQuery;
  var pageRoute              = 'user/confirmation?'
  var fullConfirmRedirect = buildEmailRedirectUrl(localRedirectBaseHref, pageRoute, fullQueryParams);

  var htmlString = '' +
    '<h1>Syynpost - Confirm Your Email</h1>' +

    '<br/>' +
    '<p>' +
      'Welcome to Syynpost! Please confirm your email to finalize the creation of your account ' +
      'and provide full access.' +
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
  return "Yipperoo."
}

