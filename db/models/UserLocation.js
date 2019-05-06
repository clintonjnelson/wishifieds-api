'use strict';
module.exports = (sequelize, DataTypes) => {
  // Table name will match the definition name here
  var UserLocation = sequelize.define('UserLocation', {
    userId:      { type: DataTypes.INTEGER, allowNull: false },
    locationId:  { type: DataTypes.INTEGER, allowNull: false },
    description: { type: DataTypes.STRING },  // TODO: Should we have a default of empty string?? That's what we want null to do.
    status:      { type: DataTypes.ENUM('ACTIVE', 'DELETED'), defaultValue: 'ACTIVE', allowNull: false },
    createdAt:   { type: DataTypes.DATE, field: 'created_at', allowNull: false },
    updatedAt:   { type: DataTypes.DATE, field: 'updated_at', allowNull: false },
  }, {
    timestamps : true,
    tableName: 'users_locations',
    freezeTableName: true
  });
  UserLocation.associate = function(models) {
    // associations can be defined here
  };
  return UserLocation;
};
