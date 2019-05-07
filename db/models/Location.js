'use strict';
module.exports = (sequelize, DataTypes) => {
  var Location = sequelize.define('Location', {
    description:  { type: DataTypes.STRING, allowNull: true },
    geometry:     { type: DataTypes.GEOMETRY('POINT', 4326), allowNull: false },
    geometrytype: { type: DataTypes.STRING, allowNull: false, defaultValue: 'POINT' },
    postal:       { type: DataTypes.STRING, allowNull: true },
    createdAt:    { type: DataTypes.DATE, allowNull: false, field: 'created_at'  },
    updatedAt:    { type: DataTypes.DATE, allowNull: false, field: 'updated_at'  }
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
