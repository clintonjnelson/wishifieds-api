'use strict';
const Sequelize = require('sequelize');
// const Image     = Sequelize.import('./image.js');
// const User      = Sequelize.import('./user.js');

module.exports = (sequelize, DataTypes) => {
  // Table name will match the definition name here
  var Listing = sequelize.define('Listing', {
    categoryId:     { type: DataTypes.INTEGER, field: 'category_id' },  // FK
    conditionId:    { type: DataTypes.INTEGER, field: 'condition_id' },  // FK
    title:          { type: DataTypes.STRING },
    description:    { type: DataTypes.STRING },
    price:          { type: DataTypes.STRING },
    linkUrl:        { type: DataTypes.STRING },
    keywords:       { type: DataTypes.STRING },
    userLocationId: { type: DataTypes.INTEGER, field: 'user_location_id' },  // FK constraint someday
    heroImg:        { type: DataTypes.STRING,  field: 'hero_img' },
    // imagesRef:    { type: DataTypes.STRING, field: 'images_ref' },   // Intended to be a reference to where storied in AWS
    userId:         { type: DataTypes.INTEGER, field: 'user_id' },  // FK
    slug:           { type: DataTypes.STRING },   // Someday will populate
    status:         { type: DataTypes.ENUM('ACTIVE', 'PRIVATE', 'INACTIVE', 'DELETED') },   // ENUM
    createdAt:      { type: DataTypes.DATE, field: 'created_at' },
    updatedAt:      { type: DataTypes.DATE, field: 'updated_at' }
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
