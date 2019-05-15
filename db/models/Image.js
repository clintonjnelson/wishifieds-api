'use strict';
module.exports = (sequelize, DataTypes) => {
  // Table name will match the definition name here
  var Image = sequelize.define('Image', {
    origurl:    { type: DataTypes.STRING },
    url:        { type: DataTypes.STRING },
    position:   { type: DataTypes.INTEGER },
    listingId:  { type: DataTypes.INTEGER, field: 'listing_id' },
    userId:     { type: DataTypes.INTEGER, field: 'user_id' },
    createdAt:  { type: DataTypes.DATE, field: 'created_at' }, // Null ok here, PG will set them itself
    updatedAt:  { type: DataTypes.DATE, field: 'updated_at' }, // Null ok here, PG will set them itself
    status:     { type: DataTypes.ENUM('ACTIVE', 'DELETED'), defaultValue: 'ACTIVE' },
  }, {
    timestamps : true,
    tableName: 'images',
    freezeTableName: true
  });
  Image.associate = function(models) {
    // associations can be defined here
  };
  return Image;
};
