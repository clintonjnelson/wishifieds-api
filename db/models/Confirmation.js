'use strict';
module.exports = (sequelize, DataTypes) => {

  // Table name will match the definition name here
  var Confirmation = sequelize.define('Confirmation', {
    userId:    { type: DataTypes.INTEGER, allowNull: true, field: 'user_id' },  // FK
    url:       { type: DataTypes.STRING, allowNull: false},
    confirmationCode: { type: DataTypes.STRING, allowNull: true, field: 'confirmation_code' },
    status:    { type: DataTypes.ENUM('SUCCESS', 'FAILED', 'UNKNOWN', 'PENDING'), allowNull: true },
    createdAt: { type: DataTypes.DATE, field: 'created_at' }, // Null ok here, PG will set them itself
    updatedAt: { type: DataTypes.DATE, field: 'updated_at' }, // Null ok here, PG will set them itself
  }, {
    timestamps : true,
    tableName: 'confirmations',
    freezeTableName: true,
    underscored: true
  });

  Confirmation.associate = function(models) {
    // associations can be defined here
  };

  return Confirmation;
};
