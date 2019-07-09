'use strict';
const Sequelize = require('sequelize');
// const Image     = Sequelize.import('./image.js');
// const User      = Sequelize.import('./user.js');

module.exports = (sequelize, DataTypes) => {
  // Table name will match the definition name here
  var Listing = sequelize.define('Listing', {
    title:          { type: DataTypes.STRING },
    description:    { type: DataTypes.STRING },
    price:          { type: DataTypes.STRING },
    linkUrl:        { type: DataTypes.STRING, field: 'link_url' },
    userLocationId: { type: DataTypes.INTEGER, field: 'user_location_id' },  // FK constraint someday
    heroImg:        { type: DataTypes.STRING,  field: 'hero_img' },
    userId:         { type: DataTypes.INTEGER, field: 'user_id' },  // FK
    slug:           { type: DataTypes.STRING },   // Someday will populate
    status:         { type: DataTypes.ENUM('ACTIVE', 'PRIVATE', 'INACTIVE', 'DELETED') },   // ENUM
    createdAt:      { type: DataTypes.DATE, field: 'created_at' }, // Null ok here, PG will set them itself
    updatedAt:      { type: DataTypes.DATE, field: 'updated_at' }  // Null ok here, PG will set them itself
  }, {
    timestamps : true,
    tableName: 'listings',
    freezeTableName: true
  });
  // Listing.associate = function(models) {
  //   // associations can be defined here
  // };
  // Listing.hasMany(Image, {foreignKey: 'listing_id', sourceKey: 'id'});
  // Listing.belongsTo(User, { foreignKey: 'user_id'});
  return Listing;
};
