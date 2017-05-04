'use strict';

var LinkedinSign = require('../../models/LinkedinSign.js');

module.exports = function(signBuilder) {

  function buildLinkedinSign(lnData) {
    // base attrs:   customBgColor, description, knownAs, linkUrl, published, userId
    // custom attrs: bgColor, connections, profileId, picUrl, icon, signType
    console.log("LINKEDIN DATA RECEIVED IS: ", lnData);
    var signProps = {
      // ----------------- BASE -----------------------
      description:    (getDesc(lnData)    || lnData.description),                // optional for updates?
      knownAs:        (lnData.displayName || lnData.knownAs),      // TODO: VERIFY || is NOT BACKWARDS!
      linkUrl:        (getLinkUrl(lnData) || lnData.linkUrl),      // TODO: VERIFY || is NOT BACKWARDS!
      location:       getLoc(lnData),           // area
      // ----------------- CUSTOM ---------------------
      connections:    getConnections(lnData),
      profileId:      lnData.id,
      picUrl:         getPicUrl(lnData),
    };

    var newLinkedinSign = new LinkedinSign(signProps);

    return newLinkedinSign;
  }

  function getDesc(ln) {
    try { return ln._json.headline; }
    catch (e) {
      console.log('Data access error for Linkedin desc: ', e);
      return '';
    }
  }

  function getLinkUrl(ln) {
    try { return ln._json.publicProfileUrl; }
    catch (e) {
      console.log('Data access error for Linkedin linkUrl: ', e);
      return '';
    }
  }

  function getLoc(ln) {
    try { return ln._json.location.name; }
    catch (e) {
      console.log('Data access error for Linkedin location: ', e);
      return '';
    }
  }

  function getConnections(ln) {
    try { return ln._json.numConnections; }
    catch (e) {
      console.log('Data access error for Linkedin connections: ', e);
      return '';
    }
  }

  function getPicUrl(ln) {
    try { return ln._json.pictureUrl; }
    catch (e) {
      console.log('Data access error for Linkedin picUrl: ', e);
      return '';
    }
  }

  signBuilder.linkedin = buildLinkedinSign;
};


//---------------------- Sample of Data in Linkedin PROFILE --------------------
/*
{ provider: 'linkedin',
  id: '_roGa3fds9',
  displayName: 'Clint Nelson',
  name: { familyName: 'Nelson, PE', givenName: 'Clint' },
  emails: [ { value: undefined } ],
  photos: [ 'https://media.licdn.com/mpr/mprx/0_m1fIsdOh28KLjjkjT1cI-oNhecS9YDXl2AcIpjl3DQ2BRjzy31BItd03oK3BR2ZADczwtfyT3KAcZdNj38octjgSkKAnZdll38oHMpe87lXVt0EDSAyQJeQlXLIQAd68eiOGrTM…
  _raw: '{\n  "apiStandardProfileRequest": {\n    "headers": {\n      "_total": 1,\n      "values": [{\n        "name": "x-li-auth-token",\n        "value": "name:54E"\n      }]\n    }…
  _json:
   { apiStandardProfileRequest:
      { headers: [Object],
        url: 'https://api.linkedin.com/v1/people/_roGa3fds9' },
     distance: 0,
     firstName: 'Clint',
     formattedName: 'Clint Nelson, PE',
     headline: 'Software Engineer, Business Developer, Efficiency Advocate',
     id: '_roGa3fds9',
     industry: 'Computer Software',
     lastName: 'Nelson, PE',
     location: { country: [Object], name: 'Greater Seattle Area' },
     numConnections: 229,
     numConnectionsCapped: false,
     pictureUrl: 'https://media.licdn.com/mpr/mprx/0_m1fIsdOh28KLjjkjT1cI-oNhecS9YDXl2AcIpjl3DQ2BRjzy31BItd03oK3BR2ZADczwtfyT3KAcZdNj38octjgSkKAnZdll38oHMpe87lXVt0EDSAQJeQlXLIQAd68eimF…
     positions: { _total: 1, values: [Object] },
     publicProfileUrl: 'https://www.linkedin.com/in/clintonjnelson',
     relationToViewer: { distance: 0 },
     siteStandardProfileRequest: { url: 'https://www.linkedin.com/profile/view?id=298084646&authType=name&authToken=54EU&trk=api*a4592171*s4908891*' },
     summary: 'I\'m a software developer with experience in engineering, management, and business development. \nI love efficiency, readable code, and helping grow great companies. \n\n…
*/
