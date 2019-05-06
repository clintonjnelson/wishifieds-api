'use strict';

module.exports = function (sequelize, DataTypes) {
  // Table name will match the definition name here
  var Log = sequelize.define('Log', {
    logType: { type: DataTypes.STRING, field: 'log_type' },
    createdAt:   { type: DataTypes.DATE, allowNull: false, field: 'created_at' },
    updatedAt:   { type: DataTypes.DATE, allowNull: false, field: 'updated_at' },
  }, {
    timestamps : true,
    tableName: 'logs',
    freezeTableName: true
  });

  Log.associate = function(models) {
    // associations can be defined here
  };

  return Log;
};
