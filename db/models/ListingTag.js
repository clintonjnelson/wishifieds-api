'use strict';
module.exports = (sequelize, DataTypes) => {
  // Table name will match the definition name here
  var ListingTag = sequelize.define('ListingTag', {
    listingId: { type: DataTypes.INTEGER, field: 'listing_id' },
    tagId:     { type: DataTypes.INTEGER, field: 'tag_id' },
    createdAt: { type: DataTypes.DATE, field: 'created_at' },  // Null ok here, PG will set them itself
    updatedAt: { type: DataTypes.DATE, field: 'updated_at' }   // Null ok here, PG will set them itself
  }, {
    timestamps: true, // TODO: "true" Breaks the sequelize association. VERIFY IF STILL DOES.
    tableName: 'listings_tags',
    freezeTableName: true,
    underscored: true
  });
  ListingTag.associate = function(models) {
    // associations can be defined here
  };
  return ListingTag;
};
