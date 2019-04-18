'use strict';
module.exports = (sequelize, DataTypes) => {
  var Location = sequelize.define('Location', {
    // Table name will match the definition name here
    name:        DataTypes.STRING,
    description: DataTypes.STRING,
    address1:    DataTypes.STRING,
    address2:    DataTypes.STRING,
    city:        DataTypes.STRING,
    state:       DataTypes.STRING,
    postalcode:  DataTypes.STRING,
    country:     DataTypes.STRING,
    createdAt:   { type: DataTypes.DATE, allowNull: false, field: 'created_at' },
    updatedAt:   { type: DataTypes.DATE, allowNull: false, field: 'updated_at' },
  }, { timestamps : true });
  Location.associate = function(models) {
    // associations can be defined here
  };
  return Location;
};
