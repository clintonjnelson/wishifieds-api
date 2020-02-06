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
  listingMessage: {
    buildHtmlEmailString:      realTimeMessageReceivedNotificationHtml,
    buildPlainTextEmailString: realTimeMessageReceivedNotificationText
  }
};

function buildEmailRedirectUrl(localRedirectBaseHref, basePageRoute, queryParams) {
  // Local can vary - http/https, etc; prod is fixed by env var
  var redirectBaseHref = (process.env.NODE_ENV === 'production' ? process.env.PASSWORD_RESET_BASE_HREF : localRedirectBaseHref)
  var fullPageRoute    = basePageRoute + queryParams;

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

// I think the prior issue was that the emails were ONLY sending plain text thru if it was avail,
//  instead of defaulting to HTML with fallback of plain text.

function buildConfirmationPlainTextEmailString(mailData) {
  return "Yipperoo."
}

// This really should be a scheduled job that runs every night & sends out one email that builds
// The whole list of messages on listings that were received for the day.
// Probably sending at like 7pm PT (10pm ET)
// Use node cron; grab everything since the last time; format & send them
// mailDataFields: { host: "", username: "", listings: [{id: "", msgCount: "", ...}] }
function buildListingMessagesHtmlEmailString(mailDataFields) {
  const breaks = '<br/><br/>';
  const messagesUrl = mailDataFields.host + '/' + mailDataFields.username + '?tab=messages';
  const messagesLinkHtml = '<a href=\"' + messagesUrl + '\">here</a>'

  const heading = '<h1>You\'ve received one or more new messages about listing(s)!</h1> <br/>';
  const messagesLinkSection = '<h3>See all of your new messages ' + messagesLinkHtml + '</h3>';
  // TODO: IF want to get this granular, probably provide little blurb of message as well? At least count per listing.
  // const listingsHtml = mailDataFields.listings.map(function(listingId) {
  //   return '' +
  //     '</br>' +
  //     buildListingLinkHtml(
  //       mailDataFields.host,
  //       mailDataFields.username,
  //       listingId
  //     ) +
  //     '</br>';
  // });
  const salutation = '<br/><br/>' +
    '<p>Best Wishes,</p>' +
    '<p>The Syynpost Team</p>';

  // Return the full email html
  return heading + messagesLinkSection + salutation;
}

function realTimeMessageReceivedNotificationHtml(listingTitle, listingLink, senderUsername, senderMessage) {
  const linkHtml = '<a href=\"' + listingLink + '\">' + listingTitle + '</a>'
  const heading = '<h3>New Message About Your Wish: ' + linkHtml + '!</h3> <br/>';

  const messageContent = '<h4>' + senderUsername + ' said: \"' + senderMessage + '\"</h4>';

  // Return the full email html
  return heading + messageContent;
}

function realTimeMessageReceivedNotificationText(listingTitle, listingLink, senderUsername, senderMessage) {
  const linkText = listingTitle + ': ' + listingLink;
  const heading = 'New Message About Your Wish: ' + linkText + '\n';  // INCLUDE NEWLINE!

  const messageContent = senderUsername + ' says: \"' + senderMessage + '\".';

  return heading + messageContent;
}

function buildListingLinkHtml(host, username, listingId, title) {
  const url = host + '/' + username + '/' + listingId;
  return '<h3> <a href=\"' + url + '\"> Listing: ' + title + ' </a></h3>';
}

