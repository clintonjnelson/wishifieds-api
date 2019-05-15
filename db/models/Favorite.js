'use strict';
module.exports = (sequelize, DataTypes) => {
  // Table name will match the definition name here
  var Favorite = sequelize.define('Favorite', {
    userId:     { type: DataTypes.INTEGER, allowNull: false, field: 'user_id' },
    listingId:  { type: DataTypes.INTEGER, allowNull: false, field: 'listing_id' },
    status:     { type: DataTypes.ENUM('ACTIVE', 'DELETED'), defaultValue: 'ACTIVE' },
    createdAt:  { type: DataTypes.DATE, field: 'created_at' }, // Null ok here, PG will set them itself
    updatedAt:  { type: DataTypes.DATE, field: 'updated_at' }, // Null ok here, PG will set them itself
  }, {
    timestamps : true,
    tableName: 'favorites',
    freezeTableName: true
  });

  Favorite.associate = function(models) {
    // associations can be defined here
  };
  return Favorite;
};
