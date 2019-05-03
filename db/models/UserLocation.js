'use strict';
module.exports = (sequelize, DataTypes) => {
  // Table name will match the definition name here
  var UserLocation = sequelize.define('UserLocation', {
    userId:      { DataTypes.INTEGER },
    locationId:  { DataTypes.INTEGER },
    description: { DataTypes.STRING }
  }, { timestamps : true });
  UserLocation.associate = function(models) {
    // associations can be defined here
  };
  return UserLocation;
};
