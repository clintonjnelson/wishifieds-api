'use strict';

module.exports = function (sequelize, DataTypes) {
  // Table name will match the definition name here
  var Log = sequelize.define('Log', {
    logType: { type: DataTypes.STRING, field: 'log_type' },
    createdAt:   { type: DataTypes.DATE, field: 'created_at' },  // Null ok here, PG will set them itself
    updatedAt:   { type: DataTypes.DATE, field: 'updated_at' },  // Null ok here, PG will set them itself
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
