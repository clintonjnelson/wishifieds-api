'use strict';
module.exports = (sequelize, DataTypes) => {

  // Table name will match the definition name here
  var Tag = sequelize.define('Tag', {
    name: DataTypes.STRING,
    tagType:   { type: DataTypes.ENUM('CATEGORY', 'CONDITION', 'CUSTOM'), defaultValue: 'CUSTOM', allowNull: false, field: 'tag_type' },
    createdAt: { type: DataTypes.DATE, field: 'created_at' }, // Null ok here, PG will set them itself
    updatedAt: { type: DataTypes.DATE, field: 'updated_at' }, // Null ok here, PG will set them itself
  }, {
    timestamps : true,
    tableName: 'tags',
    freezeTableName: true,
    underscored: true
  });

  Tag.associate = function(models) {
    // associations can be defined here
  };

  return Tag;
};
