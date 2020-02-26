'use strict';
module.exports = (sequelize, DataTypes) => {

  // Table name will match the definition name here
  var Badge = sequelize.define('Badge', {
    userId:    { type: DataTypes.INTEGER, allowNull: false, field: 'user_id' },  // FK
    refId:     { type: DataTypes.STRING, allowNull: true, field: 'ref_id' }, // used for provider's ID (eg: facebook profile ID)
    badgeType: { type: DataTypes.ENUM('FACEBOOK'), allowNull: false, field: 'badge_type' },
    linkUrl:   { type: DataTypes.STRING, field: 'link_url' },
    status:    { type: DataTypes.ENUM('ACTIVE', 'INACTIVE', 'DELETED'), defaultValue: "ACTIVE" },
    createdAt: { type: DataTypes.DATE, field: 'created_at' }, // Null ok here, PG will set them itself
    updatedAt: { type: DataTypes.DATE, field: 'updated_at' }, // Null ok here, PG will set them itself
  }, {
    timestamps : true,
    tableName: 'badges',
    freezeTableName: true,
    underscored: true
  });

  Badge.associate = function(models) {
    // associations can be defined here
  };

  return Badge;
};
