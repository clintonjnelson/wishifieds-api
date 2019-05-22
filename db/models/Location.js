'use strict';
module.exports = (sequelize, DataTypes) => {
  var Location = sequelize.define('Location', {
    description:   { type: DataTypes.STRING, allowNull: true },
    geography:     { type: DataTypes.GEOGRAPHY('POINT', 4326), allowNull: false },
    geographytype: { type: DataTypes.STRING, allowNull: false, defaultValue: 'POINT' },
    postal:        { type: DataTypes.STRING, allowNull: true },
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
