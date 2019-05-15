'use strict';
module.exports = (sequelize, DataTypes) => {

  // Table name will match the definition name here
  var Condition = sequelize.define('Condition', {
    name: DataTypes.STRING,
    icon: DataTypes.STRING,
    createdAt:   { type: DataTypes.DATE, field: 'created_at' }, // Null ok here, PG will set them itself
    updatedAt:   { type: DataTypes.DATE, field: 'updated_at' }, // Null ok here, PG will set them itself
  }, {
    timestamps : true,
    tableName: 'conditions',
    freezeTableName: true
  });

  Condition.associate = function(models) {
    // associations can be defined here
  };

  return Condition;
};
