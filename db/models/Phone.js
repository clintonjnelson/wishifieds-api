'use strict';
module.exports = (sequelize, DataTypes) => {
  // Table name will match the definition name here
  var Phone = sequelize.define('Phone', {
    countrycode: DataTypes.STRING,
    areacode: DataTypes.STRING,
    prefix: DataTypes.STRING,
    line: DataTypes.STRING,
    createdAt:       { type: DataTypes.DATE, field: 'created_at' },
    updatedAt:       { type: DataTypes.DATE, field: 'updated_at' },
  }, { timestamps : true });
  Phone.associate = function(models) {
    // associations can be defined here
  };
  return Phone;
};
