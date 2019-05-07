'use strict';
module.exports = (sequelize, DataTypes) => {
  // Table name will match the definition name here
  var UserLocation = sequelize.define('UserLocation', {
    userId:      { type: DataTypes.INTEGER, allowNull: false, field: 'user_id' },
    locationId:  { type: DataTypes.INTEGER, allowNull: false, field: 'location_id' },
    description: { type: DataTypes.STRING },  // TODO: Should we have a default of empty string?? That's what we want null to do.
    status:      { type: DataTypes.ENUM('ACTIVE', 'DELETED'), defaultValue: 'ACTIVE', allowNull: false },
    isDefault:   { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false, field: 'is_default' },
    createdAt:   { type: DataTypes.DATE, allowNull: false, field: 'created_at' },
    updatedAt:   { type: DataTypes.DATE, allowNull: false, field: 'updated_at' },
  }, {
    timestamps : false, // TODO: Breaks the sequelize association
    tableName: 'users_locations',
    freezeTableName: true,
    underscored: true
  });
  UserLocation.associate = function(models) {
    // associations can be defined here
  };
  return UserLocation;
};
