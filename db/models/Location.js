'use strict';
module.exports = (sequelize, DataTypes) => {
  var Location = sequelize.define('Location', {
    description:   { type: DataTypes.STRING, allowNull: true },
    geography:     { type: DataTypes.GEOGRAPHY('POINT', 4326), allowNull: false },
    geographytype: { type: DataTypes.STRING, allowNull: false, defaultValue: 'POINT' },
    postal:        { type: DataTypes.STRING, allowNull: true },
    city:          { type: DataTypes.STRING, allowNull: true },
    state:         { type: DataTypes.STRING, allowNull: true },
    stateCode:     { type: DataTypes.STRING, allowNull: true, field: 'state_code' },  // Update to ENUM later
    countryCode:   { type: DataTypes.STRING, allowNull: true, field: 'country_code', defaultValue: 'US' },  // Probably ENUM. Default is bad here, but makes sense now.
    locationType:  { type: DataTypes.ENUM('POSTALCODE', 'LISTING', 'CUSTOM'), field: 'location_type', defaultValue: 'CUSTOM' },  // Probably ENUM. Default is bad here, but makes sense now.
    createdAt:     { type: DataTypes.DATE, field: 'created_at'  }, // Null ok here, PG will set them itself
    updatedAt:     { type: DataTypes.DATE, field: 'updated_at'  }  // Null ok here, PG will set them itself
  }, {
    timestamps : true,
    tableName: 'locations',
    freezeTableName: true,
    underscored: true
  });
  Location.associate = function(models) {
    // associations can be defined here
  };
  return Location;
};
