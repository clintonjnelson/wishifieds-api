'use strict';
module.exports = (sequelize, DataTypes) => {
  // Table name will match the definition name here
  var Category = sequelize.define('Category', {
    name: DataTypes.STRING,
    icon: DataTypes.STRING,
    createdAt:   { type: DataTypes.DATE, allowNull: false, field: 'created_at' },
    updatedAt:   { type: DataTypes.DATE, allowNull: false, field: 'updated_at' },
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
