'use strict';
module.exports = (sequelize, DataTypes) => {
  var Location = sequelize.define('Location', {
    description:   { type: DataTypes.STRING, allowNull: true },
    geography:     { type: DataTypes.GEOGRAPHY('POINT', 4326), allowNull: false },
    geographytype: { type: DataTypes.STRING, allowNull: false, defaultValue: 'POINT' },
    postal:        { type: DataTypes.STRING, allowNull: true },
    city:          { type: DateTypes.STRING, allowNull: true },
    state:         { type: DateTypes.STRING, allowNull: true },
    stateCode:     { type: DateTypes.STRING, allowNull: true, field: 'state_code' },  // Update to ENUM later
    countryCode:   { type: DateTypes.STRING, allowNull: true, field: 'country_code', defaultValue: 'US' },  // Probably ENUM. Default is bad here, but makes sense now.
    createdAt:     { type: DataTypes.DATE, field: 'created_at'  }, // Null ok here, PG will set them itself
    updatedAt:     { type: DataTypes.DATE, field: 'updated_at'  }  // Null ok here, PG will set them itself
  }, {
    timestamps : false,
    tableName: 'locations',
    freezeTableName: true,
    underscored: true
  });
  Location.associate = function(models) {
    // associations can be defined here
  };
  return Location;
};
