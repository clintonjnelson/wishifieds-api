'use strict';
module.exports = (sequelize, DataTypes) => {
  // Table name will match the definition name here
  var UserLocation = sequelize.define('UserLocation', {
    userId:      { type: DataTypes.INTEGER, allowNull: false, field: 'user_id' },
    locationId:  { type: DataTypes.INTEGER, allowNull: false, field: 'location_id' },
    description: { type: DataTypes.STRING },  // TODO: Should we have a default of empty string?? That's what we want null to do.
    status:      { type: DataTypes.ENUM('ACTIVE', 'DELETED'), defaultValue: 'ACTIVE', allowNull: false },
    isDefault:   { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false, field: 'is_default' },
    createdAt:   { type: DataTypes.DATE, field: 'created_at' },  // Null ok here, PG will set them itself
    updatedAt:   { type: DataTypes.DATE, field: 'updated_at' },  // Null ok here, PG will set them itself
  }, {
    timestamps: true, // TODO: "true" Breaks the sequelize association. VERIFY IF STILL DOES.
    tableName: 'users_locations',
    freezeTableName: true,
    underscored: true
  });
  UserLocation.associate = function(models) {
    // associations can be defined here
  };
  return UserLocation;
};
