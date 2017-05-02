'use strict';

var GenericSign   = require('../../models/GenericSign.js');
var loadBaseAttrs = require('./load_base_sign_attrs.js' );

module.exports = function(signBuilder) {

  function buildGeneric(signData) {
    var signProps = {
      bgColor:       signData.bgColor,
      // customIcon:    signData.customIcon,
      icon:          signData.icon,
      signName:      signData.signName,
      signType:      signData.signType,
    };

    // load data into base attrs; modifies current new sign
    loadBaseAttrs(signProps, signData);

    // load data into Generic attrs
    var newGenericSign = new GenericSign(signProps);


    console.log("DONE ADDING BASE DATA SIGN. GENERIC SIGN LOOKS LIKE: ", newGenericSign);
    return newGenericSign;
  }

  signBuilder.generic = buildGeneric;  // load function into signBuilder
};
