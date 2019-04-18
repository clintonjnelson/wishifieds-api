'use strict';
module.exports = (sequelize, DataTypes) => {
  var Favorite = sequelize.define('Favorite', {
    userId:    { type: DataTypes.INTEGER, allowNull: false, field: 'user_id' },
    listingId: { type: DataTypes.INTEGER, allowNull: false, field: 'listing_id' },
    status:     { type: DataTypes.ENUM('ACTIVE', 'DELETED'), defaultValue: 'ACTIVE' },
    createdAt:  { type: DataTypes.DATE, allowNull: false, field: 'created_at' },
    updatedAt:  { type: DataTypes.DATE, allowNull: false, field: 'updated_at' },
  }, {});
  Favorite.associate = function(models) {
    // associations can be defined here
  };
  return Favorite;
};
