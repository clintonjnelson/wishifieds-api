'use strict';
var _ = require('lodash');

module.exports = function(app) {
  app.controller('signsController', ['$scope', 'RESTResource', '$http', '$window', function($scope, RESTResource, $http, $window) {
    // connect with Signs api
    var signHttp = RESTResource('signs');


    //----------------------------- SIGN LISTITEMS -----------------------------


    // general icon settings for directive
    $scope.icons = {
      color: '#808080',
      size:  '120',
    };


    $scope.getSigns = function() {
      // TODO: TAILOR THIS TO GET THE SIGNS OF USER PASSED IN
          // THIS WILL ENABLE SAME DIRECTIVE TO VIEW OTHER USER's SIGNS
      signHttp.getAll({_id: 'placeholderIdName'}, function(err, data) {
        if(err) {return console.log("ERROR GETTING USERS: ", err);}
        console.log("SIGNS RETURNED ARE: ", data.signs);
        $scope.signs = data.signs;
      });
    };

    $scope.updateSign = function(sign) {
      console.log("UPDATING SIGN: ", sign);
      sign.isEditing      = false;
      sign.temp.isEditing = false;
      signHttp.update({sign: sign}, function(err, data) {
        if(err) {
          // TODO: Flash error to user
          console.log('Could not update sign.');
          $scope.signs.splice($scope.signs.indexOf(sign), 1, sign.temp); // reset sign info
          delete sign.temp;                                              // delete temp
          return console.log(err);
        }

        // TODO: Flash success to user
        delete sign.temp;                                 // delete the temp state
        console.log('Sign update successful.');
      });
    };

    // Edit/Cancel Editing Sign
    $scope.toggleEditing = function(sign) {
      if(sign.isEditing) {
        var ind             = $scope.signs.indexOf(sign);
        sign.temp.isEditing = false;            // temp will replace current
        $scope.signs[ind]   = sign.temp;        // top level: restore former state
        sign = sign.temp;                       // reset local sign
      } else {
        sign.isEditing = true;               // editing mode
        sign.temp      = _.cloneDeep(sign);  // copy current state
      }
    };

    // $scope.getFormUrl = function(sign) {
    //   return 'templates/directives/dynsignforms/custom_sign_form.html';
    // }


    //------------------------------ NEW SIGN FORM -----------------------------
    // TODO: THIS DATA SHOULD NOT BE STATIC, BUT SHOULD BE SENT BY SERVER
    // TODO: THIS DATA SHOULD BE MANAGED BY AN ADMIN ACCOUNT
    $scope.types = [
      { type: 'custom',         icon: 'label'          , disabled: false,  link: ''                   },
      { type: 'facebook',       icon: 'facebook-box'   , disabled: false,  link: '/auto/facebook'     },
      { type: 'github',         icon: 'github-box'     , disabled: false,  link: '/auto/github'       },
      { type: 'twitter',        icon: 'twitter'        , disabled: false,  link: '/auto/twitter'      },
      { type: 'google',         icon: 'google-plus-box', disabled: true,   link: '/auto/google'       },
      { type: 'instagram',      icon: 'instagram'      , disabled: true,   link: '/auto/instagram'    },
      { type: 'linkedin',       icon: 'linkedin-box'   , disabled: true,   link: '/auto/linkedin'     },
      { type: 'wordpress',      icon: 'wordpress'      , disabled: true,   link: '/auto/wordpress'    },
      { type: 'tumblr',         icon: 'tumblr'         , disabled: true,   link: '/auto/tumblr'       },
      { type: 'stackoverflow',  icon: 'stackoverflow'  , disabled: true,   link: '/auto/stackoverflow'},
      { type: 'pintrest',       icon: 'pintrest-box'   , disabled: true,   link: '/auto/pintrest'     },
    ];

    $scope.newSign = {isEditing: false};

    // defaults
    $scope.defaults = {
      color: '#5a5a5a',
      size: '40',
    };

    // watched by all icons for CSS class -  passing their type & comparing active
    $scope.activeColor = function(type) {    // each passes its type
      var activeType = $scope.newSign.signType;  // check current type
      return (type === activeType ? (activeType + "-color" ) : 'default-form-icon');
    };

    $scope.hrefLink = function(type) {
      if(type === 'custom') { return '';                  }
      if(type !== 'custom') { return ('/auto/' + type); }
    }

    $scope.createAutoSign = function(type) {
      var signType = type.type;
      if(type.type === 'custom') {
        return $scope.newSign.signType = type.type; // trigger custom form
      }

      // Else redirect browser
      var autoSignUrl = '/auto/' + type.type;
      $window.location.href = autoSignUrl;
    };

    $scope.createSign = function(sign) {
      console.log("DATA TO SEND IS: ", sign);
      console.log('HIT ACTION, ABOUT TO SEND...');
      signHttp.create({sign: sign}, function(err, data) {
        if (err) {
          // TODO: FLASH ERROR MESSAGE TO USER
          return console.log('ERROR IN CREATING: ', err);
        }

        console.log("SUCCESS! Data here: ", data);

        // add sign to end
        $scope.getSigns();
        $scope.newSign.isEditing = false;
      });
    };
  }]);
};
