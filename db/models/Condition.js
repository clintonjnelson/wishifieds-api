'use strict';
module.exports = (sequelize, DataTypes) => {

  // Table name will match the definition name here
  var Condition = sequelize.define('Condition', {
    name: DataTypes.STRING,
    icon: DataTypes.STRING,
    createdAt:   { type: DataTypes.DATE, allowNull: false, field: 'created_at' },
    updatedAt:   { type: DataTypes.DATE, allowNull: false, field: 'updated_at' },
  }, { timestamps : true });

  Condition.associate = function(models) {
    // associations can be defined here
  };

  return Condition;
};
