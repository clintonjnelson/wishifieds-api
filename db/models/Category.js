'use strict';
module.exports = (sequelize, DataTypes) => {
  // Table name will match the definition name here
  var Category = sequelize.define('Category', {
    name: DataTypes.STRING,
    icon: DataTypes.STRING,
    createdAt:   { type: DataTypes.DATE, field: 'created_at' }, // Null ok here, PG will set them itself
    updatedAt:   { type: DataTypes.DATE, field: 'updated_at' }, // Null ok here, PG will set them itself
  }, {
    timestamps : true,
    tableName: 'categories',
    freezeTableName: true
  });
  Category.associate = function(models) {
    // associations can be defined here
  };
  return Category;
};
