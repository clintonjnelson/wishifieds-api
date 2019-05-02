'use strict';
module.exports = (sequelize, DataTypes) => {
  var Location = sequelize.define('Location', {
    description:  { type: DataTypes.STRING, allowNull: true },
    geometry:     { type: DataTypes.GEOMETRY('POINT', 4326), allowNull: false },
    geometrytype: { type: DataTypes.STRING, allowNull: false, defaultValue: 'POINT', },
    postal:       { type: DataTypes.STRING, allowNull: true },
    createdAt:    { type: Sequelize.DATE, allowNull: false },
    updatedAt:    { type: Sequelize.DATE, allowNull: false }
  }, {});
  Location.associate = function(models) {
    // associations can be defined here
  };
  return Location;
};
